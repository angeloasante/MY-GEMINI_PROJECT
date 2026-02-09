// ============================================
// Cleir    - BUSINESS MODE TYPES
// TypeScript definitions for all business agents
// ============================================

// ============================================
// COMMON TYPES
// ============================================

export type Severity = "low" | "medium" | "high" | "critical" | "blocker" | "warning" | "info";
export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical" | "caution" | "danger";
export type ApprovalLikelihood = "high" | "medium" | "low";
export type ScamLikelihood = "safe" | "suspicious" | "likely_scam";

export interface Issue {
  issue: string;
  severity: Severity;
  fix: string;
}

// ============================================
// VISALENS TYPES - Document Validator
// ============================================

export type DocumentType =
  | "passport"
  | "bank_statement"
  | "employment_letter"
  | "photo"
  | "tb_test"
  | "hotel_booking"
  | "flight_booking"
  | "invitation_letter"
  | "insurance"
  | "itinerary"
  | "other";

export interface VisaLensInput {
  documents: Array<{
    imageData?: string;
    content?: string;
    mimeType: string;
    fileName?: string;
    filename?: string;
    type?: DocumentType;
  }>;
  nationality?: string;
  destination?: string;
  destinationCountry?: string;
  passportCountry?: string;
  visaType?: "tourist" | "business" | "work" | "student" | "transit";
  tripPurpose?: "tourism" | "business" | "study" | "work" | "transit" | "medical";
  travelDate?: string;
  durationDays?: number;
  tripDuration?: number;
}

export interface ExtractedPassport {
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  expiryDate: string;
  issueDate: string;
  gender: string;
  placeOfBirth?: string;
  issuingAuthority?: string;
}

export interface ExtractedBankStatement {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  currentBalance: number;
  averageBalance?: number;
  statementPeriod: {
    from: string;
    to: string;
  };
  transactions?: number;
}

export interface ExtractedEmploymentLetter {
  employeeName: string;
  employer: string;
  position: string;
  startDate: string;
  salary?: number;
  salaryCurrency?: string;
  letterDate: string;
  signatoryName?: string;
  signatoryPosition?: string;
}

export interface AnalyzedDocument {
  type: DocumentType;
  fileName?: string;
  extracted: ExtractedPassport | ExtractedBankStatement | ExtractedEmploymentLetter | Record<string, unknown>;
  issues: Issue[];
  isValid: boolean;
  confidence: number;
}

export interface VisaRequirements {
  source: "Diaspora AI API";
  visaRequired: boolean;
  visaType: string;
  processingDays: number;
  financialThreshold: string;
  documentsRequired: string[];
  applicationUrl?: string;
  fees?: {
    amount: number;
    currency: string;
  };
  additionalRequirements?: string[];
}

export interface ChecklistItem {
  requirement?: string;
  status: "met" | "missing" | "issue" | "complete" | "incomplete" | "pending" | "not_applicable";
  details?: string;
  documentType?: DocumentType;
  item?: string;
  notes?: string;
  required?: boolean;
}

export interface VisaLensOutput {
  documentsAnalyzed: AnalyzedDocument[];
  requirements: VisaRequirements;
  checklist: ChecklistItem[];
  approvalLikelihood: ApprovalLikelihood;
  approvalPercentage: number;
  missingDocuments: string[];
  criticalIssues: string[];
  recommendations: string[];
  diasporaLink: string;
  formattedResponse: {
    header: string;
    documentsSection: string;
    checklistSection: string;
    issuesSection: string;
    recommendationsSection: string;
  };
  // Legacy fields for UI compatibility
  visaRequired?: boolean;
  visaType?: string;
  processingTime?: string;
  estimatedCost?: number;
  documentAnalysis?: AnalyzedDocument[];
  issues?: Issue[];
  nextSteps?: string[];
  embassyInfo?: string;
}

// ============================================
// LEGALLENS TYPES - Contract Analyzer
// ============================================

export type ContractType =
  | "employment"
  | "nda"
  | "service"
  | "freelance"
  | "lease"
  | "partnership"
  | "contract"
  | "terms_of_service"
  | "employment_agreement"
  | "loan_agreement"
  | "partnership_agreement"
  | "other";

export type RedFlagType =
  | "non_compete"
  | "ip_assignment_broad"
  | "ip_assignment_work"
  | "mandatory_arbitration"
  | "class_action_waiver"
  | "unilateral_termination"
  | "asymmetric_liability"
  | "auto_renewal"
  | "long_notice_period"
  | "non_solicitation"
  | "broad_confidentiality"
  | "indemnification"
  | "unfavorable_jurisdiction"
  | "penalty_clauses"
  | "assignment_without_consent";

