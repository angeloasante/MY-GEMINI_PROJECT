// ============================================
// B2B SCAMSHIELD AGENT - Business Fraud Detection
//   s scams in business emails and invoices
// ============================================

import { GoogleGenAI } from "@google/genai";
import {
ScamShieldInput,
ScamShieldOutput,
  RedFlag,
  VerificationResult,
ScamPatternType,
  SuspiciousPaymentMethod,
ScamLikelihood,
} from "@/types/business";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ============================================
// SCAM PATTERN DEFINITIONS
// ============================================

export const SCAM_PATTERNS: Record<ScamPatternType, {
  name: string;
  severity: "medium" | "high" | "critical";
  description: string;
  indicators: string[];
  typicalPhrases: string[];
}> = {
  ceo_fraud: {
    name: "CEO Fraud",
    severity: "critical",
    description: "Fake email impersonating CEO/executive requesting urgent wire transfer",
    indicators: ["Urgent tone", "Wire transfer request", "Secrecy required", "Slightly different email domain"],
    typicalPhrases: ["I need you to handle a confidential matter", "Don't discuss this with anyone", "Wire transfer needed immediately", "Keep this between us"],
  },
  invoice_manipulation: {
    name: "Invoice Manipulation",
    severity: "critical",
    description: "Real invoice with bank details changed to fraudster's account",
    indicators: ["Bank details different from usual", "Recent vendor email compromise", "Urgent payment request"],
    typicalPhrases: ["We've updated our banking details", "Please update our payment information", "New bank account effective immediately"],
  },
  vendor_impersonation: {
    name: "Vendor Impersonation",
    severity: "critical",
    description: "Pretending to be a known vendor to redirect payments",
    indicators: ["Similar domain name", "Request to change payment details", "Urgency"],
    typicalPhrases: ["This is regarding your recent order", "Please confirm payment to our new account"],
  },
  payment_redirect: {
    name: "Payment Redirect Scam",
    severity: "critical",
    description: "Request to change payment destination for existing invoices",
    indicators: ["Request for bank detail change", "No phone verification", "Email-only communication"],
    typicalPhrases: ["We've changed our bank account", "Please remit future payments to this account"],
  },
  advance_fee_b2b: {
    name: "Advance Fee Fraud",
    severity: "high",
    description: "Requiring upfront payment to secure contract or deal",
    indicators: ["Upfront payment required", "Too-good-to-be-true offer", "Pressure to pay quickly"],
    typicalPhrases: ["Pay the processing fee", "Small fee to release large contract", "Refundable deposit required"],
  },
  fake_rfp: {
    name: "Fake RFP/RFQ",
    severity: "high",
    description: "Fake request for proposal to harvest company information",
    indicators: ["Vague company details", "Requests sensitive pricing/capability info", "No follow-up meeting offered"],
    typicalPhrases: ["We're evaluating vendors", "Please provide your complete pricing structure", "Send us your client list"],
  },
  domain_spoofing: {
    name: "Domain Spoofing",
    severity: "high",
    description: "Email from lookalike domain (e.g., micros0ft.com vs microsoft.com)",
    indicators: ["Visually similar domain", "Character substitution (0 for O, l for I)", "Recent domain registration"],
    typicalPhrases: ["Verify your account", "Action required on your account", "Security alert"],
  },
  urgency_pressure: {
    name: "Urgency Pressure Tactics",
    severity: "high",
    description: "Creating artificial urgency to prevent verification",
    indicators: ["Tight deadline", "Threats of consequences", "No time to verify"],
    typicalPhrases: ["Payment needed within 24 hours", "Avoid late fees", "Legal action will be taken", "Limited time offer"],
  },
  overpayment_scam: {
    name: "Overpayment Scam",
    severity: "medium",
    description: "Paying too much and requesting refund of difference",
    indicators: ["Payment exceeds invoice", "Request to refund difference", "Unusual payment method"],
    typicalPhrases: ["I accidentally overpaid", "Please wire the difference back", "Refund the excess amount"],
  },
  directory_scam: {
    name: "Business Directory Scam",
    severity: "medium",
    description: "Fake business directory listing fees",
    indicators: ["Unsolicited directory offer", "Small recurring fees", "Difficult to cancel"],
    typicalPhrases: ["Confirm your listing", "Renew your business listing", "Annual directory fee due"],
  },
  fake_compliance: {
    name: "Fake Compliance Notice",
    severity: "high",
    description: "Pretending to be regulatory body demanding payment",
    indicators: ["Government impersonation", "Threatening legal action", "Unusual payment methods"],
    typicalPhrases: ["Pay the fine immediately", "Your business license will be revoked", "Compliance violation Detected"],
  },
  supply_chain_attack: {
    name: "Supply Chain Attack",
    severity: "critical",
    description: "Compromised vendor email account used to defraud",
    indicators: ["Known vendor domain", "Unusual request", "Banking detail change"],
    typicalPhrases: ["Please update our payment information in your system"],
  },
};

