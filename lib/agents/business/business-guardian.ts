// ============================================
// BUSINESS GUARDIAN AGENT
// Synthesizes all business analysis into final response
// ============================================

import { GoogleGenAI } from "@google/genai";
import {
  BusinessGuardianInput,
  BusinessGuardianOutput,
  VisaLensOutput,
  LegalLensOutput,
  ScamShieldOutput,
  TripGuardOutput,
  BusinessAnalysisType,
} from "@/types/business";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ============================================
// GUARDIAN SYNTHESIS PROMPT
// ============================================

const GUARDIAN_PROMPT = `You are a professional business assistant synthesizing analysis results. Your tone is:
- Professional but warm
- Action-oriented and practical
- Clear and concise
- NOT Gen-Z casual (no "bestie", "slay", etc.)

Based on the analysis type and results, create:
1. A clear headline summarizing the situation
2. Key findings (3-5 bullet points)
3. Prioritized action items with deadlines where applicable
4. A voice-friendly script for audio delivery (2-3 sentences max)

The response should feel like advice from a trusted business advisor.

Respond in JSON format:
{
  "headline": "Clear, professional headline (under 100 chars)",
  "severity": "safe" | "warning" | "danger" | "critical",
  "severityEmoji": "🟢 | 🟡 | 🟠 | 🔴",
  "summary": "2-3 sentence summary",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "actionItems": [
    { "priority": "high" | "medium" | "low", "action": "What to do", "deadline": "When (optional)" }
  ],
  "voiceScript": "Short audio-friendly summary for TTS",
  "diasporaIntegration": {
    "action": "Book flights",
    "link": "URL",
    "buttonText": "Button text"
  } // Only if travel-related
}`;

// ============================================
// ANALYSIS TYPE HANDLERS
// ============================================

function prepareVisaContext(result: VisaLensOutput): string {
  return `
VISA DOCUMENT ANALYSIS RESULTS:
- Documents analyzed: ${result.documentsAnalyzed.length}
- Approval likelihood: ${result.approvalLikelihood} (${result.approvalPercentage}%)
- Missing documents: ${result.missingDocuments.join(", ") || "None"}
- Critical issues: ${result.criticalIssues.join("; ") || "None"}
- Checklist status: ${result.checklist.map(c => `${c.requirement}: ${c.status}`).join(", ")}
- Recommendations: ${result.recommendations.join(". ")}
- Diaspora link: ${result.diasporaLink}

Visa Requirements:
- Visa type: ${result.requirements.visaType}
- Processing time: ${result.requirements.processingDays} days
- Documents needed: ${result.requirements.documentsRequired.join(", ")}
`;
}

function prepareLegalContext(result: LegalLensOutput): string {
  return `
CONTRACT ANALYSIS RESULTS:
- Contract type: ${result.contractType}
- Parties: ${result.parties.join(" & ")}
- Overall risk: ${result.overallRisk} (${result.riskScore}/100)
- Danger clauses: ${result.dangerClauses.join(", ") || "None"}
- Caution clauses: ${result.cautionClauses.join(", ") || "None"}
- Must negotiate: ${result.mustNegotiate.join("; ") || "Nothing critical"}
- Recommend lawyer: ${result.recommendLawyer ? "YES" : "No"}
- Clauses analyzed: ${result.clausesAnalyzed.length}
`;
}

function prepareScamContext(result: ScamShieldOutput): string {
  return `
SCAM ANALYSIS RESULTS:
- Scam likelihood: ${result.scamLikelihood}
- Confidence: ${Math.round(result.confidenceScore * 100)}%
- Red flags: ${result.redFlags.map(f => `${f.flagName} (${f.severity})`).join(", ") || "None"}
- Urgency tactics found: ${result.urgencyTactics.join(", ") || "None"}
- Suspicious payment methods: ${result.suspiciousPaymentMethods.join(", ") || "None"}
- Domain legitimate: ${result.verification.domainLegitimate === null ? "Unknown" : result.verification.domainLegitimate}
- Recommended actions: ${result.recommendedActions.join("; ")}
`;
}

function prepareTripContext(result: TripGuardOutput): string {
  return `
TRIP PLANNING RESULTS:
- Total countries: ${result.tripSummary.totalCountries}
- Total days: ${result.tripSummary.totalDays}
- Visas required: ${result.tripSummary.visasRequired}
- Estimated visa cost: ${result.tripSummary.estimatedVisaCost}
- Per-stop breakdown: ${result.perStopAnalysis.map(s => 
    `${s.countryName}: ${s.visaRequired ? `Visa required (${s.visaType})` : "No visa"}`
  ).join("; ")}
- Layover alerts: ${result.layoverAlerts.length}
- Documents needed: ${result.combinedDocumentChecklist.slice(0, 5).map(d => d.document).join(", ")}
- Suggested visa order: ${result.suggestedOrder.join(" → ")}
- Diaspora link: ${result.diasporaMultiCityLink}
`;
}

// ============================================
// MAIN BUSINESS GUARDIAN FUNCTION
// ============================================