export interface LegalLensInput {
  contractText?: string;
  pdfBase64?: string;
  mimeType?: string;
  contractType?: ContractType;
  documentText?: string;
  documentContent?: string;
  documentMimeType?: string;
  documentFilename?: string;
  documentType?: ContractType;
  focusAreas?: RedFlagType[];
}

export interface AnalyzedClause {
  clauseId: string;
  clauseName: string;
  originalText: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  redFlagType?: RedFlagType;
  marketComparison?: string;
  negotiationTip?: string;
}

export interface RedFlag {
  flag?: ScamPatternType;
  flagName?: string;
  type?: RedFlagType;
  evidence?: string;
  severity: Severity;
  clauseText?: string;
  explanation?: string;
  location?: string;
  negotiationTip?: string;
}

export interface LegalLensOutput {
  contractType: ContractType;
  parties: string[];
  effectiveDate?: string;
  termLength?: string;

  clausesAnalyzed: AnalyzedClause[];
  analyzedClauses?: AnalyzedClause[];

  overallRisk: RiskLevel;
  riskScore: number;

  dangerClauses: string[];
  cautionClauses: string[];
  safeClauses: string[];

  mustNegotiate: string[];
  negotiationPoints?: string[];

  recommendLawyer: boolean;
  lawyerThreshold?: string;

  summary?: string;
  redFlags?: RedFlag[];
  keyTerms?: string[];
  plainEnglish?: string;
  recommendations?: string[];

  formattedResponse: {
    header: string;
    summarySection: string;
    clausesSection: string;
    translationsSection: string;
    actionSection: string;
  };
}

// ============================================
// B2B SCAMSHIELD TYPES - Business Fraud   ion
// ============================================

export type ScamPatternType =
  | "ceo_fraud"
  | "invoice_manipulation"
  | "vendor_impersonation"
  | "payment_redirect"
  | "advance_fee_b2b"
  | "fake_rfp"
  | "domain_spoofing"
  | "urgency_pressure"
  | "overpayment_scam"
  | "directory_scam"
  | "fake_compliance"
  | "supply_chain_attack";

export type SuspiciousPaymentMethod =
  | "wire_transfer"
  | "cryptocurrency"
  | "gift_cards"
  | "money_order"
  | "western_union"
  | "paypal_friends"
  | "zelle_strangers";

export interface ScamShieldInput {
  content: string;
  contentType: "email" | "invoice" | "message" | "document" | "website";
  senderEmail?: string;
  senderDomain?: string;
  claimedCompany?: string;
  invoiceAmount?: number;
  paymentDetails?: string;
  imageData?: string;
  mimeType?: string;
  emailText?: string;
  emailContent?: string;
  emailMimeType?: string;
  invoiceText?: string;
  invoiceContent?: string;
  invoiceMimeType?: string;
  claimedSender?: string;
  claimedAmount?: number;
}

export interface VerificationResult {
  domainLegitimate: boolean | null;
  domainAge?: string;
  companyExists: boolean | null;
  emailMatchesCompany: boolean | null;
  bankDetailsChanged: boolean | null;
  emailReputation?: "good" | "neutral" | "poor" | "unknown";
  sslCertificate?: boolean;
}

export interface   edPattern {
  type: ScamPatternType;
  evidence: string;
  confidence: number;
}

export interface DomainVerification {
  domain: string;
  isSuspicious: boolean;
  legitimateDomain?: string;
  issues?: string[];
}

export interface ScamShieldOutput {
  scamLikelihood: ScamLikelihood;
  confidenceScore: number;

  redFlags: RedFlag[];
    edPatterns?:   edPattern[];

  verification: VerificationResult;
  domainVerification?: DomainVerification;

  urgencyTactics: string[];
  suspiciousPaymentMethods: SuspiciousPaymentMethod[];

  recommendedActions: string[];
  safeAlternatives?: string[];

  isScam?: boolean;
  riskScore?: number;
  riskLevel?: RiskLevel;
  analysis?: string;

  formattedResponse: {
    header: string;
    verdictSection: string;
    flagsSection: string;
    verificationSection: string;
    actionsSection: string;
  };
}

// ============================================
// TRIPGUARD TYPES - Multi-City Travel Planner
// ============================================

export type TravelPurpose =
  | "tourism"
  | "business"
  | "layover"
  | "work"
  | "study"
  | "medical"
  | "transit"
  | "family"
  | "other";

export type TravelAdvisory = "none" | "low" | "medium" | "high" | "critical" | "safe" | "caution" | "warning" | "danger";

