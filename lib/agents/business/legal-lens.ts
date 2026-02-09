// ============================================
// LEGALLENS AGENT - Contract Analyzer
// Analyzes contracts for red flags and risks
// ============================================

import { GoogleGenAI } from "@google/genai";
import {
  LegalLensInput,
  LegalLensOutput,
  AnalyzedClause,
  ContractType,
  RedFlagType,
} from "@/types/business";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ============================================
// RED FLAG DEFINITIONS
// ============================================

export const RED_FLAG_DEFINITIONS: Record<RedFlagType, {
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  typicalPhrases: string[];
  negotiationTips: string[];
}> = {
  non_compete: {
    name: "Non-Compete Clause",
    severity: "high",
    description: "Restricts your ability to work in the same industry for a specified period after leaving",
    typicalPhrases: ["shall not engage in", "competitive business", "not compete with"],
    negotiationTips: ["Limit to 6 months maximum", "Add geographic restrictions", "Define 'competitor' narrowly"],
  },
  ip_assignment_broad: {
    name: "Broad IP Assignment",
    severity: "critical",
    description: "Company owns ALL your intellectual property, including personal projects created on your own time",
    typicalPhrases: ["all inventions", "whether or not related", "any and all intellectual property"],
    negotiationTips: ["Exclude personal projects", "Limit to work-related IP only", "Add carve-out for prior work"],
  },
  ip_assignment_work: {
    name: "Work IP Assignment",
    severity: "medium",
    description: "Company owns IP created as part of your job (this is standard and usually acceptable)",
    typicalPhrases: ["work product", "within scope of employment", "arising from duties"],
    negotiationTips: ["This is typically acceptable", "Ensure personal projects are excluded"],
  },
  mandatory_arbitration: {
    name: "Mandatory Arbitration",
    severity: "high",
    description: "You cannot sue in court - all disputes go through private arbitration which often favors employers",
    typicalPhrases: ["binding arbitration", "waive right to jury trial", "arbitration shall be the exclusive"],
    negotiationTips: ["Request option for small claims court", "Specify neutral arbitration location", "Ensure employer pays arbitration fees"],
  },
  class_action_waiver: {
    name: "Class Action Waiver",
    severity: "high",
    description: "You cannot join class action lawsuits against the company",
    typicalPhrases: ["waive right to participate in class action", "individual basis only"],
    negotiationTips: ["Try to remove entirely", "Understand what rights you're giving up"],
  },
  unilateral_termination: {
    name: "Unilateral Termination",
    severity: "medium",
    description: "Company can terminate you without cause at any time",
    typicalPhrases: ["at-will employment", "terminate at any time", "without cause"],
    negotiationTips: ["Request notice period", "Add severance clause", "Define termination for cause clearly"],
  },
  asymmetric_liability: {
    name: "Asymmetric Liability",
    severity: "high",
    description: "Company's liability is capped, but yours is unlimited",
    typicalPhrases: ["liability shall not exceed", "unlimited liability", "indemnify and hold harmless"],
    negotiationTips: ["Make liability mutual and equal", "Cap your liability too", "Add mutual indemnification"],
  },
  auto_renewal: {
    name: "Auto-Renewal",
    severity: "low",
    description: "Contract automatically renews unless you take action to cancel",
    typicalPhrases: ["automatically renew", "unless written notice", "successive periods"],
    negotiationTips: ["Set calendar reminder", "Request opt-in renewal instead", "Shorten renewal period"],
  },
  long_notice_period: {
    name: "Long Notice Period",
    severity: "medium",
    description: "Requires 90+ days notice to terminate, which can delay your ability to leave",
    typicalPhrases: ["90 days notice", "advance written notice", "notice period"],
    negotiationTips: ["Reduce to 30 days", "Make notice period mutual", "Allow payment in lieu of notice"],
  },
  non_solicitation: {
    name: "Non-Solicitation",
    severity: "medium",
    description: "Cannot contact or work with former clients/colleagues after leaving",
    typicalPhrases: ["shall not solicit", "customers or employees", "directly or indirectly"],
    negotiationTips: ["Limit duration to 6-12 months", "Define scope narrowly", "Exclude contacts you had before joining"],
  },
  broad_confidentiality: {
    name: "Broad Confidentiality",
    severity: "medium",
    description: "Too much information is classified as 'confidential', including publicly available information",
    typicalPhrases: ["all information", "whether marked confidential or not", "in perpetuity"],
    negotiationTips: ["Add expiration date (2-3 years)", "Exclude public information", "Define what is actually confidential"],
  },
  indemnification: {
    name: "Indemnification Clause",
    severity: "high",
    description: "You must pay the company's legal fees and damages, even for situations outside your control",
    typicalPhrases: ["indemnify and hold harmless", "defend against any claims", "all costs and expenses"],
    negotiationTips: ["Make indemnification mutual", "Cap the amount", "Limit to your direct actions only"],
  },
  unfavorable_jurisdiction: {
    name: "Unfavorable Jurisdiction",
    severity: "medium",
    description: "Disputes must be resolved in a distant location, making it harder and more expensive to fight",
    typicalPhrases: ["governed by the laws of", "exclusive jurisdiction", "venue shall be"],
    negotiationTips: ["Request local jurisdiction", "Allow remote participation", "Specify neutral venue"],
  },
  penalty_clauses: {
    name: "Penalty Clauses",
    severity: "high",
    description: "Financial penalties for breach that may exceed actual damages",
    typicalPhrases: ["liquidated damages", "penalty of", "shall pay damages of"],
    negotiationTips: ["Cap the amount", "Make proportional to actual damages", "Remove or reduce penalties"],
  },
  assignment_without_consent: {
    name: "Assignment Without Consent",
    severity: "medium",
    description: "Company can transfer your contract to another company without your approval",
    typicalPhrases: ["may assign", "without consent", "transfer this agreement"],
    negotiationTips: ["Require your consent for assignment", "Add termination right if assigned", "Limit to affiliates only"],
  },
};

