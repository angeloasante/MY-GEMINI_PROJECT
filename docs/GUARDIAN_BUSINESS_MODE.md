# Guardian Business Mode - Technical Documentation

## Overview

Guardian Business Mode is a comprehensive AI-powered suite for business document analysis, fraud   ion, and travel planning. It extends the Cleir    application with four specialized agents designed to protect businesses and travelers from common pitfalls.

**Version:** 3.0 (Gemini 3 Flash Preview)  
**Last Updated:** February 5, 2026

### Key Features

- **Same Chat Interface** as Personal Mode with auto-  ion
- **Gemini 3 Flash Preview** for enhanced AI capabilities
- **AI Itinerary Generation** with Google Places API enrichment
- **Interactive Maps** with Google Maps integration
- **Mobile-Optimized UI** with responsive design and swipe gestures

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AI Model Configuration](#ai-model-configuration)
3. [Auto-  ion System](#auto-  ion-system)
4. [Feature Agents](#feature-agents)
   - [VisaLens - Document Validator](#1-visalens---document-validator)
   - [LegalLens - Contract Analyzer](#2-legallens---contract-analyzer)
   - [B2B ScamShield - Fraud   ion](#3-b2b-scamshield---fraud-  ion)
   - [TripGuard - Multi-City Travel Planner](#4-tripguard---multi-city-travel-planner)
5. [AI Itinerary System](#ai-itinerary-system)
6. [Google Maps & Places Integration](#google-maps--places-integration)
7. [API Routes](#api-routes)
8. [Type System](#type-system)
9. [Mobile Optimizations](#mobile-optimizations)
10. [Database Schema](#database-schema)
11. [Usage Guide](#usage-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Chat Interface                        │
│  /app/page.tsx                                                  │
│  ├── ModeToggle (Personal ↔ Business)                           │
│  ├── ChatMessages (renders both modes)                          │
│  ├── ChatInput (with image/document upload)                     │
│  └── ItinerarySheet (slide-up map view)                         │
├─────────────────────────────────────────────────────────────────┤
│                        API Routes                                │
│  /app/api/                                                      │
│  ├── business-analyze/route.ts  (AUTO-   + routing)         │
│  ├── business-chat/route.ts     (Text + Itinerary generation)   │
│  ├── business/route.ts          (Unified business orchestrator) │
│  ├── business/visa/route.ts     (Direct visa analysis)          │
│  ├── business/legal/route.ts    (Direct contract analysis)      │
│  ├── business/scam/route.ts     (Direct fraud   ion)        │
│  └── business/trip/route.ts     (Direct travel planning)        │
├─────────────────────────────────────────────────────────────────┤
│                      Agent Layer                                 │
│  /lib/agents/business/                                          │
│  ├── visa-lens.ts            (Document validation logic)        │
│  ├── legal-lens.ts           (Contract parsing & analysis)      │
│  ├── scam-shield.ts          (Pattern matching &   ion)     │
│  ├── trip-guard.ts           (Multi-city planning logic)        │
│  ├── business-guardian.ts    (Response synthesis)               │
│  └── index.ts                (Exports)                          │
├─────────────────────────────────────────────────────────────────┤
│                   Itinerary & Maps Layer                         │
│  /lib/itinerary/                                                │
│  ├── places.ts               (Google Places API enrichment)     │
│  ├── geocoding.ts            (Coordinate resolution)            │
│  └── database.ts             (CRUD operations)                  │
│  /components/itinerary/                                         │
│  └── itinerary-sheet.tsx     (Interactive map + timeline)       │
├─────────────────────────────────────────────────────────────────┤
│                      Type Definitions                            │
│  /types/business.ts          (All TypeScript interfaces)        │
│  /types/itinerary-chat.ts    (Itinerary-specific types)         │
├─────────────────────────────────────────────────────────────────┤
│                      Database (Supabase)                         │
│  - visa_applications, visa_documents                            │
│  - contract_reviews, contract_review_flags                      │
│  - scam_reports, scam_report_patterns                           │
│  - trip_plans, trip_stops                                       │
│  - itinerary_documents, itinerary_days, itinerary_activities    │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Model Configuration

Business Mode uses **Gemini 3 Flash Preview** for enhanced AI capabilities:

```typescript
// /app/api/business-chat/route.ts
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",  // Latest Gemini model
  systemInstruction: BUSINESS_SYSTEM_PROMPT,
});

// Generation config
const chat = model.startChat({
  history,
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
});
```

### Model Capabilities

| Feature | Gemini 3 Flash Preview |
|---------|------------------------|
| Context Window | 1M tokens |
| Vision | Multi-modal image analysis |
| Speed | Optimized for fast responses |
| Languages | 100+ languages |
| Output | Up to 8,192 tokens per response |

---

## Auto-  ion System

The auto-  ion system is the core of Business Mode, allowing users to simply upload any document without specifying its type.

### How It Works

```
User uploads document → Gemini Vision analyzes →   s type → Routes to agent → Synthesizes response
```

###   ion Categories

| Type |   ed Content | Agent |
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
  "  edType": "visa",
  "  ion": {
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
// Business mode with auto-  
<ChatInput
  onSendMessage={handleBusinessMessage}
  onSendImage={handleBusinessImageAnalysis}  // ← Auto-   handler
  isLoading={isLoading}
  placeholder="Upload a document or ask about visas, contracts, scams..."
/>
```

The `handleBusinessImageAnalysis` function:
1. Creates a user message with image preview
2. Calls `/api/business-analyze` with the image
3. Displays the   ed type badge (🛂 VISA, 📝 LEGAL, 🚨 SCAM, ✈️ TRIP)
4. Shows the synthesized response
5. Updates chat title based on   ed type

---

## Feature Agents

### 1. VisaLens - Document Validator

**Purpose:** Analyzes travel documents (passports, bank statements, employment letters) and validates them against visa requirements.

**How It Works:**

1. **Auto-  ion:** User uploads a travel document in Business Mode chat
2. **Type Recognition:** AI   s it's a visa-related document (passport, visa stamp, etc.)
3. **OCR/Extraction:** Documents are analyzed for text extraction
4. **Validation:** Each document is validated against visa requirements
5. **Checklist Generation:** A checklist shows which requirements are met/missing
6. **Approval Likelihood:** An approval percentage is calculated based on document quality

**Key Features:**
- Automatic document type   ion
- Passport expiry validation
- Bank balance threshold checking
- Missing document   ion
- Country-specific requirements

**  ed Document Types:**
- Passports and visa stamps
- Bank statements
- Employment letters
- Hotel/flight bookings
- Invitation letters
- Insurance documents

**Direct API Endpoint:** `POST /api/business/visa`
- For programmatic access without auto-  ion
- Accepts: JSON with document data
- Returns: `VisaLensOutput` with analysis results

---

### 2. LegalLens - Contract Analyzer

**Purpose:** Analyzes contracts and legal documents to identify red flags, unfavorable clauses, and provides plain English translations.

**How It Works:**

1. **Auto-  ion:** User uploads a contract or legal document
2. **Type Recognition:** AI   s it's a legal document (contract, NDA, etc.)
3. **Clause Extraction:** AI identifies and extracts key clauses
4. **Red Flag   ion:** Each clause is checked against known problematic patterns
5. **Risk Assessment:** Overall contract risk is calculated
6. **Plain English:** Complex legal jargon is translated to understandable language

**Red Flag Types   ed:**
- Non-compete clauses
- Broad IP assignment
- Mandatory arbitration
- Class action waivers
- Unilateral termination rights
- Asymmetric liability
- Auto-renewal traps
- Unfavorable jurisdiction

**  ed Document Types:**
- General contracts
- NDAs (Non-Disclosure Agreements)
- Employment agreements
- Lease agreements
- Terms of service
- Partnership agreements

**Direct API Endpoint:** `POST /api/business/legal`
- For programmatic access without auto-  ion
- Accepts: JSON with contract text or document
- Returns: `LegalLensOutput` with red flags and recommendations

---

### 3. B2B ScamShield - Fraud   ion

**Purpose:**   s business email compromise (BEC), invoice fraud, and other B2B scam patterns.

**How It Works:**

1. **Auto-  ion:** User uploads suspicious email or invoice screenshot
2. **Type Recognition:** AI   s scam indicators
3. **Pattern Matching:** Content is analyzed for known scam indicators
4. **Domain Verification:** Sender domains are checked for spoofing
5. **Risk Scoring:** A 0-100 risk score is calculated
6. **Action Recommendations:** Specific steps to verify or report are provided

**Scam Patterns   ed:**
- CEO/Executive fraud
- Invoice manipulation
- Vendor impersonation
- Payment redirect requests
- Advance fee schemes
- Fake RFPs
- Domain spoofing
- Urgency/pressure tactics

**  ed Content Types:**
- Phishing emails
- Suspicious invoices
- Payment request emails
- Fake vendor communications
- Wire transfer requests

**Direct API Endpoint:** `POST /api/business/scam`
- For programmatic access without auto-  ion
- Accepts: JSON with email/invoice content
- Returns: `ScamShieldOutput` with   ion results

---

### 4. TripGuard - Multi-City Travel Planner

**Purpose:** Plans multi-destination trips with visa requirements, travel advisories, and document checklists for each stop.

**How It Works:**

1. **Auto-  ion:** User uploads a trip itinerary or travel booking screenshot
2. **Type Recognition:** AI   s it's travel-related content
3. **Per-Stop Analysis:** Each destination is analyzed for visa requirements
4. **Advisory Checks:** Travel advisories are fetched for each country
5. **Document Consolidation:** A unified document checklist is generated
6. **Route Optimization:** Suggested ordering based on visa processing times

**  ed Content Types:**
- Flight booking confirmations
- Hotel reservations
- Travel itineraries
- Multi-city trip plans

**Direct API Endpoint:** `POST /api/business/trip`
- For programmatic access without auto-  ion
- Accepts: JSON with stops array
- Returns: `TripGuardOutput` with per-stop analysis

---

## AI Itinerary System

### Overview

The AI Itinerary System is a major feature of Business Mode that allows users to generate complete travel itineraries through natural conversation. Simply ask the AI to plan a trip, and it generates a fully enriched itinerary with real location data.

### How It Works

```
User: "Plan a 5-day trip to Tokyo for a foodie"
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. ITINERARY   ION                                         │
│     - Gemini   s trip planning intent                       │
│     - Triggers phrases: "plan a trip", "itinerary for", etc.   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. JSON GENERATION                                             │
│     - AI generates structured JSON itinerary                    │
│     - Includes days, activities, times, locations               │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. GOOGLE PLACES ENRICHMENT                                    │
│     - Each activity location is geocoded                        │
│     - Photos, ratings, hours, URLs fetched                      │
│     - Coordinates added for map display                         │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. ITINERARY SHEET DISPLAY                                     │
│     - Interactive slide-up sheet appears                        │
│     - Google Map with markers and directions                    │
│     - Day-by-day activity timeline                              │
└─────────────────────────────────────────────────────────────────┘
```

### Trigger Phrases

The AI automatically   s itinerary requests from these phrases:

| Phrase | Example |
|--------|---------|
| "plan a trip to..." | "Plan a 5-day trip to Tokyo" |
| "create an itinerary for..." | "Create an itinerary for London" |
| "I want to visit..." | "I want to visit Paris next month" |
| "help me plan..." | "Help me plan a vacation in Bali" |
| "travel to..." | "I'm traveling to Rome" |
| "vacation in..." | "Planning a vacation in Hawaii" |
| "going to [destination]..." | "I'm going to Barcelona" |

### Generated Itinerary Structure

```json
{
  "type": "itinerary",
  "title": "Trip to Tokyo, Japan",
  "destination": "Tokyo, Japan",
  "start_date": "2026-03-15",
  "end_date": "2026-03-20",
  "travel_style": "foodie",
  "budget_level": "mid-range",
  "days": [
    {
      "day_number": 1,
      "title": "Arrival & Shibuya Exploration",
      "date": "2026-03-15",
      "activities": [
        {
          "time": "10:00 AM",
          "title": "Arrive at Narita Airport",
          "type": "flight",
          "location": "Narita International Airport, Tokyo",
          "description": "Clear customs and pick up pocket WiFi",
          "duration": "2 hours",
          "tips": ["Pre-book pocket WiFi", "Get Suica card at airport"]
        },
        {
          "time": "01:00 PM",
          "title": "Lunch at Ichiran Ramen",
          "type": "restaurant",
          "location": "Ichiran Shibuya, Tokyo",
          "description": "Famous tonkotsu ramen chain",
          "duration": "1 hour",
          "price": "¥1,500"
        }
      ]
    }
  ]
}
```

### API Implementation

```typescript
// /app/api/business-chat/route.ts
export async function POST(request: NextRequest) {
  // ... generate response with Gemini
  
  // Check for itinerary JSON in response
  const itineraryResult = extractItineraryJson(text);
  
  if (itineraryResult) {
    // Enrich with Google Places data
    const enrichedDays = await enrichItinerary(
      rawItinerary.days, 
      rawItinerary.destination
    );
    
    return NextResponse.json({ 
      content: itineraryResult.cleanText,
      itinerary: { ...rawItinerary, days: enrichedDays },
      hasItinerary: true,
    });
  }
  
  return NextResponse.json({ content: text, hasItinerary: false });
}
```

---

## Google Maps & Places Integration

### Places API Enrichment

The `lib/itinerary/places.ts` module enriches itinerary activities with real Google Places data:

```typescript
interface EnrichedActivity {
  // Original fields
  title: string;
  type: "flight" | "hotel" | "restaurant" | "attraction" | "transport";
  location?: string;
  
  // Enriched fields from Google Places
  latitude: number;
  longitude: number;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;        // 0-4 scale
  photos?: string[];          // Photo URLs
  openNow?: boolean;
  openingHours?: string[];
  website?: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  editorialSummary?: string;
  topReview?: {
    authorName: string;
    rating: number;
    text: string;
  };
}
```

### Enrichment Functions

| Function | Purpose |
|----------|---------|
| `findPlace(query, destination)` | Search for a place and get Place ID |
| `getPlaceDetails(placeId)` | Get full place details including photos |
| `getPhotoUrl(reference, maxWidth)` | Generate photo URL from reference |
| `enrichActivity(activity, destination)` | Enrich a single activity |
| `enrichItinerary(days, destination)` | Enrich all activities in itinerary |

### Place Details Retrieved

- ✅ Coordinates (lat/lng)
- ✅ Rating & review count
- ✅ Price level ($ to $$$$)
- ✅ Up to 5 photos
- ✅ Opening hours & current status
- ✅ Website & phone number
- ✅ Google Maps URL
- ✅ Editorial summary
- ✅ Top 3 reviews

### Itinerary Sheet Component

The `ItinerarySheet` component displays the enriched itinerary:

```tsx
// /components/itinerary/itinerary-sheet.tsx

export function ItinerarySheet({ isOpen, onClose, itinerary }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="fixed inset-x-0 bottom-0 z-50 bg-zinc-900 rounded-t-3xl"
          style={{ height: "90vh" }}
        >
          {/* Header with destination & trip info */}
          {/* Day tabs for navigation */}
          
          {/* Content: Activities + Map */}
          <div className="flex flex-col md:flex-row">
            {/* Activities List */}
            <div className="w-full md:w-96 max-h-[50%] md:max-h-full">
              {/* Activity timeline with expandable cards */}
            </div>
            
            {/* Google Map */}
            <div className="flex-1 min-h-[250px]">
              <GoogleMap
                options={{ styles: darkMapStyles }}
              >
                <DirectionsRenderer />
                {activitiesWithCoords.map(activity => (
                  <Marker
                    position={getCoords(activity)}
                    icon={getMarkerIcon(activity.type)}
                    label={{ text: String(index + 1) }}
                  />
                ))}
                <InfoWindow />
              </GoogleMap>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Map Features

- **Dark Mode Styling**: Custom map styles matching app theme
- **Activity Markers**: Colored by type (restaurant, hotel, attraction, etc.)
- **Numbered Labels**: Shows activity order on markers
- **Directions Route**: Polyline connecting all stops
- **Info Windows**: Click markers for place details
- **Fit Bounds**: Button to show all markers
- **Mobile Responsive**: Stacks vertically on mobile

### Environment Variables

```env
# Required for Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_frontend_maps_key
GOOGLE_MAPS_API_KEY=your_backend_places_key
```

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
│                  │   ├─►   DocumentType() via Gemini        │
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

// Title updates based on   ed type
const typeTitle = {
  visa: "🛂 Visa Document Analysis",
  legal: "📝 Contract Review",
  scam: "🚨 Scam   ion",
  trip: "✈️ Trip Planning",
  unknown: "📊 Document Analysis",
};
```

---

## API Routes

### Auto-   Endpoint: `/api/business-analyze/route.ts`

The primary endpoint for Business Mode document analysis with automatic type   ion.

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
  "  edType": "visa" | "legal" | "scam" | "trip" | "unknown",
  "  ion": {
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

This route handles direct/programmatic access to the Business Guardian without auto-  ion.

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
| `/api/business/scam` | POST | Fraud   ion |
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

## Mobile Optimizations

### Responsive Sidebar

The sidebar adapts to mobile screens with these features:

```tsx
// Desktop: Standard collapsible sidebar
// Mobile: Full overlay with gestures

if (isMobile && !isCollapsed) {
  return (
    <>
      {/* Backdrop - tap to close */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onToggleCollapse} />
      
      {/* Overlay sidebar - swipe left to close */}
      <aside 
        className="fixed left-0 top-0 w-[85vw] max-w-[320px] z-50"
        style={{ height: '100dvh' }}
      >
        {/* Content */}
      </aside>
    </>
  );
}
```

### Mobile Features

| Feature | Implementation |
|---------|----------------|
| **Hamburger Menu** | Button in top-left opens sidebar |
| **Swipe to Open** | Swipe from left edge (< 30px) opens sidebar |
| **Swipe to Close** | Swipe left on sidebar closes it |
| **Tap Backdrop** | Tapping outside closes sidebar |
| **Full-Width Chat** | Sidebar hidden = chat uses 100% width |
| **Safe Areas** | Supports notched devices (iPhone, etc.) |

### Dynamic Viewport Height

Uses `100dvh` (dynamic viewport height) to handle mobile browser chrome:

```css
/* In globals.css */
body {
  min-height: 100dvh;
  overscroll-behavior: none;  /* Prevents white flash on overscroll */
}

/* Safe area support */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Itinerary Sheet Mobile Layout

On mobile, the itinerary sheet stacks content vertically:

```tsx
// Desktop: Side-by-side (activities left, map right)
// Mobile: Stacked (activities top, map bottom)

<div className="flex flex-col md:flex-row h-[calc(100%-140px)]">
  {/* Activities - 50% height on mobile, fixed width on desktop */}
  <div className="w-full md:w-96 max-h-[50%] md:max-h-full">
    {/* Activity timeline */}
  </div>
  
  {/* Map - minimum 250px on mobile, flex-1 on desktop */}
  <div className="flex-1 min-h-[250px] md:min-h-0">
    <GoogleMap />
  </div>
</div>
```

### UUID Compatibility

Uses a polyfill for older Safari versions that don't support `crypto.randomUUID()`:

```typescript
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (Safari iOS < 15.4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

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

### Auto-   Workflow (Recommended)

The easiest way to use Business Mode:

1. **Click the 📎 attachment button** in the chat input
2. **Upload any business document** (passport, contract, suspicious email, etc.)
3. **Click Send** - the AI will automatically:
   -    the document type
   - Route to the appropriate specialist agent
   - Return a comprehensive analysis

**That's it!** No need to select which feature to use - the AI figures it out.

### Example Workflows

#### Analyzing a Visa Document
1. Switch to Business Mode
2. Attach a photo of your passport or visa
3. Press Send
4. AI   s "🛂 VISA" and provides:
   - Document validation results
   - Expiry warnings
   - Missing requirements
   - Next steps

#### Reviewing a Contract
1. Switch to Business Mode
2. Attach a screenshot of the contract
3. Press Send
4. AI   s "📝 LEGAL" and provides:
   - Red flags identified
   - Risk assessment
   - Plain English explanation
   - Negotiation recommendations

#### Checking a Suspicious Email
1. Switch to Business Mode
2. Attach a screenshot of the email
3. Press Send
4. AI   s "🚨 SCAM" and provides:
   - Scam likelihood verdict
   - Red flag patterns found
   - Evidence breakdown
   - Protective actions to take

#### Planning a Trip
1. Switch to Business Mode
2. Attach a flight booking or itinerary screenshot
3. Press Send
4. AI   s "✈️ TRIP" and provides:
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
- `POST /api/business/scam` - Scam   ion
- `POST /api/business/trip` - Trip planning

---

## Future Enhancements

### Completed Features ✅
1. **AI-Powered Itinerary Generation:** TripGuard creates complete trip plans with activities, dining, and transportation
2. **Google Places Integration:** Real-time enrichment with coordinates, ratings, photos, reviews, and hours
3. **Interactive Google Maps:** Dark mode styled map with markers, directions, and info windows
4. **Mobile-First Responsive Design:** Overlay sidebar, swipe gestures, stacked layouts, safe area support
5. **Gemini 3 Flash Preview:** Upgraded to latest model for improved accuracy and context handling

### Roadmap 🗺️
1. **Real-time Diaspora AI Integration:** Connect to live visa requirements API
2. **Document OCR:** Enhanced text extraction from uploaded images
3. **Email Parser:** Direct email forwarding for scam analysis
4. **Trip Sharing:** Export itineraries as PDF or share links
5. **Offline Itineraries:** Download itineraries for offline access
6. **Real-time Flight Tracking:** Integration with flight status APIs
7. **Currency Converter:** Built-in currency conversion with live rates
8. **Alerts:** Notifications for visa expiry or travel advisory changes
9. **Multi-language:** Support for contract analysis in multiple languages
10. **Batch Processing:** Analyze multiple documents at once
11. **Voice Commands:** Hands-free interaction for accessibility

---

## Contributing

When adding new features to Business Mode:

1. Define types in `/types/business.ts`
2. Create agent logic in `/lib/agents/business/`
3. Add API route in `/app/api/business/`
4. Update auto-  ion in `/app/api/business-analyze/route.ts`
5. Update the `handleBusinessImageAnalysis` function in `/app/page.tsx`
6. Update database schema if persistence needed
7. Add Google Places enrichment if location-based (see `/lib/google-places.ts`)
8. Test on mobile devices for responsive behavior
9. Run `npx tsc --noEmit` to verify no type errors

---

*Documentation last updated: February 5, 2026*
