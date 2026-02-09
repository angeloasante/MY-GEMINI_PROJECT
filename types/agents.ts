// ============================================
// Cleir    - ENHANCED AGENT TYPES
// Multi-Mode Analysis System
// ============================================

// ============================================
// ANALYSIS MODES
// ============================================
export type AnalysisMode = "relationship" | "scam" | "self_analysis";

export interface AnalysisModeConfig {
  mode: AnalysisMode;
  label: string;
  description: string;
  icon: string;
  taxonomy: string;
}

export const ANALYSIS_MODES: AnalysisModeConfig[] = [
  {
    mode: "relationship",
    label: "🚩 Relationship Analysis",
    description: "   manipulation, gaslighting, and toxic patterns",
    icon: "🚩",
    taxonomy: "relationship",
  },
  {
    mode: "scam",
    label: "🎣 Scam Shield",
    description: "Identify phishing, fraud, and social engineering",
    icon: "🎣",
    taxonomy: "scam",
  },
  {
    mode: "self_analysis",
    label: "🪞 Self Analysis",
    description: "Analyze YOUR messages for unhealthy patterns",
    icon: "🪞",
    taxonomy: "self",
  },
];

// ============================================
// INPUT TYPES
// ============================================
export interface AgentInput {
  mode?: AnalysisMode; // Optional - will be auto-  ed if not provided
  imageData?: string;
  conversationText?: string;
  mimeType?: string;
  deviceId?: string;
}

// ============================================
// AGENT 1: EXTRACTOR OUTPUT
// ============================================
export interface ExtractedMessage {
  sender: "user" | "other";
  content: string;
  timestamp?: string;
  index: number;
}

export interface ExtractedConversation {
  participants: {
    user: string;
    other: string;
  };
  messages: ExtractedMessage[];
  platform: string;
  conversationContext: string;
  relationshipType: string;
  rawText: string;
  urls?: string[];
  phoneNumbers?: string[];
  emails?: string[];
}

// ============================================
// AGENT 2: CLASSIFIER OUTPUT
// ============================================
export interface Tactic  ion {
  tactic: string;
  tacticName: string;
  category: "relationship" | "scam" | "self";
  confidence: number;
  evidenceQuotes: string[];
  messageIndices: number[];
  severity: "none" | "low" | "medium" | "high" | "critical";
}

export interface UrlSafetyCheck {
  url: string;
  safe: boolean;
  reason: string;
  riskLevel: "safe" | "suspicious" | "dangerous";
}

export interface SelfPattern {
  pattern: string;
  patternName: string;
  frequency: "rare" | "occasional" | "frequent" | "constant";
  examples: string[];
  healthierAlternative: string;
  rootCause: string;
}

export interface ClassificationResult {
  mode: AnalysisMode;
  tactics  ed: Tactic  ion[];
  overallThreatLevel: "green" | "yellow" | "orange" | "red";
  primaryTactic: string;
  patternType: "isolated_incident" | "recurring_pattern" | "escalating";
  urlSafetyChecks?: UrlSafetyCheck[];
  scamType?: string;
  selfPatterns?: SelfPattern[];
}

// ============================================
// AGENT 3: PSYCHOLOGIST OUTPUT
// ============================================
export interface TacticTranslation {
  original: string;
  meaning: string;
  tacticUsed: string;
}

export interface TacticExplanation {
  tactic: string;
  whatTheyDoing: string;
  whyItWorks: string;
  longTermImpact: string;
  commonInContexts: string[];
}

export interface PsychologicalAnalysis {
  tacticsExplained: TacticExplanation[];
  translations: TacticTranslation[];
  victimValidation: string;
  relationshipHealthScore: number;
  warningSignsForFuture: string[];
  psychologicalExplanation: string;
  longTermImpact: string;
  scamExplanation?: string;
  vulnerabilityFactors?: string[];
  selfAwarenessInsights?: string;
  healingSteps?: string[];
}

// ============================================
// AGENT 4: DEFENDER OUTPUT
// ============================================
export interface RecommendedResponse {
  type: "gray_rock" | "boundary" | "exit" | "disengage" | "block" | "report";
  response: string;
  explanation: string;
}

export interface PushbackResponse {
  theyMightSay: string;
  yourCounter: string;
}