// ============================================
// SCAM DETECTION PROMPT
// ============================================

const SCAM_DETECTION_PROMPT = `You are a cybersecurity expert specializing in business email compromise (BEC) and B2B fraud Detection. Analyze this content for scam indicators.

Look for these scam patterns:
1. CEO_FRAUD: Fake executive requesting wire transfer, secrecy demanded
2. INVOICE_MANIPULATION: Bank details changed on real-looking invoice
3. VENDOR_IMPERSONATION: Pretending to be known vendor
4. PAYMENT_REDIRECT: Request to change payment destination
5. ADVANCE_FEE_B2B: Upfront payment for promised contract/deal
6. FAKE_RFP: Fake RFQ to harvest company info
7. DOMAIN_SPOOFING: Lookalike domain (micros0ft vs microsoft)
8. URGENCY_PRESSURE: Artificial time pressure
9. OVERPAYMENT_SCAM: Sent too much, wants refund
10. DIRECTORY_SCAM: Fake business directory fees
11. FAKE_COMPLIANCE: Fake regulatory/government notice
12. SUPPLY_CHAIN_ATTACK: Compromised vendor email

Check for:
- Urgency language ("immediately", "urgent", "ASAP")
- Secrecy requests ("confidential", "don't tell anyone")
- Wire transfer or cryptocurrency requests
- Unusual payment methods (gift cards, Western Union)
- Domain misspellings or lookalikes
- Grammar/spelling errors inconsistent with claimed sender
- Requests to bypass normal procedures
- Pressure to act without verification

Respond in this exact JSON format:
{
  "scamLikelihood": "safe" | "suspicious" | "likely_scam",
  "confidenceScore": 0.0-1.0,
  
  "redFlags": [
    {
      "flag": "one of the 12 patterns above",
      "flagName": "Human readable name",
      "evidence": "Specific quote or observation from the content",
      "severity": "medium" | "high" | "critical"
    }
  ],
  
  "urgencyTactics": ["List of urgency phrases found"],
  
  "suspiciousPaymentMethods": ["wire_transfer", "cryptocurrency", "gift_cards", etc],
  
  "domainAnalysis": {
    "claimed": "Who they claim to be",
    "actual": "What the domain actually is",
    "suspicious": true | false
  },
  
  "recommendedActions": ["Specific actions to take"]
}

Be thorough. Even small red flags matter for B2B fraud.`;

// ============================================
// DOMAIN VERIFICATION
// ============================================

async function verifyDomain(domain: string): Promise<Partial<VerificationResult>> {
  // In production, this would call external APIs for:
  // - WHOIS lookup for domain age
  // - Email reputation services
  // - Company registry lookups
  
  // For now, we'll do basic checks
  const result: Partial<VerificationResult> = {
    domainLegitimate: null,
    domainAge: "unknown",
    emailReputation: "unknown",
  };

  // Check for common spoofing patterns
  const spoofPatterns = [
    /micros[0o]ft/i,
    /g[0o][0o]gle/i,
    /app[l1]e/i,
    /amaz[0o]n/i,
    /paypa[l1]/i,
    /-secure\./i,
    /-verify\./i,
    /-support\./i,
    /\d{3,}/,  // Many numbers in domain
  ];

  for (const pattern of spoofPatterns) {
    if (pattern.test(domain)) {
      result.domainLegitimate = false;
      break;
    }
  }

  // Check for very new-looking domains
  if (domain.includes("-") && domain.split("-").length > 2) {
    result.domainLegitimate = false;
  }

  return result;
}