export async function synthesizeBusinessResponse(
  input: BusinessGuardianInput
): Promise<BusinessGuardianOutput> {
  console.log(`[BusinessGuardian] Synthesizing ${input.analysisType} analysis...`);

  // Prepare context based on analysis type
  let context: string;
  let diasporaLink: string | undefined;

  switch (input.analysisType) {
    case "visa":
      context = prepareVisaContext(input.analysisResult as VisaLensOutput);
      diasporaLink = (input.analysisResult as VisaLensOutput).diasporaLink;
      break;
    case "legal":
      context = prepareLegalContext(input.analysisResult as LegalLensOutput);
      break;
    case "scam":
      context = prepareScamContext(input.analysisResult as ScamShieldOutput);
      break;
    case "trip":
      context = prepareTripContext(input.analysisResult as TripGuardOutput);
      diasporaLink = (input.analysisResult as TripGuardOutput).diasporaMultiCityLink;
      break;
    default:
      throw new Error(`Unknown analysis type: ${input.analysisType}`);
  }

  // Add user question if provided
  const userContext = input.userQuestion 
    ? `\n\nUser's specific question: ${input.userQuestion}`
    : "";

  // Generate guardian response
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: GUARDIAN_PROMPT },
          { text: `\nAnalysis Type: ${input.analysisType.toUpperCase()}` },
          { text: context },
          { text: userContext },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const text = response.text || "";
  let result;

  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("[BusinessGuardian] Failed to parse response:", text.substring(0, 500));
    // Return a fallback response
    result = generateFallbackResponse(input.analysisType, input.analysisResult);
  }

  // Build formatted response
  const formattedResponse = formatGuardianResponse(
    input.analysisType,
    result,
    diasporaLink
  );

  console.log(`[BusinessGuardian] Synthesis complete. Severity: ${result.severity}`);

  return {
    headline: result.headline,
    severity: result.severity,
    severityEmoji: result.severityEmoji || getSeverityEmoji(result.severity),
    summary: result.summary,
    keyFindings: result.keyFindings || [],
    actionItems: result.actionItems || [],
    diasporaIntegration: diasporaLink ? {
      action: result.diasporaIntegration?.action || "Book your travel",
      link: diasporaLink,
      buttonText: result.diasporaIntegration?.buttonText || "Book on Diaspora AI →",
    } : undefined,
    voiceScript: result.voiceScript,
    formattedResponse,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case "safe": return "🟢";
    case "warning": return "🟡";
    case "danger": return "🟠";
    case "critical": return "🔴";
    default: return "🔵";
  }
}

function generateFallbackResponse(
  analysisType: BusinessAnalysisType,
  result: any
): any {
  const typeLabels: Record<BusinessAnalysisType, string> = {
    visa: "Visa Document Analysis",
    legal: "Contract Analysis",
    scam: "Scam Detection",
    trip: "Trip Planning",
  };

  return {
    headline: `${typeLabels[analysisType]} Complete`,
    severity: "warning",
    severityEmoji: "🟡",
    summary: "Analysis completed. Please review the detailed results.",
    keyFindings: ["Analysis completed successfully", "Review the detailed breakdown below"],
    actionItems: [
      { priority: "high", action: "Review the detailed analysis results" }
    ],
    voiceScript: `Your ${typeLabels[analysisType].toLowerCase()} is complete. Please review the results.`,
  };
}

function formatGuardianResponse(
  analysisType: BusinessAnalysisType,
  result: any,
  diasporaLink?: string
): string {
  const typeEmojis: Record<BusinessAnalysisType, string> = {
    visa: "🛂",
    legal: "📜",
    scam: "🎣",
    trip: "🗺️",
  };

  let response = `${typeEmojis[analysisType]} **${result.headline}**\n\n`;
  response += `${result.severityEmoji} ${result.severity.toUpperCase()}\n\n`;
  response += `${result.summary}\n\n`;

  if (result.keyFindings && result.keyFindings.length > 0) {
    response += "**Key Findings:**\n";
    response += result.keyFindings.map((f: string) => `• ${f}`).join("\n");
    response += "\n\n";
  }

  if (result.actionItems && result.actionItems.length > 0) {
    response += "**Action Items:**\n";
    response += result.actionItems.map((item: any, i: number) => {
      const priorityEmoji = item.priority === "high" ? "🔴" : 
                           item.priority === "medium" ? "🟡" : "🟢";
      const deadline = item.deadline ? ` (${item.deadline})` : "";
      return `${i + 1}. ${priorityEmoji} ${item.action}${deadline}`;
    }).join("\n");
    response += "\n\n";
  }

  if (diasporaLink) {
    response += `---\n✈️ **Ready to book?** [${result.diasporaIntegration?.buttonText || "Book on Diaspora AI"}](${diasporaLink})\n`;
  }

  return response;
}

// ============================================
// VOICE SCRIPT OPTIMIZER
// ============================================

export function optimizeForVoice(text: string): string {
  // Remove markdown formatting
  let voice = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
    .replace(/•/g, "")
    .replace(/---/g, "")
    .replace(/\n{3,}/g, "\n\n");

  // Replace emojis with text equivalents where needed
  voice = voice
    .replace(/🟢/g, "")
    .replace(/🟡/g, "note: ")
    .replace(/🟠/g, "warning: ")
    .replace(/🔴/g, "critical: ");

  return voice.trim();
}
