// ============================================
// UNIFIED BUSINESS GUARDIAN API ROUTE
// ============================================
// POST /api/business
// Routes requests to appropriate agent and synthesizes with Business Guardian

import { NextRequest, NextResponse } from "next/server";
import { 
  analyzeVisaDocuments, 
  analyzeContract, 
    Scam, 
  planTrip,
  synthesizeBusinessResponse,
  optimizeForVoice
} from "@/lib/agents/business";
import { createClient } from "@supabase/supabase-js";
import type { 
  VisaLensInput, 
  LegalLensInput, 
  ScamShieldInput, 
  TripGuardInput,
  BusinessGuardianInput,
  BusinessGuardianOutput
} from "@/types/business";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      analysisType,
      userQuery,
      userId,
      outputFormat = "full",
      ...analysisInput
    } = body;
    
    if (!analysisType) {
      return NextResponse.json(
        { error: "analysisType is required (visa, legal, scam, or trip)" },
        { status: 400 }
      );
    }
    
    let analysisResult: BusinessGuardianInput["analysisResults"];
    
    // Route to appropriate agent
    switch (analysisType) {
      case "visa": {
        const visaInput: VisaLensInput = {
          documents: analysisInput.documents || [],
          destinationCountry: analysisInput.destinationCountry,
          passportCountry: analysisInput.passportCountry,
          travelDate: analysisInput.travelDate,
          tripPurpose: analysisInput.tripPurpose,
          tripDuration: analysisInput.tripDuration,
        };
        
        if (!visaInput.destinationCountry || !visaInput.passportCountry) {
          return NextResponse.json(
            { error: "destinationCountry and passportCountry are required for visa analysis" },
            { status: 400 }
          );
        }
        
        const visaResult = await analyzeVisaDocuments(visaInput);
        analysisResult = {
          visa: visaResult,
        };
        break;
      }
      
      case "legal": {
        const legalInput: LegalLensInput = {
          documentText: analysisInput.documentText,
          documentContent: analysisInput.documentContent,
          documentMimeType: analysisInput.documentMimeType,
          documentFilename: analysisInput.documentFilename,
          documentType: analysisInput.documentType || "contract",
          focusAreas: analysisInput.focusAreas,
        };
        
        if (!legalInput.documentText && !legalInput.documentContent) {
          return NextResponse.json(
            { error: "documentText or documentContent is required for legal analysis" },
            { status: 400 }
          );
        }
        
        const legalResult = await analyzeContract(legalInput);
        analysisResult = {
          legal: legalResult,
        };
        break;
      }
      
      case "scam": {
        const scamInput: ScamShieldInput = {
          content: analysisInput.emailText || analysisInput.invoiceText || analysisInput.content || "",
          contentType: analysisInput.contentType || "email",
          emailText: analysisInput.emailText,
          emailContent: analysisInput.emailContent,
          emailMimeType: analysisInput.emailMimeType,
          invoiceText: analysisInput.invoiceText,
          invoiceContent: analysisInput.invoiceContent,
          invoiceMimeType: analysisInput.invoiceMimeType,
          claimedSender: analysisInput.claimedSender,
          claimedAmount: analysisInput.claimedAmount,
        };
        
        if (!scamInput.emailText && !scamInput.emailContent && 
            !scamInput.invoiceText && !scamInput.invoiceContent) {
          return NextResponse.json(
            { error: "Email or invoice content is required for scam analysis" },
            { status: 400 }
          );
        }
        
        const scamResult = await   Scam(scamInput);
        analysisResult = {
          scam: scamResult,
        };
        break;
      }
      
      case "trip": {
        const tripInput: TripGuardInput = {
          passportCountry: analysisInput.passportCountry,
          stops: analysisInput.stops || [],
          startDate: analysisInput.startDate,
          preferences: analysisInput.preferences,
        };
        
        if (!tripInput.passportCountry) {
          return NextResponse.json(
            { error: "passportCountry is required for trip planning" },
            { status: 400 }
          );
        }
        
        if (!tripInput.stops || tripInput.stops.length === 0) {
          return NextResponse.json(
            { error: "At least one stop is required for trip planning" },
            { status: 400 }
          );
        }
        
        const tripResult = await planTrip(tripInput);
        analysisResult = {
          trip: tripResult,
        };
        break;
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown analysis type: ${analysisType}` },
          { status: 400 }
        );
    }
    
    // Build Business Guardian input
    const guardianInput: BusinessGuardianInput = {
      analysisType,
      analysisResults: analysisResult,
      userQuery,
      outputFormat,
    };
    
    // Synthesize response with Business Guardian
    const synthesizedResponse: BusinessGuardianOutput = await synthesizeBusinessResponse(guardianInput);
    
    // Generate voice-optimized version if needed
    let voiceResponse: string | undefined;
    if ((outputFormat === "voice" || body.includeVoice) && synthesizedResponse.response) {
      voiceResponse = optimizeForVoice(synthesizedResponse.response);
    }
    
    // Save interaction to database if user is logged in
    if (userId) {
      await supabase.from("business_interactions").insert({
        user_id: userId,
        analysis_type: analysisType,
        user_query: userQuery || null,
        analysis_input: analysisInput,
        analysis_result: analysisResult,
        synthesized_response: synthesizedResponse.response,
        action_items: synthesizedResponse.actionItems,
      });
    }
    
    return NextResponse.json({
      analysisType,
      rawAnalysis: analysisResult,
      synthesizedResponse,
      voiceResponse,
    });
  } catch (error) {
    console.error("[BUSINESS GUARDIAN API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process business request" },
      { status: 500 }
    );
  }
}

// GET endpoint to get available analysis types and their requirements
export async function GET() {
  return NextResponse.json({
    analysisTypes: {
      visa: {
        name: "VisaLens",
        description: "Document validation and visa requirements analysis",
        requiredFields: ["destinationCountry", "passportCountry"],
        optionalFields: ["documents", "travelDate", "tripPurpose", "tripDuration"],
      },
      legal: {
        name: "LegalLens",
        description: "Contract analysis and red flag   ion",
        requiredFields: ["documentText OR documentContent"],
        optionalFields: ["documentType", "focusAreas"],
      },
      scam: {
        name: "B2B ScamShield",
        description: "Business fraud   ion for emails and invoices",
        requiredFields: ["emailText OR invoiceText OR emailContent OR invoiceContent"],
        optionalFields: ["contentType", "claimedSender", "claimedAmount"],
      },
      trip: {
        name: "TripGuard",
        description: "Multi-city travel planning with visa requirements",
        requiredFields: ["passportCountry", "stops"],
        optionalFields: ["startDate", "preferences"],
      },
    },
    outputFormats: ["full", "summary", "voice"],
    version: "1.0.0",
    poweredBy: "Diaspora AI",
  });
}
