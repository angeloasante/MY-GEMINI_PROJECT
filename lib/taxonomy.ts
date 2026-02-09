// ============================================
// Cleir DETECT - COMPLETE TAXONOMY
// Relationship + Scam + Self-Analysis Patterns
// ============================================

import { TacticDefinition, TaxonomyMap } from "@/types/agents";

// ============================================
// RELATIONSHIP MANIPULATION TAXONOMY
// ============================================
export const RELATIONSHIP_TAXONOMY: TaxonomyMap = {
  gaslighting: {
    name: "Gaslighting",
    description: "Making you question your own reality and memories",
    markers: [
      "That never happened",
      "You're imagining things",
      "You're being crazy",
      "You're being dramatic",
      "I never said that",
      "You're too sensitive",
      "You're remembering it wrong",
      "That's not what I meant",
      "You always twist my words",
      "I was just joking",
      "You're overreacting",
      "You're making things up",
      "Why are you so paranoid",
      "No one else has a problem with me",
    ],
    severity: "high",
    category: "relationship",
  },

  darvo: {
    name: "DARVO",
    description: "Deny, Attack, Reverse Victim & Offender",
    markers: [
      "I'm the real victim here",
      "Look what you made me do",
      "You're the abusive one",
      "I can't believe you're attacking me",
      "You always play the victim",
      "This is YOUR fault",
      "You drove me to this",
      "You're the one hurting ME",
      "Stop trying to make me the bad guy",
      "After everything I've done, you treat me like this",
    ],
    severity: "high",
    category: "relationship",
  },

  love_bombing: {
    name: "Love Bombing",
    description: "Overwhelming affection to create dependency",
    markers: [
      "You're my soulmate",
      "I've never felt this way about anyone",
      "We're meant to be together",
      "I can't live without you",
      "You're the only one who understands me",
      "I knew you were the one immediately",
      "Let's move in together",
      "You're perfect",
      "I've never loved anyone like this",
      "I want to spend every moment with you",
    ],
    severity: "medium",
    category: "relationship",
  },

  isolation: {
    name: "Isolation",
    description: "Cutting you off from support systems",
    markers: [
      "Your friends are bad influence",
      "Your family doesn't understand us",
      "You don't need anyone else",
      "They're turning you against me",
      "I'm the only one who really knows you",
      "Your friends don't like me",
      "I don't want you hanging out with them",
      "Why do you need to see them",
      "I should be enough for you",
      "They're jealous of what we have",
    ],
    severity: "high",
    category: "relationship",
  },

  guilt_tripping: {
    name: "Guilt Tripping",
    description: "Using guilt to control behavior",
    markers: [
      "After everything I've done for you",
      "I guess I'm just not important",
      "Fine, I'll just be alone",
      "You're abandoning me",
      "I sacrificed so much for you",
      "You never appreciate what I do",
      "I can't believe you'd do this to me",
      "You're being so selfish",
      "I thought you loved me",
      "If you really cared",
    ],
    severity: "medium",
    category: "relationship",
  },

  emotional_blackmail: {
    name: "Emotional Blackmail",
    description: "Using threats to control",
    markers: [
      "If you leave, I'll hurt myself",
      "I'll die without you",
      "You'll regret this",
      "No one else will want you",
      "If you really loved me, you'd",
      "I'll tell everyone what you did",
      "I'll ruin your reputation",
      "You'll never see the kids again",
      "I'll make your life hell",
      "I have nothing to live for without you",
    ],
    severity: "critical",
    category: "relationship",
  },

  stonewalling: {
    name: "Stonewalling",
    description: "Shutting down communication as punishment",
    markers: [
      "I'm not talking about this",
      "Whatever",
      "I don't care",
      "Figure it out yourself",
      "I'm done with this conversation",
      "Talk to the hand",
      "I don't have time for this",
      "You're not worth my time",
    ],
    severity: "medium",
    category: "relationship",
  },

  silent_treatment: {
    name: "Silent Treatment",
    description: "Withholding communication as punishment",
    markers: [
      "Ignoring messages for days",
      "Refusing to speak",
      "Pretending you don't exist",
      "Walking away mid-conversation",
      "Giving one-word answers",
      "Acting like nothing happened",
      "Not responding on purpose",
    ],
    severity: "medium",
    category: "relationship",
  },

  moving_goalposts: {
    name: "Moving Goalposts",
    description: "Changing expectations so you can never succeed",
    markers: [
      "That's not what I meant",
      "You still didn't do X",
      "It's not enough",
      "But what about Y",
      "I never asked for that",
      "You should have known",
      "That's basic, I expected more",
      "Anyone would have done better",
      "You're still not getting it",
    ],
    severity: "medium",
    category: "relationship",
  },

  triangulation: {
    name: "Triangulation",
    description: "Bringing in third parties to manipulate",
    markers: [
      "My ex would never do this",
      "Everyone agrees with me",
      "X thinks you're wrong too",
      "Other people find you difficult",
      "My friends think you're crazy",
      "Even your own family agrees with me",
      "My mom says you're",
      "All my exes were better at",
      "Normal people don't act like you",
    ],
    severity: "medium",
    category: "relationship",
  },

  blame_shifting: {
    name: "Blame Shifting",
    description: "Never taking responsibility, always your fault",
    markers: [
      "If you hadn't",
      "You made me do this",
      "This is because of you",
      "You started it",
      "I only did that because you",
      "You're the reason this happened",
      "I wouldn't have to if you just",
      "This is all your fault",
    ],
    severity: "high",
    category: "relationship",
  },

  contempt: {
    name: "Contempt",
    description: "Disrespect, mockery, and superiority",
    markers: [
      "You're pathetic",
      "You're so stupid",
      "I can't believe I'm with you",
      "You disgust me",
      "Eye rolling",
      "Mocking tone",
      "Name calling",
      "You're worthless",
      "What's wrong with you",
    ],
    severity: "high",
    category: "relationship",
  },

  invalidation: {
    name: "Invalidation",
    description: "Dismissing or minimizing feelings",
    markers: [
      "You're being dramatic",
      "It's not that big of a deal",
      "You're too emotional",
      "Get over it",
      "Stop being so sensitive",
      "Other people have real problems",
      "You're making a mountain out of a molehill",
      "Why are you upset about this",
    ],
    severity: "medium",
    category: "relationship",
  },

  future_faking: {
    name: "Future Faking",
    description: "Making promises with no intention to keep them",
    markers: [
      "I'll change, I promise",
      "Things will be different",
      "Once X happens, everything will be better",
      "I'm going to therapy soon",
      "This is the last time",
      "Trust me, it won't happen again",
      "We'll do that next time",
      "Soon things will be perfect",
    ],
    severity: "medium",
    category: "relationship",
  },

  projection: {
    name: "Projection",
    description: "Accusing you of what they're doing",
    markers: [
      "You're the one who's cheating",
      "You're being manipulative",
      "You're the liar here",
      "You're controlling",
      "You're the one with anger issues",
      "You're trying to gaslight me",
    ],
    severity: "high",
    category: "relationship",
  },

  healthy_conflict: {
    name: "Healthy Communication",
    description: "Normal disagreement without manipulation",
    markers: [
      "I understand your perspective",
      "I'm sorry, I was wrong",
      "Let me think about what you said",
      "I hear you",
      "That's a fair point",
      "I appreciate you telling me",
      "How can we work through this",
      "I respect your boundaries",
    ],
    severity: "none",
    category: "relationship",
  },
};