// ============================================
// CONTRACT ANALYSIS PROMPT
// ============================================

const CONTRACT_ANALYSIS_PROMPT = `You are an expert contract attorney analyzing a legal document. Your job is to:

1. Identify the contract type (employment, NDA, service, freelance, lease, partnership, other)
2. Extract parties, effective date, and term length
3. Analyze each significant clause and identify red flags
4. Translate legal language to plain English
5. Calculate overall risk level

For each clause, identify these red flag types if present:
- non_compete: Restricts working for competitors
- ip_assignment_broad: Company owns ALL your IP including personal projects
- ip_assignment_work: Company owns work-related IP (standard)
- mandatory_arbitration: Must use arbitration instead of courts
- class_action_waiver: Cannot join class actions
- unilateral_termination: They can fire without cause
- asymmetric_liability: Their liability capped, yours unlimited
- auto_renewal: Contract auto-renews
- long_notice_period: 90+ days notice required
- non_solicitation: Cannot work with former clients
- broad_confidentiality: Too much is "confidential"
- indemnification: You pay their legal fees
- unfavorable_jurisdiction: Disputes in far location
- penalty_clauses: Financial penalties for breach
- assignment_without_consent: Can sell the contract

Respond in this exact JSON format:
{
  "contractType": "employment" | "nda" | "service" | "freelance" | "lease" | "partnership" | "other",
  "parties": ["Party A", "Party B"],
  "effectiveDate": "YYYY-MM-DD or null",
  "termLength": "Duration as string or null",
  
  "clauses": [
    {
      "clauseId": "Section number",
      "clauseName": "Name of the clause",
      "originalText": "Exact text from contract (first 500 chars)",
      "plainEnglish": "What this actually means in simple terms",
      "riskLevel": "safe" | "caution" | "danger",
      "redFlagType": "one of the types above or null",
      "marketComparison": "How this compares to industry standard",
      "negotiationTip": "What to ask for instead"
    }
  ],
  
  "overallRisk": "low" | "medium" | "high" | "critical",
  "riskScore": 0-100,
  
  "dangerClauses": ["Clause names with danger level"],
  "cautionClauses": ["Clause names with caution level"],
  "safeClauses": ["Clause names that are safe"],
  
  "mustNegotiate": ["Specific changes to request"],
  
  "recommendLawyer": true | false,
  "lawyerThreshold": "Reason why lawyer is recommended"
}

Focus on the most significant clauses. Be thorough but concise.`;

// ============================================
// MAIN LEGAL LENS FUNCTION
// ============================================

