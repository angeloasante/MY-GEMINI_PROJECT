// ============================================
// VISALENS AGENT - Document Validator
// Analyzes travel documents against visa requirements
// ============================================

import { GoogleGenAI } from "@google/genai";
import {
  VisaLensInput,
  VisaLensOutput,
  AnalyzedDocument,
  ChecklistItem,
  VisaRequirements,
  DocumentType,
  Issue,
} from "@/types/business";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ============================================
// DIASPORA AI VISA API INTEGRATION
// ============================================

export async function getVisaRequirements(
  nationality: string,
  destination: string,
  purpose?: string
): Promise<VisaRequirements> {
  const apiKey = process.env.DIASPORA_AI_VISA_API_KEY;
  
  // If no API key, return mock data for development
  if (!apiKey) {
    console.log("[VisaLens] No DA API key, using fallback requirements");
    return getFallbackRequirements(nationality, destination);
  }

  try {
    const response = await fetch("https://api.diasporaai.dev/v1/visa/requirements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        nationality,
        destination,
        purpose: purpose || "tourism",
      }),
    });

    if (!response.ok) {
      console.warn("[VisaLens] DA API error, using fallback:", response.status);
      return getFallbackRequirements(nationality, destination);
    }

    const data = await response.json();
    
    return {
      source: "Diaspora AI API",
      visaRequired: data.visaRequired ?? true,
      visaType: data.visaType || "Standard Visitor Visa",
      processingDays: data.processingDays || 15,
      financialThreshold: data.financialThreshold || "Varies by country",
      documentsRequired: data.requirements || [
        "passport",
        "bank_statement",
        "employment_letter",
        "photo",
      ],
      applicationUrl: data.applicationUrl,
      fees: data.fees,
      additionalRequirements: data.additionalRequirements,
    };
  } catch (error) {
    console.error("[VisaLens] DA API error:", error);
    return getFallbackRequirements(nationality, destination);
  }
}

function getFallbackRequirements(
  nationality: string,
  destination: string
): VisaRequirements {
  // Common visa requirements fallback
  const commonRequirements = {
    source: "Diaspora AI API" as const,
    visaRequired: true,
    processingDays: 15,
    financialThreshold: "Sufficient funds for duration of stay",
    documentsRequired: [
      "Valid passport (6+ months validity)",
      "Bank statements (3-6 months)",
      "Employment letter or business documents",
      "Passport-sized photos",
      "Travel itinerary",
      "Accommodation proof",
    ],
  };

  // Destination-specific requirements
  const destinationRequirements: Record<string, Partial<VisaRequirements>> = {
    GB: {
      visaType: "Standard Visitor Visa",
      processingDays: 15,
      financialThreshold: "£1,890 per month of stay",
      documentsRequired: [
        ...commonRequirements.documentsRequired,
        "TB test certificate (if applicable)",
        "Cover letter explaining purpose",
      ],
      fees: { amount: 115, currency: "GBP" },
    },
    US: {
      visaType: "B1/B2 Visitor Visa",
      processingDays: 30,
      financialThreshold: "Evidence of strong ties to home country",
      documentsRequired: [
        ...commonRequirements.documentsRequired,
        "DS-160 confirmation",
        "Interview appointment",
        "Evidence of ties to home country",
      ],
      fees: { amount: 185, currency: "USD" },
    },
    CA: {
      visaType: "Temporary Resident Visa",
      processingDays: 20,
      financialThreshold: "CAD 1,000/month plus return ticket",
      documentsRequired: [
        ...commonRequirements.documentsRequired,
        "Biometrics appointment",
        "Purpose of travel letter",
      ],
      fees: { amount: 100, currency: "CAD" },
    },
    // Schengen countries
    FR: { visaType: "Schengen Visa (France)", processingDays: 15, fees: { amount: 80, currency: "EUR" } },
    DE: { visaType: "Schengen Visa (Germany)", processingDays: 15, fees: { amount: 80, currency: "EUR" } },
    IT: { visaType: "Schengen Visa (Italy)", processingDays: 15, fees: { amount: 80, currency: "EUR" } },
    ES: { visaType: "Schengen Visa (Spain)", processingDays: 15, fees: { amount: 80, currency: "EUR" } },
    // UAE - visa on arrival for many
    AE: {
      visaRequired: false,
      visaType: "Visa on Arrival",
      processingDays: 0,
      financialThreshold: "None specified",
      documentsRequired: ["Valid passport", "Return ticket"],
      fees: { amount: 0, currency: "AED" },
    },
  };

  return {
    ...commonRequirements,
    visaType: "Tourist Visa",
    ...destinationRequirements[destination],
  };
}