export interface SafetyResource {
  name: string;
  contact: string;
  description: string;
  url?: string;
}

export interface DefenseStrategies {
  recommendedResponses: RecommendedResponse[];
  whatNotToSay: string[];
  anticipatedPushback: PushbackResponse[];
  safetyResources: SafetyResource[] | null;
  immediateActions: string[];
  grayRockTechnique?: string;
  reportingSteps?: string[];
  financialProtection?: string[];
  selfCareActions?: string[];
  boundaryPractice?: string[];
}

// ============================================
// AGENT 5: GUARDIAN OUTPUT
// ============================================
export interface FormattedResponse {
  redFlags: string;
  breakdown: string;
  translations: string;
  yourMove: string;
  scamAlert?: string;
  urgentActions?: string;
  selfReflection?: string;
  growthPlan?: string;
}

export interface GuardianResponse {
  summaryHeadline: string;
  severityEmoji: "💚" | "🟡" | "🟠" | "🔴" | "🚨";
  formattedResponse: FormattedResponse;
  voiceScript: string;
  fullMarkdownResponse: string;
}

// ============================================
// FINAL ANALYSIS RESULT
// ============================================
export interface Mode  ionMetadata {
    edMode: AnalysisMode;
  confidence: number;
  reasoning: string;
  wasAuto  ed: boolean;
}

export interface AnalysisResult {
  sessionId: string;
  timestamp: string;
  mode: AnalysisMode;
  extraction: ExtractedConversation;
  classification: ClassificationResult;
  psychology: PsychologicalAnalysis;
  defenses: DefenseStrategies;
  guardian: GuardianResponse;
  metadata: {
    processingTimeMs: number;
    agentsUsed: string[];
    modelVersion: string;
    mode  ion?: Mode  ionMetadata;
  };
  // Backward compatibility
  guardianResponse?: GuardianResponse;
  raw?: {
    extracted: ExtractedConversation;
    classification: ClassificationResult;
    psychology: PsychologicalAnalysis;
    defense: DefenseStrategies;
  };
}

// ============================================
// TAXONOMY TYPES
// ============================================
export interface TacticDefinition {
  name: string;
  description: string;
  indicators?: string[];
  markers?: string[];  // alias for indicators
  examples?: string[];
  severity: "none" | "low" | "medium" | "high" | "critical";
  longTermImpact?: string;
  category: "relationship" | "scam" | "self";
}

export type TaxonomyMap = Record<string, TacticDefinition>;

// Backward compatibility alias
export type ManipulationTactic = TacticDefinition;
export type ManipulationTaxonomy = TaxonomyMap;

// ============================================
// HISTORY & ANALYTICS TYPES
// ============================================
export interface AnalysisHistoryItem {
  id: string;
  mode: AnalysisMode;
  threatLevel: string;
  healthScore: number | null;
  primaryTactic: string;
  tacticsCount: number;
  platform: string;
  createdAt: string;
  summaryHeadline?: string;
}

export interface TacticStatistic {
  tacticKey: string;
  tacticName: string;
  count: number;
  avgConfidence: number;
}

export interface HealthTrendPoint {
  date: string;
  score: number;
  threatLevel: string;
  relationshipLabel?: string;
}

export interface AnalyticsSummary {
  totalAnalyses: number;
  threatDistribution: Record<string, number>;
  topTactics: TacticStatistic[];
  healthTrend: HealthTrendPoint[];
  averageHealthScore: number;
  mostCommonMode: AnalysisMode;
}

// ============================================
// EVIDENCE VAULT TYPES
// ============================================
export interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  evidenceType: "screenshot" | "text" | "export";
  content?: string;
  mimeType?: string;
  tags: string[];
  folder: string;
  isStarred: boolean;
  sessionId?: string;
  createdAt: string;
}

export interface VaultFolder {
  name: string;
  itemCount: number;
  icon: string;
}

// ============================================
// PDF EXPORT TYPES
// ============================================
export interface PDFExportOptions {
  type: "single" | "timeline" | "evidence";
  sessionIds?: string[];
  dateRange?: { start: string; end: string };
  includeScreenshots: boolean;
  includeAnalysis: boolean;
  includeResponses: boolean;
  redactNames: boolean;
}

export interface PDFExportResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

// Legacy exports for backward compatibility
export type RedFlagResponse = GuardianResponse;
