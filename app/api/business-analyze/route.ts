// API Route: /api/business-analyze
// Auto-detect document/image type and route to appropriate business agent
// Supports: Visa documents, Contracts, Scam emails/invoices, Trip itineraries

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  analyzeVisaDocuments, 
  analyzeContract, 
  detectScam, 
  planTrip,
  synthesizeBusinessResponse,
  optimizeForVoice
} from "@/lib/agents/business";
import type { 
  VisaLensInput, 
  LegalLensInput, 
  ScamShieldInput, 
  TripGuardInput,
  BusinessGuardianInput,
  BusinessGuardianOutput
} from "@/types/business";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type DocumentType = "visa" | "legal" | "scam" | "trip" | "unknown";

interface DetectionResult {
  type: DocumentType;
  confidence: number;
  reasoning: string;
  extractedText?: string;
  extractedData?: Record<string, unknown>;
}

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[BUSINESS-ANALYZE ${timestamp}] ${message}`, data !== undefined ? data : "");
}

function logError(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[BUSINESS-ANALYZE ERROR ${timestamp}] ${message}`, data !== undefined ? data : "");
}

// Auto-detect document type using Gemini Vision
async function detectDocumentType(
  imageData: string, 
  mimeType: string,
  textContent?: string
): Promise<DetectionResult> {
  log("Auto-detecting document type...");
  
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  
  const prompt = `Analyze this document/image and determine what type of business document it is.

CATEGORIES (choose ONE):
1. "visa" - Passport, visa stamps, travel documents, immigration papers, entry permits, passport photos
2. "legal" - Legal contracts, agreements, terms of service, NDAs, employment contracts, lease agreements
3. "scam" - Suspicious emails, phishing attempts, fake invoices, fraudulent payment requests, scam messages
4. "trip" - Travel itineraries, flight bookings, hotel reservations, trip plans, travel schedules
5. "unknown" - Cannot determine or doesn't fit any category

Respond in this exact JSON format:
{
  "type": "visa|legal|scam|trip|unknown",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this classification",
  "extractedText": "Key text extracted from the document",
  "extractedData": {
    "relevant": "structured data from the document"
  }
}

For visa documents, extract: passport country, destination country, visa type, expiry dates
For legal documents (contracts), extract: parties involved, key terms, dates, amounts
For scam content, extract: claimed sender, urgency indicators, suspicious elements
For trip content, extract: destinations, dates, stops

Only respond with valid JSON, no additional text.`;

  try {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageData,
        },
      });
    }
    
    if (textContent) {
      parts.push({ text: `Additional context/text:\n${textContent}` });
    }
    
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const response = result.response.text();
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      log("Document type detected:", parsed.type);
      log("Confidence:", parsed.confidence);
      return parsed as DetectionResult;
    }
    
    throw new Error("Could not parse detection response");
  } catch (error) {
    logError("Document detection failed:", error);
    return {
      type: "unknown",
      confidence: 0,
      reasoning: "Failed to analyze document",
    };
  }
}

// Generate a markdown response for unknown documents
function generateUnknownResponse(detection: DetectionResult): string {
  return `## 🔍 Document Analysis

I've analyzed your document but couldn't classify it into one of my specialized categories.

**What I found:** ${detection.reasoning}

### What I Can Help With:
- 🛂 **Visa & Travel Documents** - Passport analysis, visa requirements, immigration papers
- 📝 **Contracts & Legal Documents** - Agreement review, red flag detection, terms analysis
- 🚨 **Scam Detection** - Phishing emails, fake invoices, fraudulent messages
- ✈️ **Trip Planning** - Multi-city itineraries, travel logistics

**Try uploading:**
- A clearer image of the document
- A screenshot of the specific content you want analyzed
- Or describe what you need help with in the chat

I'm here to help protect you in business! 💼`;
}