// ============================================
// DOCUMENT EXTRACTION PROMPTS
// ============================================

const DOCUMENT_EXTRACTION_PROMPT = `You are a document analysis expert for visa applications. Analyze the uploaded document and extract all relevant information.

Determine the document type and extract the following based on type:

**For PASSPORT:**
- Full name (as printed)
- Passport number
- Nationality
- Date of birth
- Expiry date
- Issue date
- Gender
- Place of birth
- Issuing authority

**For BANK STATEMENT:**
- Account holder name
- Bank name
- Account number (partial/masked is fine)
- Currency
- Current balance
- Statement period (from/to dates)
- Number of transactions (estimate)

**For EMPLOYMENT LETTER:**
- Employee name
- Employer/company name
- Position/job title
- Start date of employment
- Salary (if mentioned)
- Letter date
- Signatory name and position

**For PHOTO:**
- Photo quality assessment
- Dimensions appropriateness
- Background color
- Face visibility

Respond in JSON format:
{
  "documentType": "passport" | "bank_statement" | "employment_letter" | "photo" | "other",
  "confidence": 0.0-1.0,
  "extracted": {
    // All extracted fields based on document type
  },
  "issues": [
    {
      "issue": "Description of the issue",
      "severity": "blocker" | "warning" | "info",
      "fix": "How to fix this issue"
    }
  ],
  "isValid": true | false
}

For issues, check:
- Passport: Expiry within 6 months = blocker, damaged/unreadable = blocker
- Bank statement: Balance below threshold = warning, older than 3 months = warning
- Employment letter: Missing salary = info, undated = warning
- Photo: Wrong dimensions = blocker, wrong background = blocker`;

// ============================================
// DOCUMENT ANALYZER
// ============================================