// ============================================
// SCAM DETECTION TAXONOMY
// ============================================
export const SCAM_TAXONOMY: TaxonomyMap = {
  urgency_pressure: {
    name: "Urgency Pressure",
    description: "Creating false time pressure to prevent thinking",
    markers: [
      "Act now",
      "Limited time",
      "Only today",
      "Expires soon",
      "Urgent action required",
      "Immediate response needed",
      "Don't miss out",
      "Last chance",
      "Within 24 hours",
      "Your account will be suspended",
    ],
    severity: "high",
    category: "scam",
  },

  fake_authority: {
    name: "Fake Authority",
    description: "Impersonating officials, companies, or institutions",
    markers: [
      "We are calling from",
      "This is the IRS",
      "Your bank has flagged",
      "Law enforcement",
      "Official notice",
      "Government agency",
      "Compliance department",
      "Security team",
      "Verify your identity",
      "Amazon security",
      "Apple support",
      "Microsoft technician",
    ],
    severity: "critical",
    category: "scam",
  },

  phishing_link: {
    name: "Phishing Link",
    description: "Malicious links designed to steal information",
    markers: [
      "Click here to verify",
      "Login to confirm",
      "Update your information",
      "Suspicious shortened URL",
      "Misspelled domain",
      "Click to claim",
      "Verify your account",
      "Reset your password at",
    ],
    severity: "critical",
    category: "scam",
  },

  too_good_to_be_true: {
    name: "Too Good To Be True",
    description: "Unrealistic promises and offers",
    markers: [
      "You've won",
      "Free gift",
      "Guaranteed returns",
      "No risk",
      "Make money fast",
      "Secret method",
      "Selected as winner",
      "Congratulations",
      "Claim your prize",
      "You've been chosen",
      "100% guaranteed",
    ],
    severity: "high",
    category: "scam",
  },

  advance_fee: {
    name: "Advance Fee Scam",
    description: "Requesting payment upfront for promised benefits",
    markers: [
      "Small fee required",
      "Processing fee",
      "Transfer fee",
      "Pay to unlock",
      "Send money to receive",
      "Western Union",
      "Wire transfer",
      "Gift cards as payment",
      "Crypto payment only",
      "Pay first then",
    ],
    severity: "critical",
    category: "scam",
  },

  impersonation: {
    name: "Impersonation",
    description: "Pretending to be someone you know",
    markers: [
      "Hey it's me",
      "This is my new number",
      "I lost my phone",
      "Can you help me out",
      "I'm stuck",
      "Need a favor urgently",
      "Don't tell anyone",
      "I'm in trouble",
    ],
    severity: "high",
    category: "scam",
  },

  romance_scam: {
    name: "Romance Scam",
    description: "Fake romantic interest to extract money",
    markers: [
      "I love you but we haven't met",
      "I need money for a plane ticket",
      "Medical emergency abroad",
      "Military deployment",
      "Can't video chat because",
      "Investment opportunity together",
      "Let me manage your money",
      "My business needs funds",
    ],
    severity: "critical",
    category: "scam",
  },

  tech_support_scam: {
    name: "Tech Support Scam",
    description: "Fake technical problems requiring immediate action",
    markers: [
      "Your computer has a virus",
      "Remote access needed",
      "Download this software",
      "Your device is compromised",
      "Call this number immediately",
      "Security alert detected",
      "Allow me to fix your computer",
    ],
    severity: "critical",
    category: "scam",
  },

  lottery_inheritance: {
    name: "Lottery/Inheritance Scam",
    description: "Fake winnings or unexpected inheritance",
    markers: [
      "You've inherited",
      "Lottery winner",
      "Unclaimed funds",
      "Distant relative",
      "Legal representative",
      "Claim your inheritance",
      "Bank in Nigeria",
      "Foreign prince",
    ],
    severity: "high",
    category: "scam",
  },

  investment_scam: {
    name: "Investment Scam",
    description: "Fake investment opportunities with guaranteed returns",
    markers: [
      "Guaranteed profit",
      "Risk-free investment",
      "Insider information",
      "Get rich quick",
      "Crypto opportunity",
      "Double your money",
      "Secret trading strategy",
      "Limited spots available",
    ],
    severity: "critical",
    category: "scam",
  },

  job_scam: {
    name: "Job/Employment Scam",
    description: "Fake job offers requiring payment or information",
    markers: [
      "Work from home $5000/week",
      "No experience needed",
      "Send your bank details for payment",
      "Training fee required",
      "Equipment purchase needed",
      "Too good salary",
      "Interview via text only",
    ],
    severity: "high",
    category: "scam",
  },

  sms_smishing: {
    name: "SMS Smishing",
    description: "Phishing via text message",
    markers: [
      "Package delivery failed",
      "Unusual activity detected",
      "Verify your identity via text",
      "Reply YES to confirm",
      "Click link to track",
      "Your order has been",
    ],
    severity: "high",
    category: "scam",
  },
};