// ============================================
// MAIN SCAM SHIELD FUNCTION
// ============================================

export async function detectScam(
  input: ScamShieldInput
): Promise<ScamShieldOutput> {
  console.log("[ScamShield] Starting fraud analysis...");
  console.log(`[ScamShield] Content type: ${input.contentType}`);

  let contentToAnalyze = input.content;

  // If image provided, extract text first
  if (input.imageData && input.mimeType) {
    console.log("[ScamShield] Extracting text from image...");
    const extractedText = await extractTextFromImage(input.imageData, input.mimeType);
    contentToAnalyze = extractedText || input.content;
  }

  // Build context for analysis
  const context = `
Content Type: ${input.contentType}
${input.senderEmail ? `Sender Email: ${input.senderEmail}` : ""}
${input.senderDomain ? `Sender Domain: ${input.senderDomain}` : ""}
${input.claimedCompany ? `Claimed Company: ${input.claimedCompany}` : ""}
${input.invoiceAmount ? `Invoice Amount: $${input.invoiceAmount}` : ""}
${input.paymentDetails ? `Payment Details: ${input.paymentDetails}` : ""}

CONTENT:
${contentToAnalyze}
`;

  // Analyze with Gemini
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: SCAM_DETECTION_PROMPT },
          { text: context },
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
    console.error("[ScamShield] Failed to parse response:", text.substring(0, 500));
    throw new Error("Failed to analyze content. Please try again.");
  }

  // Verify domain if provided
  let verification: VerificationResult = {
    domainLegitimate: null,
    companyExists: null,
    emailMatchesCompany: null,
    bankDetailsChanged: null,
  };

  if (input.senderDomain) {
    const domainVerification = await verifyDomain(input.senderDomain);
    verification = { ...verification, ...domainVerification };
    
    // Check if email matches claimed company
    if (input.claimedCompany) {
      const companyName = input.claimedCompany.toLowerCase().replace(/[^a-z]/g, "");
      const domainBase = input.senderDomain.split(".")[0].toLowerCase();
      verification.emailMatchesCompany = domainBase.includes(companyName) || 
                                         companyName.includes(domainBase);
    }
  }

  // Map red flags with severity
  const redFlags: RedFlag[] = (result.redFlags || []).map((rf: any) => ({
    flag: rf.flag as ScamPatternType,
    flagName: rf.flagName || SCAM_PATTERNS[rf.flag as ScamPatternType]?.name || rf.flag,
    evidence: rf.evidence,
    severity: rf.severity || SCAM_PATTERNS[rf.flag as ScamPatternType]?.severity || "high",
  }));

  // Map suspicious payment methods
  const suspiciousPaymentMethods: SuspiciousPaymentMethod[] = 
    result.suspiciousPaymentMethods || [];

  // Generate recommended actions based on likelihood
  let recommendedActions = result.recommendedActions || [];
  if (recommendedActions.length === 0) {
    recommendedActions = generateRecommendedActions(
      result.scamLikelihood,
      redFlags,
      input
    );
  }

  // Format response
  const formattedResponse = formatScamShieldResponse(
    result.scamLikelihood,
    result.confidenceScore,
    redFlags,
    verification,
    result.urgencyTactics || [],
    suspiciousPaymentMethods,
    recommendedActions
  );

  console.log(`[ScamShield] Analysis complete. Likelihood: ${result.scamLikelihood}`);
  console.log(`[ScamShield] Red flags found: ${redFlags.length}`);

  return {
    scamLikelihood: result.scamLikelihood || "suspicious",
    confidenceScore: result.confidenceScore || 0.5,
    redFlags,
    verification,
    urgencyTactics: result.urgencyTactics || [],
    suspiciousPaymentMethods,
    recommendedActions,
    formattedResponse,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function extractTextFromImage(
  imageData: string,
  mimeType: string
): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract ALL text from this image. Include email addresses, amounts, bank details, and any other text. Return only the extracted text." },
            {
              inlineData: {
                mimeType,
                data: imageData,
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
    console.error("[ScamShield] Image extraction error:", error);
    return "";
  }
}

function generateRecommendedActions(
  likelihood: ScamLikelihood,
  redFlags: RedFlag[],
  input: ScamShieldInput
): string[] {
  const actions: string[] = [];

  if (likelihood === "likely_scam") {
    actions.push("🚨 DO NOT respond to this message");
    actions.push("🚨 DO NOT make any payments");
    actions.push("🚨 DO NOT click any links or download attachments");
  }

  if (redFlags.some(rf => rf.flag === "ceo_fraud")) {
    actions.push("📞 Call the CEO/executive directly using a known number to verify");
  }

  if (redFlags.some(rf => rf.flag === "invoice_manipulation" || rf.flag === "payment_redirect")) {
    actions.push("📞 Call the vendor using the phone number from your records (NOT from this email)");
    actions.push("🔍 Compare bank details with previous invoices");
  }

  if (input.senderDomain) {
    actions.push(`🔍 Verify the sender domain '${input.senderDomain}' matches the official company website`);
  }

  if (likelihood !== "safe") {
    actions.push("📧 Forward this to your IT security team");
    actions.push("📝 Report to reportphishing@apwg.org if it's phishing");
  }

  if (actions.length === 0) {
    actions.push("✅ This appears to be legitimate, but always verify large payments");
    actions.push("📞 When in doubt, call to verify using a known number");
  }

  return actions;
}

function formatScamShieldResponse(
  likelihood: ScamLikelihood,
  confidence: number,
  redFlags: RedFlag[],
  verification: VerificationResult,
  urgencyTactics: string[],
  suspiciousPayments: SuspiciousPaymentMethod[],
  actions: string[]
): ScamShieldOutput["formattedResponse"] {
  const likelihoodEmoji = likelihood === "likely_scam" ? "🚨" : 
                          likelihood === "suspicious" ? "⚠️" : "✅";
  const likelihoodText = likelihood === "likely_scam" ? "LIKELY SCAM" :
                         likelihood === "suspicious" ? "SUSPICIOUS" : "APPEARS SAFE";

  const header = `🎣 SCAM ANALYSIS • ${likelihoodEmoji} ${likelihoodText} • ${Math.round(confidence * 100)}% confidence • ${redFlags.length} red flags`;

  const verdictSection = `
**Verdict:** ${likelihoodText}
**Confidence:** ${Math.round(confidence * 100)}%
**Red Flags Detected:** ${redFlags.length}
${urgencyTactics.length > 0 ? `**Urgency Tactics:** ${urgencyTactics.join(", ")}` : ""}
${suspiciousPayments.length > 0 ? `**⚠️ Suspicious Payment Methods:** ${suspiciousPayments.map(p => p.replace(/_/g, " ")).join(", ")}` : ""}
`.trim();

  const flagsSection = redFlags.length > 0 
    ? redFlags.map(rf => {
        const severityEmoji = rf.severity === "critical" ? "🔴" : 
                             rf.severity === "high" ? "🟠" : "🟡";
        return `${severityEmoji} **${rf.flagName}** (${rf.severity})\n   Evidence: "${rf.evidence}"`;
      }).join("\n\n")
    : "No specific scam patterns Detected.";

  const verificationSection = `
**Domain Verification:**
• Domain legitimate: ${verification.domainLegitimate === null ? "Unknown" : verification.domainLegitimate ? "✅ Yes" : "❌ No"}
• Email matches company: ${verification.emailMatchesCompany === null ? "Unknown" : verification.emailMatchesCompany ? "✅ Yes" : "❌ No"}
${verification.domainAge ? `• Domain age: ${verification.domainAge}` : ""}
`.trim();

  const actionsSection = `**RECOMMENDED ACTIONS:**\n${actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;

  return {
    header,
    verdictSection,
    flagsSection,
    verificationSection,
    actionsSection,
  };
}