export async function POST(request: NextRequest) {
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("Business analyze request received");

  try {
    const body = await request.json();
    const { 
      imageData, 
      mimeType = "image/jpeg",
      textContent,
      userId,
      includeVoice = true
    } = body;

    log("Request details:", { 
      hasImage: !!imageData, 
      hasText: !!textContent,
      mimeType,
      userId
    });

    // Validate input
    if (!imageData && !textContent) {
      logError("No content provided");
      return NextResponse.json(
        { error: "No content provided. Send imageData or textContent." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      logError("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    // Step 1: Auto-detect document type
    const detection = await detectDocumentType(imageData, mimeType, textContent);
    log(`Detection complete: ${detection.type} (${(detection.confidence * 100).toFixed(0)}% confidence)`);

    // Handle unknown documents
    if (detection.type === "unknown" || detection.confidence < 0.3) {
      const unknownResponse = generateUnknownResponse(detection);
      return NextResponse.json({
        success: true,
        detectedType: "unknown",
        detection,
        response: unknownResponse,
        voiceResponse: includeVoice ? optimizeForVoice(unknownResponse) : undefined,
        timing: { totalMs: Date.now() - startTime },
      });
    }

    // Step 2: Route to appropriate agent based on detected type
    let analysisResult: BusinessGuardianInput["analysisResults"];
    
    switch (detection.type) {
      case "visa": {
        log("Routing to VisaLens agent...");
        const visaInput: VisaLensInput = {
          documents: imageData ? [{
            content: imageData,
            mimeType,
            filename: "uploaded_document",
          }] : [],
          destinationCountry: detection.extractedData?.destinationCountry as string || "Unknown",
          passportCountry: detection.extractedData?.passportCountry as string || "Unknown",
          travelDate: detection.extractedData?.travelDate as string,
          tripPurpose: (detection.extractedData?.tripPurpose as "business" | "tourism" | "work" | "transit" | "study" | "medical") || "tourism",
        };
        
        const visaResult = await analyzeVisaDocuments(visaInput);
        analysisResult = { visa: visaResult };
        break;
      }
      
      case "legal": {
        log("Routing to LegalLens agent...");
        const legalInput: LegalLensInput = {
          documentText: detection.extractedText || textContent,
          documentContent: imageData,
          documentMimeType: mimeType,
          documentFilename: "uploaded_contract",
          documentType: "contract",
        };
        
        const legalResult = await analyzeContract(legalInput);
        analysisResult = { legal: legalResult };
        break;
      }
      
      case "scam": {
        log("Routing to ScamShield agent...");
        const scamInput: ScamShieldInput = {
          content: detection.extractedText || textContent || "",
          contentType: detection.extractedData?.isInvoice ? "invoice" : "email",
          emailText: !detection.extractedData?.isInvoice ? (detection.extractedText || textContent) : undefined,
          emailContent: !detection.extractedData?.isInvoice ? imageData : undefined,
          emailMimeType: !detection.extractedData?.isInvoice ? mimeType : undefined,
          invoiceText: detection.extractedData?.isInvoice ? (detection.extractedText || textContent) : undefined,
          invoiceContent: detection.extractedData?.isInvoice ? imageData : undefined,
          invoiceMimeType: detection.extractedData?.isInvoice ? mimeType : undefined,
          claimedSender: detection.extractedData?.sender as string,
          claimedAmount: detection.extractedData?.amount as number,
        };
        
        const scamResult = await detectScam(scamInput);
        analysisResult = { scam: scamResult };
        break;
      }
      
      case "trip": {
        log("Routing to TripGuard agent...");
        // Map extracted stops to include required 'purpose' field
        const extractedStops = (detection.extractedData?.stops as Array<{
          country: string;
          city?: string;
          duration?: number;
          purpose?: string;
        }>) || [];
        
        const tripInput: TripGuardInput = {
          passportCountry: detection.extractedData?.passportCountry as string || "Unknown",
          stops: extractedStops.map(stop => ({
            country: stop.country,
            city: stop.city,
            duration: stop.duration,
            purpose: (stop.purpose as "tourism" | "business" | "transit" | "work" | "study" | "medical") || "tourism",
          })),
          startDate: detection.extractedData?.startDate as string,
        };
        
        const tripResult = await planTrip(tripInput);
        analysisResult = { trip: tripResult };
        break;
      }
      
      default:
        throw new Error(`Unexpected document type: ${detection.type}`);
    }

    // Step 3: Synthesize with Business Guardian
    log("Synthesizing response with Business Guardian...");
    const guardianInput: BusinessGuardianInput = {
      analysisType: detection.type,
      analysisResults: analysisResult,
      outputFormat: "full",
    };
    
    const synthesizedResponse: BusinessGuardianOutput = await synthesizeBusinessResponse(guardianInput);
    
    // Generate voice version
    let voiceResponse: string | undefined;
    if (includeVoice && synthesizedResponse.response) {
      voiceResponse = optimizeForVoice(synthesizedResponse.response);
    }

    const totalTime = Date.now() - startTime;
    log(`Analysis complete in ${totalTime}ms`);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      detectedType: detection.type,
      detection,
      rawAnalysis: analysisResult,
      synthesizedResponse,
      response: synthesizedResponse.response,
      actionItems: synthesizedResponse.actionItems,
      voiceResponse,
      timing: { totalMs: totalTime },
    });

  } catch (error) {
    logError("Business analysis failed:", error);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return NextResponse.json(
      { 
        error: "Analysis failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