export interface TripStop {
  country: string;
  countryName?: string;
  purpose: TravelPurpose;
  days?: number;
  duration?: number;
  city?: string;
  arrivalDate?: string;
}

export interface TripGuardInput {
  nationality?: string;
  passportCountry?: string;
  stops: TripStop[];
  tripName?: string;
  startDate?: string;
  preferences?: {
    avoidTransitVisa?: boolean;
    preferDirectFlights?: boolean;
    budgetLevel?: "budget" | "mid" | "luxury";
    prioritizeVisaFree?: boolean;
  };
}

export interface PerStopAnalysis {
  country: string;
  countryName: string;
  visaRequired: boolean;
  visaType?: string;
  visaCost?: number;
  processingDays?: number;
  processingTime?: string;
  documents: string[];
  entryRequirements?: string[];
  estimatedCost?: string;
  travelAdvisory: TravelAdvisory;
  advisoryNotes?: string;
  notes?: string;
  transitInfo?: string;
}

export interface TripStopResult extends PerStopAnalysis {
  city?: string;
  duration: number;
  purpose?: string;
}

export interface LayoverAlert {
  airport: string;
  country: string;
  transitVisaRequired: boolean;
  maxHours?: number;
  notes: string;
}

export interface CombinedDocument {
  document: string;
  forCountries: string[];
  priority: "required" | "recommended";
}

export interface CostBreakdown {
  visaFees: string;
  insurance?: string;
  photos?: string;
  translations?: string;
  total: string;
}

export interface TimelineItem {
  date: string;
  task: string;
}

export interface TripGuardOutput {
  tripSummary: {
    totalCountries: number;
    totalDays: number;
    visasRequired: number;
    estimatedVisaCost: string;
  };

  perStopAnalysis: PerStopAnalysis[];
  stops?: TripStopResult[];

  layoverAlerts: LayoverAlert[];

  combinedDocumentChecklist: CombinedDocument[];
  consolidatedDocuments?: string[];

  suggestedOrder: string[];
  orderingReason: string;

  totalEstimatedCost: CostBreakdown;

  diasporaMultiCityLink: string;

  warnings?: string[];
  timeline?: TimelineItem[];
  recommendations?: string[];
  alternativeRoutes?: string[];
  totalDays?: number;
  totalCost?: number;

  formattedResponse: {
    header: string;
    summarySection: string;
    stopsSection: string;
    alertsSection: string;
    checklistSection: string;
    costSection: string;
  };
}

// ============================================
// BUSINESS GUARDIAN TYPES
// Synthesizes all business analysis
// ============================================

export type BusinessAnalysisType = "visa" | "legal" | "scam" | "trip";

export interface BusinessGuardianInput {
  analysisType: BusinessAnalysisType;
  analysisResult?: VisaLensOutput | LegalLensOutput | ScamShieldOutput | TripGuardOutput;
  analysisResults?: {
    visa?: VisaLensOutput;
    legal?: LegalLensOutput;
    scam?: ScamShieldOutput;
    trip?: TripGuardOutput;
  };
  userQuestion?: string;
  userQuery?: string;
  outputFormat?: "full" | "summary" | "voice";
}

export interface ActionItem {
  priority: "high" | "medium" | "low";
  action: string;
  deadline?: string;
}

export interface BusinessGuardianOutput {
  headline: string;
  severity: RiskLevel;
  severityEmoji: string;

  summary: string;

  keyFindings: string[];

  actionItems: ActionItem[];

  diasporaIntegration?: {
    action: string;
    link: string;
    buttonText: string;
  };

  voiceScript: string;
  response?: string;
  diasporaLink?: string;

  formattedResponse: string;
}

// ============================================
// DIASPORA AI API TYPES
// ============================================

export interface DiasporaVisaRequest {
  nationality: string;
  destination: string;
  purpose?: string;
}

export interface DiasporaVisaResponse {
  visaRequired: boolean;
  visaType?: string;
  processingDays?: number;
  requirements?: string[];
  fees?: {
    amount: number;
    currency: string;
  };
  applicationUrl?: string;
  additionalInfo?: string;
}

export interface DiasporaFlightRedirect {
  from: string;
  to: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface BusinessAPIRequest {
  type: BusinessAnalysisType;
  input: VisaLensInput | LegalLensInput | ScamShieldInput | TripGuardInput;
  userId?: string;
  saveToDatabase?: boolean;
}

export interface BusinessAPIResponse {
  success: boolean;
  type: BusinessAnalysisType;
  result: VisaLensOutput | LegalLensOutput | ScamShieldOutput | TripGuardOutput;
  guardianResponse: BusinessGuardianOutput;
  processingTimeMs: number;
  sessionId?: string;
}