// ============================================
// SELF-ANALYSIS TAXONOMY
// (Unhealthy patterns in YOUR communication)
// ============================================
export const SELF_TAXONOMY: TaxonomyMap = {
  over_apologizing: {
    name: "Over-Apologizing",
    description: "Excessive apologies, even when not at fault",
    markers: [
      "I'm sorry for",
      "Sorry to bother you",
      "I'm so sorry if",
      "Sorry sorry sorry",
      "I apologize for existing",
      "My fault, I'm sorry",
      "Sorry for asking",
    ],
    severity: "medium",
    category: "self",
  },

  minimizing_needs: {
    name: "Minimizing Your Needs",
    description: "Downplaying your own feelings and needs",
    markers: [
      "It's not a big deal",
      "I'm probably overreacting",
      "Never mind, it's fine",
      "I don't want to be difficult",
      "It doesn't matter",
      "I can handle it",
      "I shouldn't feel this way",
    ],
    severity: "medium",
    category: "self",
  },

  fawning: {
    name: "Fawning Response",
    description: "People-pleasing to avoid conflict or danger",
    markers: [
      "Whatever you want",
      "You're right",
      "I'll do anything",
      "I don't have an opinion",
      "You decide",
      "I just want you to be happy",
      "I don't want to cause problems",
    ],
    severity: "high",
    category: "self",
  },

  self_blame: {
    name: "Self-Blame",
    description: "Taking responsibility for others' behavior",
    markers: [
      "It's my fault they",
      "I made them angry",
      "If I had just",
      "I should have known",
      "I brought this on myself",
      "I deserve this",
      "Maybe I am crazy",
    ],
    severity: "high",
    category: "self",
  },

  trauma_bonding_language: {
    name: "Trauma Bonding Language",
    description: "Defending or excusing abusive behavior",
    markers: [
      "But they also do nice things",
      "They didn't mean it",
      "It only happens sometimes",
      "They had a hard childhood",
      "They're stressed",
      "They love me in their way",
      "It's not always bad",
    ],
    severity: "high",
    category: "self",
  },

  seeking_validation: {
    name: "Excessive Validation Seeking",
    description: "Constantly checking if you're okay/liked",
    markers: [
      "Are you mad at me",
      "Did I do something wrong",
      "Do you still love me",
      "Are we okay",
      "Please don't be upset",
      "Tell me we're fine",
      "Do you hate me",
    ],
    severity: "medium",
    category: "self",
  },

  walking_on_eggshells: {
    name: "Walking on Eggshells",
    description: "Excessive caution to avoid triggering others",
    markers: [
      "I didn't want to upset you",
      "I was afraid to say",
      "I wasn't sure if I should",
      "Please don't get mad",
      "I hope this is okay to ask",
      "I know this might upset you but",
    ],
    severity: "high",
    category: "self",
  },

  healthy_communication: {
    name: "Healthy Self-Expression",
    description: "Clear, confident communication patterns",
    markers: [
      "I feel",
      "I need",
      "My boundary is",
      "I'm not comfortable with",
      "That doesn't work for me",
      "I disagree",
      "I appreciate you but",
    ],
    severity: "none",
    category: "self",
  },
};