export async function analyzeContract(
  input: LegalLensInput
): Promise<LegalLensOutput> {
  console.log("[LegalLens] Starting contract analysis...");

  // Get contract text
  let contractText = input.contractText || "";
  
  // If PDF, we'd need to extract text (simplified for now - use image analysis)
  if (input.pdfBase64 && !contractText) {
    console.log("[LegalLens] Analyzing PDF document...");
    contractText = await extractTextFromPDF(input.pdfBase64, input.mimeType || "application/pdf");
  }

  if (!contractText || contractText.length < 100) {
    throw new Error("Contract text is too short or empty. Please provide a valid contract.");
  }

  console.log(`[LegalLens] Contract length: ${contractText.length} characters`);

  // Analyze with Gemini
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: CONTRACT_ANALYSIS_PROMPT },
          { text: `\n\nContract type hint: ${input.contractType || "unknown"}\n\nCONTRACT TEXT:\n\n${contractText}` },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const text = response.text || "";
  let result;
  
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("[LegalLens] Failed to parse response:", text.substring(0, 500));
    throw new Error("Failed to analyze contract. Please try again.");
  }

  // Map to output format
  const clausesAnalyzed: AnalyzedClause[] = (result.clauses || []).map((c: any) => ({
    clauseId: c.clauseId || "N/A",
    clauseName: c.clauseName || "Unknown Clause",
  DetectoriginalText: c.originalText || "",
    plainEnglish: c.plainEnglish || "No translation available",
    riskLevel: c.riskLevel || "safe",
    redFlagType: c.redFlagType as RedFlagType | undefined,
    marketComparison: c.marketComparison,
    negotiationTip: c.negotiationTip,
  }));

  // Determine if lawyer is needed
  const recommendLawyer = result.recommendLawyer ?? 
    (result.overallRisk === "critical" || result.overallRisk === "high" || result.riskScore > 60);

  // Format response
  const formattedResponse = formatLegalLensResponse(
    result.contractType,
    result.parties,
    clausesAnalyzed,
    result.overallRisk,
    result.riskScore,
    result.mustNegotiate || [],
    recommendLawyer
  );

  console.log(`[LegalLens] Analysis complete. Risk: ${result.overallRisk} (${result.riskScore}/100)`);
  console.log(`[LegalLens] Found ${clausesAnalyzed.filter(c => c.riskLevel === "danger").length} danger clauses`);

  return {
    contractType: result.contractType || input.contractType || "other",
    parties: result.parties || [],
    effectiveDate: result.effectiveDate,
    termLength: result.termLength,
    clausesAnalyzed,
    overallRisk: result.overallRisk || "medium",
    riskScore: result.riskScore || 50,
    dangerClauses: result.dangerClauses || [],
    cautionClauses: result.cautionClauses || [],
    safeClauses: result.safeClauses || [],
    mustNegotiate: result.mustNegotiate || [],
    recommendLawyer,
    lawyerThreshold: result.lawyerThreshold,
    formattedResponse,
  };
}

// ============================================
// PDF TEXT EXTRACTION
// ============================================

async function extractTextFromPDF(
  pdfBase64: string,
  mimeType: string
): Promise<string> {
  // Use Gemini's vision capabilities to extract text from PDF
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract ALL text from this document. Return only the extracted text, no commentary." },
            {
              inlineData: {
                mimeType,
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("[LegalLens] PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF. Please try pasting the text directly.");
  }
}

// ============================================
// RESPONSE FORMATTER
// ============================================

function formatLegalLensResponse(
  contractType: ContractType,
  parties: string[],
  clauses: AnalyzedClause[],
  overallRisk: string,
  riskScore: number,
  mustNegotiate: string[],
  recommendLawyer: boolean
): LegalLensOutput["formattedResponse"] {
  const dangerCount = clauses.filter(c => c.riskLevel === "danger").length;
  const cautionCount = clauses.filter(c => c.riskLevel === "caution").length;
  
  const riskEmoji = overallRisk === "critical" ? "🔴" : 
                    overallRisk === "high" ? "🟠" :
                    overallRisk === "medium" ? "🟡" : "🟢";

  const header = `📜 CONTRACT ANALYSIS • ${riskEmoji} ${overallRisk.toUpperCase()} RISK (${riskScore}/100) • ${dangerCount} red flags, ${cautionCount} warnings`;

  const summarySection = `
**Contract Type:** ${contractType.replace(/_/g, " ").toUpperCase()}
**Parties:** ${parties.join(" & ")}
**Risk Score:** ${riskScore}/100

${recommendLawyer ? "⚠️ **LAWYER RECOMMENDED** - This contract has significant risks that warrant professional review." : ""}
`.trim();

  const clausesSection = clauses
    .filter(c => c.riskLevel !== "safe")
    .map(c => {
      const emoji = c.riskLevel === "danger" ? "🚨" : "⚠️";
      const flagInfo = c.redFlagType ? RED_FLAG_DEFINITIONS[c.redFlagType] : null;
      
      return `
${emoji} **${c.clauseName}** (${c.clauseId})
• **What it says:** "${c.originalText.substring(0, 200)}..."
• **What it means:** ${c.plainEnglish}
${c.marketComparison ? `• **Market comparison:** ${c.marketComparison}` : ""}
${c.negotiationTip ? `• **Negotiate:** ${c.negotiationTip}` : ""}
`.trim();
    }).join("\n\n");

  const translationsSection = clauses
    .slice(0, 5)
    .map(c => `| "${c.originalText.substring(0, 50)}..." | ${c.plainEnglish} |`)
    .join("\n");

  const actionSection = mustNegotiate.length > 0 
    ? `**MUST NEGOTIATE:**\n${mustNegotiate.map((n, i) => `${i + 1}. ${n}`).join("\n")}`
    : "No critical negotiation points identified.";

  return {
    header,
    summarySection,
    clausesSection,
    translationsSection,
    actionSection,
  };
}
