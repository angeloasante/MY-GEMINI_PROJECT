# Guardian Business Mode - Technical Documentation

## Overview

Guardian Business Mode is a comprehensive AI-powered suite for business document analysis, fraud detection, and travel planning. It extends the Gaslighter Detect application with four specialized agents designed to protect businesses and travelers from common pitfalls.

**Key Feature:** Business Mode now uses the **same chat interface as Personal Mode** with **auto-detection**. Simply upload any document and the AI automatically detects whether it's a visa document, contract, scam email, or trip itinerary - then routes to the appropriate specialist agent.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Auto-Detection System](#auto-detection-system)
3. [Feature Agents](#feature-agents)
   - [VisaLens - Document Validator](#1-visalens---document-validator)
   - [LegalLens - Contract Analyzer](#2-legallens---contract-analyzer)
   - [B2B ScamShield - Fraud Detection](#3-b2b-scamshield---fraud-detection)
   - [TripGuard - Multi-City Travel Planner](#4-tripguard---multi-city-travel-planner)
4. [API Routes](#api-routes)
5. [Type System](#type-system)
6. [Database Schema](#database-schema)
7. [Usage Guide](#usage-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Chat Interface                        │
│  /app/page.tsx                                                  │
│  ├── ModeToggle (Personal ↔ Business)                           │
│  ├── ChatMessages (renders both modes)                          │
│  └── ChatInput (with image/document upload)                     │
├─────────────────────────────────────────────────────────────────┤
│                        API Routes                                │
│  /app/api/                                                      │
│  ├── business-analyze/route.ts  (AUTO-DETECT + routing)         │
│  ├── business-chat/route.ts     (Text chat for business)        │
│  ├── business/route.ts          (Unified business orchestrator) │
│  ├── business/visa/route.ts     (Direct visa analysis)          │
│  ├── business/legal/route.ts    (Direct contract analysis)      │
│  ├── business/scam/route.ts     (Direct fraud detection)        │
│  └── business/trip/route.ts     (Direct travel planning)        │
├─────────────────────────────────────────────────────────────────┤
│                      Agent Layer                                 │
│  /lib/agents/business/                                          │
│  ├── visa-lens.ts            (Document validation logic)        │
│  ├── legal-lens.ts           (Contract parsing & analysis)      │
│  ├── scam-shield.ts          (Pattern matching & detection)     │
│  ├── trip-guard.ts           (Multi-city planning logic)        │
│  ├── business-guardian.ts    (Response synthesis)               │
│  └── index.ts                (Exports)                          │
├─────────────────────────────────────────────────────────────────┤
│                      Type Definitions                            │
│  /types/business.ts          (All TypeScript interfaces)        │
├─────────────────────────────────────────────────────────────────┤
│                      Database (Supabase)                         │
│  - visa_applications, visa_documents                            │
│  - contract_reviews, contract_review_flags                      │
│  - scam_reports, scam_report_patterns                           │
│  - trip_plans, trip_stops                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Auto-Detection System

The auto-detection system is the core of Business Mode, allowing users to simply upload any document without specifying its type.

### How It Works

```
User uploads document → Gemini Vision analyzes → Detects type → Routes to agent → Synthesizes response
```

### Detection Categories

| Type | Detected Content | Agent |
|------|------------------|-------|
| `visa` | Passports, visa stamps, travel documents, immigration papers | VisaLens |
| `legal` | Contracts, agreements, NDAs, employment contracts, leases | LegalLens |
| `scam` | Suspicious emails, phishing attempts, fake invoices | ScamShield |
| `trip` | Travel itineraries, flight bookings, hotel reservations | TripGuard |
| `unknown` | Unrecognized content | Returns helpful guidance |

### API Endpoint: `/api/business-analyze`

```typescript
// Request
POST /api/business-analyze
{
  "imageData": "base64...",  // Document image
  "mimeType": "image/jpeg",
  "textContent": "optional text",
  "userId": "user-id",
  "includeVoice": true
}

// Response
{
  "success": true,
  "detectedType": "visa",
  "detection": {
    "type": "visa",
    "confidence": 0.95,
    "reasoning": "Document contains passport information...",
    "extractedText": "...",
    "extractedData": { ... }
  },
  "response": "Full markdown analysis...",
  "voiceResponse": "Voice-optimized version...",
  "timing": { "totalMs": 2500 }
}
```

### Frontend Integration

In `app/page.tsx`, Business Mode uses the same `ChatInput` component as Personal Mode:

```tsx
// Business mode with auto-detect
<ChatInput
  onSendMessage={handleBusinessMessage}
  onSendImage={handleBusinessImageAnalysis}  // ← Auto-detect handler
  isLoading={isLoading}
  placeholder="Upload a document or ask about visas, contracts, scams..."
/>
```

The `handleBusinessImageAnalysis` function:
1. Creates a user message with image preview
2. Calls `/api/business-analyze` with the image
3. Displays the detected type badge (🛂 VISA, 📝 LEGAL, 🚨 SCAM, ✈️ TRIP)
4. Shows the synthesized response
5. Updates chat title based on detected type

---

## Feature Agents

### 1. VisaLens - Document Validator

**Purpose:** Analyzes travel documents (passports, bank statements, employment letters) and validates them against visa requirements.

**How It Works:**

1. **Auto-Detection:** User uploads a travel document in Business Mode chat
2. **Type Recognition:** AI detects it's a visa-related document (passport, visa stamp, etc.)
3. **OCR/Extraction:** Documents are analyzed for text extraction
4. **Validation:** Each document is validated against visa requirements
5. **Checklist Generation:** A checklist shows which requirements are met/missing
6. **Approval Likelihood:** An approval percentage is calculated based on document quality

**Key Features:**
- Automatic document type detection
- Passport expiry validation
- Bank balance threshold checking
- Missing document detection
- Country-specific requirements

**Detected Document Types:**
- Passports and visa stamps
- Bank statements
- Employment letters
- Hotel/flight bookings
- Invitation letters
- Insurance documents

**Direct API Endpoint:** `POST /api/business/visa`
- For programmatic access without auto-detection
- Accepts: JSON with document data
- Returns: `VisaLensOutput` with analysis results

---

### 2. LegalLens - Contract Analyzer

**Purpose:** Analyzes contracts and legal documents to identify red flags, unfavorable clauses, and provides plain English translations.

**How It Works:**

1. **Auto-Detection:** User uploads a contract or legal document
2. **Type Recognition:** AI detects it's a legal document (contract, NDA, etc.)
3. **Clause Extraction:** AI identifies and extracts key clauses
4. **Red Flag Detection:** Each clause is checked against known problematic patterns
5. **Risk Assessment:** Overall contract risk is calculated
6. **Plain English:** Complex legal jargon is translated to understandable language

**Red Flag Types Detected:**
- Non-compete clauses
- Broad IP assignment
- Mandatory arbitration
- Class action waivers
- Unilateral termination rights
- Asymmetric liability
- Auto-renewal traps
- Unfavorable jurisdiction

**Detected Document Types:**
- General contracts
- NDAs (Non-Disclosure Agreements)
- Employment agreements
- Lease agreements
- Terms of service
- Partnership agreements

**Direct API Endpoint:** `POST /api/business/legal`
- For programmatic access without auto-detection
- Accepts: JSON with contract text or document
- Returns: `LegalLensOutput` with red flags and recommendations

---

### 3. B2B ScamShield - Fraud Detection

**Purpose:** Detects business email compromise (BEC), invoice fraud, and other B2B scam patterns.

**How It Works:**

1. **Auto-Detection:** User uploads suspicious email or invoice screenshot
2. **Type Recognition:** AI detects scam indicators
3. **Pattern Matching:** Content is analyzed for known scam indicators
4. **Domain Verification:** Sender domains are checked for spoofing
5. **Risk Scoring:** A 0-100 risk score is calculated
6. **Action Recommendations:** Specific steps to verify or report are provided

**Scam Patterns Detected:**
- CEO/Executive fraud
- Invoice manipulation
- Vendor impersonation
- Payment redirect requests
- Advance fee schemes
- Fake RFPs
- Domain spoofing
- Urgency/pressure tactics

**Detected Content Types:**
- Phishing emails
- Suspicious invoices
- Payment request emails
- Fake vendor communications
- Wire transfer requests

**Direct API Endpoint:** `POST /api/business/scam`
- For programmatic access without auto-detection
- Accepts: JSON with email/invoice content
- Returns: `ScamShieldOutput` with detection results

---

### 4. TripGuard - Multi-City Travel Planner

**Purpose:** Plans multi-destination trips with visa requirements, travel advisories, and document checklists for each stop.

**How It Works:**

1. **Auto-Detection:** User uploads a trip itinerary or travel booking screenshot
2. **Type Recognition:** AI detects it's travel-related content
3. **Per-Stop Analysis:** Each destination is analyzed for visa requirements
4. **Advisory Checks:** Travel advisories are fetched for each country
5. **Document Consolidation:** A unified document checklist is generated
6. **Route Optimization:** Suggested ordering based on visa processing times

**Detected Content Types:**
- Flight booking confirmations
- Hotel reservations
- Travel itineraries
- Multi-city trip plans

**Direct API Endpoint:** `POST /api/business/trip`
- For programmatic access without auto-detection
- Accepts: JSON with stops array
- Returns: `TripGuardOutput` with per-stop analysis

---

## Chat Interface

### Unified Experience

Business Mode now uses the **same chat interface** as Personal Mode. Users toggle between modes using the `ModeToggle` component:

```tsx
// In app/page.tsx
<ModeToggle
  mode={appMode}  // "personal" | "business"
  onModeChange={handleModeChange}
/>
```

### Message Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT INTERFACE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📎 Attach Button                                               │
│  │                                                              │
│  └─► User attaches document/screenshot                          │
│      │                                                          │
│      └─► ChatInput creates base64 preview                       │
│          │                                                      │
│          └─► User clicks Send                                   │
│              │                                                  │
│              └─► handleBusinessImageAnalysis() called           │
│                  │                                              │
│                  ├─► Creates user message with image            │
│                  │                                              │
│                  ├─► POST /api/business-analyze                 │
│                  │   │                                          │
│                  │   ├─► detectDocumentType() via Gemini        │
│                  │   │                                          │
│                  │   ├─► Routes to appropriate agent            │
│                  │   │                                          │
│                  │   └─► synthesizeBusinessResponse()           │
│                  │                                              │
│                  └─► Creates assistant message with results     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Text Chat

For general questions (not document uploads), Business Mode uses `/api/business-chat`:

```typescript
// Text questions go to business-chat
const handleBusinessMessage = async (content: string) => {
  // ... creates user message
  const response = await fetch("/api/business-chat", {
    method: "POST",
    body: JSON.stringify({ messages: [...] }),
  });
  // ... creates assistant message
};
```

### Chat Persistence

Both modes persist chats to the database with appropriate types:

```typescript
// Creating a new business chat
const newChat = await createChat(
  user.id,
  "business",  // Chat type
  "📊 Business Analysis",  // Default title
  componentToDbMessages(messages)
);

// Title updates based on detected type
const typeTitle = {
  visa: "🛂 Visa Document Analysis",
  legal: "📝 Contract Review",
  scam: "🚨 Scam Detection",
  trip: "✈️ Trip Planning",
  unknown: "📊 Document Analysis",
};
```

---

## API Routes

### Auto-Detect Endpoint: `/api/business-analyze/route.ts`

The primary endpoint for Business Mode document analysis with automatic type detection.

```typescript
// Request
POST /api/business-analyze
{
  "imageData": "base64...",
  "mimeType": "image/jpeg",
  "textContent": "optional",
  "userId": "user-id",
  "includeVoice": true
}

// Response
{
  "success": true,
  "detectedType": "visa" | "legal" | "scam" | "trip" | "unknown",
  "detection": {
    "type": "...",
    "confidence": 0.95,
    "reasoning": "...",
    "extractedText": "...",
    "extractedData": { ... }
  },
  "response": "Full markdown response",
  "voiceResponse": "Voice-optimized version",
  "timing": { "totalMs": 2500 }
}
```

### Text Chat Endpoint: `/api/business-chat/route.ts`

For general business questions without document uploads.

```typescript
// Request
POST /api/business-chat
{
  "messages": [
    { "role": "user", "content": "What visa do I need for Japan?" }
  ]
}

// Response
{
  "content": "For visiting Japan, you'll need..."
}
```

### Main Orchestrator: `/api/business/route.ts`

This route handles direct/programmatic access to the Business Guardian without auto-detection.

```typescript
// Supported analysis types
type AnalysisType = "visa" | "legal" | "scam" | "trip";

// Request body
interface BusinessRequest {
  analysisType: AnalysisType;
  analysisInput: any; // Type varies by analysis
  userQuery?: string;
  outputFormat?: "full" | "summary" | "voice";
}
```

### Individual Feature Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/business/visa` | POST | Visa document analysis |
| `/api/business/legal` | POST | Contract analysis |
| `/api/business/scam` | POST | Fraud detection |
| `/api/business/trip` | POST | Trip planning |

---

## Type System

### Core Types (`/types/business.ts`)

```typescript
// Severity levels used across features
export type Severity = "low" | "medium" | "high" | "critical" | "blocker" | "warning" | "info";

// Risk levels for assessments
export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical" | "caution" | "danger";

// Travel advisory levels
export type TravelAdvisory = "none" | "low" | "medium" | "high" | "critical" | "safe" | "caution" | "warning" | "danger";
```

### Input/Output Pattern

Each agent follows a consistent Input → Process → Output pattern:

```typescript
// Input types define what the user provides
export interface VisaLensInput {
  documents: Array<{ imageData?: string; mimeType: string; ... }>;
  nationality?: string;
  destination?: string;
  // ... other fields
}

// Output types define what we return
export interface VisaLensOutput {
  documentsAnalyzed: AnalyzedDocument[];
  requirements: VisaRequirements;
  checklist: ChecklistItem[];
  approvalLikelihood: ApprovalLikelihood;
  approvalPercentage: number;
  // ... other fields
}
```

---

## Error Analysis & Fixes

### Root Cause: Type Misalignment

The primary source of errors was **inconsistency between type definitions and actual usage**. The types were designed with certain property names, but the API routes and UI components used different names.

### Error Categories & Solutions

#### 1. Optional vs Required Property Mismatch

**Problem:** Types defined properties as required, but they weren't always provided.

```typescript
// Original type - required properties
export interface ScamShieldInput {
  content: string;  // Required!
  contentType: "email" | "invoice";
}

// API usage - missing required property
input = {
  contentType: "email",  // ❌ Missing 'content'
  claimedSender: sender,
};
```

**Solution:** Added the missing property with a default value:

```typescript
input = {
  content: emailText || invoiceText || "",  // ✅ Always provided
  contentType: "email",
  claimedSender: sender,
};
```

#### 2. Property Name Inconsistencies

**Problem:** Types used one name, code used another.

```typescript
// Type definition
export interface VisaLensInput {
  nationality?: string;   // Uses 'nationality'
  destination?: string;   // Uses 'destination'
}

// UI/API usage
const input = {
  passportCountry: "US",     // ❌ Different name
  destinationCountry: "UK",  // ❌ Different name
};
```

**Solution:** Added backward-compatible aliases:

```typescript
export interface VisaLensInput {
  nationality?: string;
  destination?: string;
  // Aliases for backward compatibility
  passportCountry?: string;
  destinationCountry?: string;
}

// In agent code, use with fallbacks:
const nationality = input.nationality || input.passportCountry || "";
```

#### 3. "Possibly Undefined" Errors

**Problem:** Strict null checks flagged properties that might be undefined.

```typescript
// Original code
for (const flag of result.redFlags) {  // ❌ redFlags possibly undefined
  // ...
}
```

**Solution:** Added null coalescing or optional chaining:

```typescript
// Fixed code
for (const flag of result.redFlags || []) {  // ✅ Default to empty array
  // ...
}

// Or with optional chaining
result.redFlags?.map(flag => ...)
```

#### 4. Union Type Property Access

**Problem:** When a variable could be multiple types, TypeScript doesn't allow accessing properties unique to one type.

```typescript
// stops could be TripStopResult[] or PerStopAnalysis[]
// TripStopResult has 'city' and 'duration'
// PerStopAnalysis does not

result.stops.map(stop => (
  <Card
    city={stop.city}      // ❌ 'city' doesn't exist on PerStopAnalysis
    duration={stop.duration}  // ❌ 'duration' doesn't exist on PerStopAnalysis
  />
));
```

**Solution:** Use type guards with the "in" operator:

```typescript
result.stops.map((stop: TripStopResult | PerStopAnalysis) => (
  <Card
    city={"city" in stop ? stop.city : undefined}           // ✅ Type guard
    duration={"duration" in stop ? stop.duration : 0}       // ✅ Type guard
  />
));
```

#### 5. Severity Type Incompatibility

**Problem:** The `Severity` type had more values than the UI component expected.

```typescript
// Type definition (extended)
export type Severity = "low" | "medium" | "high" | "critical" | "blocker" | "warning" | "info";

// UI component (limited)
interface RedFlagCardProps {
  severity: "critical" | "high" | "medium" | "low";  // No "blocker", "warning", "info"
}
```

**Solution:** Created a conversion function:

```typescript
const convertSeverity = (severity: string): "critical" | "high" | "medium" | "low" => {
  switch (severity.toLowerCase()) {
    case "critical":
    case "blocker":
      return "critical";
    case "high":
      return "high";
    case "medium":
    case "warning":
      return "medium";
    default:
      return "low";
  }
};
```

#### 6. URLSearchParams Type Error

**Problem:** `URLSearchParams` constructor doesn't accept objects with optional properties.

```typescript
// Original - fails if input.nationality is undefined
const params = new URLSearchParams({
  from: input.nationality,  // ❌ Type 'string | undefined' not assignable
  destinations: stops,
});
```

**Solution:** Build params incrementally:

```typescript
const nationality = input.nationality || input.passportCountry || "";
const params = new URLSearchParams();
params.append("from", nationality);  // ✅ String guaranteed
params.append("destinations", stops);
```

### Summary Table of Fixes

| File | Error | Root Cause | Fix |
|------|-------|------------|-----|
| `visa-lens.ts` | `input.nationality` undefined | Optional prop access | Added fallback `\|\| input.passportCountry \|\| ""` |
| `trip-guard.ts` | `stop.days` undefined | Optional property | Used `stop.days \|\| stop.duration \|\| 1` |
| `scam/route.ts` | Missing `content` property | Required in type | Added `content: emailText \|\| ""` |
| `legal/route.ts` | `result.redFlags` undefined | Optional array | Changed to `result.redFlags \|\| []` |
| `trip-guard-panel.tsx` | `stop.city` doesn't exist | Union type | Added `"city" in stop ? stop.city : undefined` |
| `legal-lens-panel.tsx` | Severity incompatible | Extended vs limited enum | Added `convertSeverity()` function |
| `visa-lens-panel.tsx` | `Issue` not found | Missing import | Added `import type { Issue } from "@/types/business"` |

---

## Database Schema

The business mode stores analysis results for user history and analytics:

```sql
-- Visa Applications
CREATE TABLE visa_applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  destination_country TEXT,
  passport_country TEXT,
  travel_date DATE,
  approval_likelihood TEXT,
  approval_percentage INTEGER,
  created_at TIMESTAMPTZ
);

-- Contract Reviews
CREATE TABLE contract_reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  contract_type TEXT,
  overall_risk TEXT,
  risk_score INTEGER,
  recommend_lawyer BOOLEAN,
  created_at TIMESTAMPTZ
);

-- Scam Reports
CREATE TABLE scam_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  content_type TEXT,
  scam_likelihood TEXT,
  confidence_score DECIMAL,
  is_scam BOOLEAN,
  created_at TIMESTAMPTZ
);

-- Trip Plans
CREATE TABLE trip_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  passport_country TEXT,
  total_countries INTEGER,
  total_days INTEGER,
  visas_required INTEGER,
  estimated_cost TEXT,
  created_at TIMESTAMPTZ
);
```

---

## Usage Guide

### Accessing Business Mode

1. Open the main chat interface at `/`
2. Click the mode toggle in the top-right corner
3. Select "Business" mode
4. You're now in Business Mode with the same familiar chat interface!

### Auto-Detect Workflow (Recommended)

The easiest way to use Business Mode:

1. **Click the 📎 attachment button** in the chat input
2. **Upload any business document** (passport, contract, suspicious email, etc.)
3. **Click Send** - the AI will automatically:
   - Detect the document type
   - Route to the appropriate specialist agent
   - Return a comprehensive analysis

**That's it!** No need to select which feature to use - the AI figures it out.

### Example Workflows

#### Analyzing a Visa Document
1. Switch to Business Mode
2. Attach a photo of your passport or visa
3. Press Send
4. AI detects "🛂 VISA" and provides:
   - Document validation results
   - Expiry warnings
   - Missing requirements
   - Next steps

#### Reviewing a Contract
1. Switch to Business Mode
2. Attach a screenshot of the contract
3. Press Send
4. AI detects "📝 LEGAL" and provides:
   - Red flags identified
   - Risk assessment
   - Plain English explanation
   - Negotiation recommendations

#### Checking a Suspicious Email
1. Switch to Business Mode
2. Attach a screenshot of the email
3. Press Send
4. AI detects "🚨 SCAM" and provides:
   - Scam likelihood verdict
   - Red flag patterns found
   - Evidence breakdown
   - Protective actions to take

#### Planning a Trip
1. Switch to Business Mode
2. Attach a flight booking or itinerary screenshot
3. Press Send
4. AI detects "✈️ TRIP" and provides:
   - Visa requirements per destination
   - Travel advisories
   - Document checklist
   - Timeline recommendations

### Text-Based Questions

You can also ask questions without uploading documents:

- "What visa do I need for Japan as a US citizen?"
- "What documents are required for a UK business visa?"
- "How do I spot invoice fraud?"

### Direct API Access

For programmatic access, use the direct API routes:
- `POST /api/business/visa` - Visa analysis
- `POST /api/business/legal` - Contract analysis
- `POST /api/business/scam` - Scam detection
- `POST /api/business/trip` - Trip planning

---

## Future Enhancements

1. **Real-time Diaspora AI Integration:** Connect to live visa requirements API
2. **Document OCR:** Enhanced text extraction from uploaded images
3. **Email Parser:** Direct email forwarding for scam analysis
4. **Trip Sharing:** Export itineraries as PDF or share links
5. **Alerts:** Notifications for visa expiry or travel advisory changes
6. **Multi-language:** Support for contract analysis in multiple languages
7. **Batch Processing:** Analyze multiple documents at once

---

## Contributing

When adding new features to Business Mode:

1. Define types in `/types/business.ts`
2. Create agent logic in `/lib/agents/business/`
3. Add API route in `/app/api/business/`
4. Update auto-detection in `/app/api/business-analyze/route.ts`
5. Update the `handleBusinessImageAnalysis` function in `/app/page.tsx`
6. Update database schema if persistence needed
7. Run `npx tsc --noEmit` to verify no type errors

---

*Documentation last updated: February 4, 2026*