// ============================================
// COMBINED TAXONOMY
// ============================================
export const FULL_TAXONOMY: TaxonomyMap = {
  ...RELATIONSHIP_TAXONOMY,
  ...SCAM_TAXONOMY,
  ...SELF_TAXONOMY,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getTaxonomyForMode(mode: "relationship" | "scam" | "self_analysis"): TaxonomyMap {
  switch (mode) {
    case "relationship":
      return RELATIONSHIP_TAXONOMY;
    case "scam":
      return SCAM_TAXONOMY;
    case "self_analysis":
      return SELF_TAXONOMY;
    default:
      return RELATIONSHIP_TAXONOMY;
  }
}

export function getTacticByKey(key: string): TacticDefinition | undefined {
  return FULL_TAXONOMY[key];
}

export function getAllTacticKeys(category?: "relationship" | "scam" | "self"): string[] {
  if (!category) return Object.keys(FULL_TAXONOMY);
  
  return Object.entries(FULL_TAXONOMY)
    .filter(([, tactic]) => tactic.category === category)
    .map(([key]) => key);
}

export function getToxicTactics(category?: "relationship" | "scam" | "self"): TacticDefinition[] {
  const tactics = category 
    ? Object.values(getTaxonomyForMode(category === "self" ? "self_analysis" : category))
    : Object.values(FULL_TAXONOMY);
    
  return tactics.filter((tactic) => tactic.severity !== "none");
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#ef4444"; // red-500
    case "high":
      return "#f97316"; // orange-500
    case "medium":
      return "#eab308"; // yellow-500
    case "low":
      return "#22c55e"; // green-500
    default:
      return "#6b7280"; // gray-500
  }
}

export function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case "critical":
      return "🚨";
    case "high":
      return "🔴";
    case "medium":
      return "🟠";
    case "low":
      return "🟡";
    default:
      return "💚";
  }
}

export function getThreatLevelFromTactics(
  tactics: Array<{ severity: string }>
): "green" | "yellow" | "orange" | "red" {
  if (tactics.length === 0) return "green";
  
  const hasCritical = tactics.some((t) => t.severity === "critical");
  const hasHigh = tactics.some((t) => t.severity === "high");
  const hasMedium = tactics.some((t) => t.severity === "medium");
  
  if (hasCritical) return "red";
  if (hasHigh) return "orange";
  if (hasMedium) return "yellow";
  return "green";
}

// For backward compatibility
export const MANIPULATION_TAXONOMY = RELATIONSHIP_TAXONOMY;
export type ManipulationTactic = TacticDefinition;
export type ManipulationTaxonomy = TaxonomyMap;