async function analyzeDocument(
  imageData: string,
  mimeType: string,
  requirements: VisaRequirements
): Promise<AnalyzedDocument> {
  const model = genAI.models.generateContent;
  
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: DOCUMENT_EXTRACTION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
            {
              text: `\n\nThe visa financial threshold requirement is: ${requirements.financialThreshold}. 
                     Required documents for this visa: ${requirements.documentsRequired.join(", ")}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const result = JSON.parse(text);
    
    return {
      type: result.documentType as DocumentType,
      extracted: result.extracted,
      issues: result.issues || [],
      isValid: result.isValid ?? true,
      confidence: result.confidence || 0.8,
    };
  } catch (error) {
    console.error("[VisaLens] Document analysis error:", error);
    return {
      type: "other",
      extracted: {},
      issues: [{
        issue: "Failed to analyze document",
        severity: "blocker",
        fix: "Please upload a clearer image of the document",
      }],
      isValid: false,
      confidence: 0,
    };
  }
}

// ============================================
// CHECKLIST GENERATOR
// ============================================

function generateChecklist(
  documents: AnalyzedDocument[],
  requirements: VisaRequirements
): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];
  const analyzedTypes = documents.map(d => d.type);

  // Check each required document
  for (const required of requirements.documentsRequired) {
    const normalizedRequired = required.toLowerCase();
    
    // Map requirement to document type
    let docType: DocumentType | null = null;
    if (normalizedRequired.includes("passport")) docType = "passport";
    else if (normalizedRequired.includes("bank")) docType = "bank_statement";
    else if (normalizedRequired.includes("employment") || normalizedRequired.includes("letter")) docType = "employment_letter";
    else if (normalizedRequired.includes("photo")) docType = "photo";
    else if (normalizedRequired.includes("tb test")) docType = "tb_test";
    else if (normalizedRequired.includes("hotel") || normalizedRequired.includes("accommodation")) docType = "hotel_booking";
    else if (normalizedRequired.includes("flight") || normalizedRequired.includes("itinerary")) docType = "flight_booking";
    else if (normalizedRequired.includes("insurance")) docType = "insurance";
    
    // Check if we have this document
    const matchingDoc = documents.find(d => d.type === docType);
    
    if (!matchingDoc) {
      checklist.push({
        requirement: required,
        status: "missing",
        details: `Upload your ${required}`,
        documentType: docType || undefined,
      });
    } else if (!matchingDoc.isValid || matchingDoc.issues.some(i => i.severity === "blocker")) {
      const blockers = matchingDoc.issues.filter(i => i.severity === "blocker");
      checklist.push({
        requirement: required,
        status: "issue",
        details: blockers.length > 0 
          ? blockers.map(i => i.issue).join("; ") 
          : "Document has issues that need to be resolved",
        documentType: docType || undefined,
      });
    } else {
      checklist.push({
        requirement: required,
        status: "met",
        details: "Document verified ✓",
        documentType: docType || undefined,
      });
    }
  }

  return checklist;
}

// ============================================
// APPROVAL LIKELIHOOD CALCULATOR
// ============================================

function calculateApprovalLikelihood(
  checklist: ChecklistItem[],
  documents: AnalyzedDocument[]
): { likelihood: "high" | "medium" | "low"; percentage: number } {
  const totalItems = checklist.length;
  const metItems = checklist.filter(c => c.status === "met").length;
  const issueItems = checklist.filter(c => c.status === "issue").length;
  const missingItems = checklist.filter(c => c.status === "missing").length;

  // Calculate base percentage
  let percentage = Math.round((metItems / totalItems) * 100);

  // Deduct for issues
  percentage -= issueItems * 10;
  
  // Deduct more for missing documents
  percentage -= missingItems * 20;

  // Check for critical issues in documents
  const criticalIssues = documents.flatMap(d => 
    d.issues.filter(i => i.severity === "blocker")
  );
  percentage -= criticalIssues.length * 15;

  // Clamp percentage
  percentage = Math.max(0, Math.min(100, percentage));

  // Determine likelihood
  let likelihood: "high" | "medium" | "low";
  if (percentage >= 70) likelihood = "high";
  else if (percentage >= 40) likelihood = "medium";
  else likelihood = "low";

  return { likelihood, percentage };
}

// ============================================
// MAIN VISALENS FUNCTION
// ============================================

export async function analyzeVisaDocuments(
  input: VisaLensInput
): Promise<VisaLensOutput> {
  // Use passportCountry/destinationCountry as fallbacks for nationality/destination
  const nationality = input.nationality || input.passportCountry || "";
  const destination = input.destination || input.destinationCountry || "";
  
  console.log("[VisaLens] Starting document analysis...");
  console.log(`[VisaLens] Nationality: ${nationality}, Destination: ${destination}`);
  console.log(`[VisaLens] Documents to analyze: ${input.documents.length}`);

  // Get visa requirements
  const requirements = await getVisaRequirements(
    nationality,
    destination,
    input.visaType
  );
  console.log(`[VisaLens] Visa required: ${requirements.visaRequired}`);
  console.log(`[VisaLens] Visa type: ${requirements.visaType}`);

  // Analyze each document
  const analyzedDocs: AnalyzedDocument[] = [];
  for (let i = 0; i < input.documents.length; i++) {
    const doc = input.documents[i];
    console.log(`[VisaLens] Analyzing document ${i + 1}/${input.documents.length}...`);
    
    const analyzed = await analyzeDocument(
      doc.imageData || "",
      doc.mimeType,
      requirements
    );
    analyzed.fileName = doc.fileName;
    analyzedDocs.push(analyzed);
    
    console.log(`[VisaLens] Document type: ${analyzed.type}, Valid: ${analyzed.isValid}`);
  }

  // Generate checklist
  const checklist = generateChecklist(analyzedDocs, requirements);

  // Calculate approval likelihood
  const { likelihood, percentage } = calculateApprovalLikelihood(checklist, analyzedDocs);

  // Extract missing documents and critical issues
  const missingDocuments = checklist
    .filter(c => c.status === "missing")
    .map(c => c.requirement || c.item || "")
    .filter(Boolean);

  const criticalIssues = analyzedDocs
    .flatMap(d => d.issues.filter(i => i.severity === "blocker"))
    .map(i => i.issue);

  // Generate recommendations
  const recommendations: string[] = [];
  if (missingDocuments.length > 0) {
    recommendations.push(`Upload the missing documents: ${missingDocuments.join(", ")}`);
  }
  if (criticalIssues.length > 0) {
    recommendations.push("Resolve all critical issues before applying");
  }
  if (likelihood === "medium" || likelihood === "low") {
    recommendations.push("Consider adding a cover letter explaining your purpose of visit");
  }
  if (requirements.visaType?.includes("Visitor")) {
    recommendations.push("Ensure you have proof of ties to your home country");
  }

  // Generate Diaspora AI link
  const diasporaLink = generateDiasporaLink(
    nationality,
    destination,
    input.travelDate
  );

  // Format response
  const formattedResponse = formatVisaLensResponse(
    analyzedDocs,
    checklist,
    requirements,
    likelihood,
    percentage,
    missingDocuments,
    criticalIssues,
    recommendations
  );

  console.log(`[VisaLens] Analysis complete. Approval likelihood: ${likelihood} (${percentage}%)`);

  return {
    documentsAnalyzed: analyzedDocs,
    requirements,
    checklist,
    approvalLikelihood: likelihood,
    approvalPercentage: percentage,
    missingDocuments,
    criticalIssues,
    recommendations,
    diasporaLink,
    formattedResponse,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateDiasporaLink(
  nationality: string,
  destination: string,
  travelDate?: string
): string {
  const params = new URLSearchParams({
    from: nationality,
    to: destination,
  });
  if (travelDate) {
    params.append("date", travelDate);
  }
  return `https://app.diasporaai.dev/flights?${params.toString()}`;
}

function formatVisaLensResponse(
  documents: AnalyzedDocument[],
  checklist: ChecklistItem[],
  requirements: VisaRequirements,
  likelihood: string,
  percentage: number,
  missingDocs: string[],
  criticalIssues: string[],
  recommendations: string[]
): VisaLensOutput["formattedResponse"] {
  const metCount = checklist.filter(c => c.status === "met").length;
  const totalCount = checklist.length;
  
  const likelihoodEmoji = likelihood === "high" ? "🟢" : likelihood === "medium" ? "🟡" : "🔴";
  
  const header = `🛂 VISA DOCUMENT ANALYSIS • ${metCount}/${totalCount} requirements met • ${likelihoodEmoji} ${percentage}% approval likelihood`;

  const documentsSection = documents.map(d => {
    const typeEmoji = d.type === "passport" ? "🛂" : 
                      d.type === "bank_statement" ? "💰" : 
                      d.type === "employment_letter" ? "📋" :
                      d.type === "photo" ? "📷" : "📄";
    const statusEmoji = d.isValid ? "✅" : "❌";
    return `${typeEmoji} **${d.type.replace(/_/g, " ").toUpperCase()}** ${statusEmoji}\n${d.issues.length > 0 ? d.issues.map(i => `   • ${i.issue}`).join("\n") : "   No issues found"}`;
  }).join("\n\n");

  const checklistSection = checklist.map(c => {
    const emoji = c.status === "met" ? "✅" : c.status === "issue" ? "⚠️" : "❌";
    return `${emoji} ${c.requirement}: ${c.details}`;
  }).join("\n");

  const issuesSection = criticalIssues.length > 0
    ? `🚨 **CRITICAL ISSUES:**\n${criticalIssues.map(i => `• ${i}`).join("\n")}`
    : "✅ No critical issues found";

  const recommendationsSection = recommendations.length > 0
    ? `💡 **RECOMMENDATIONS:**\n${recommendations.map(r => `• ${r}`).join("\n")}`
    : "";

  return {
    header,
    documentsSection,
    checklistSection,
    issuesSection,
    recommendationsSection,
  };
}
