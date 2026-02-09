# 🛡️ Cleir    - Technical Documentation

> **AI-Powered Manipulation   ion System**  
> Built for the Gemini 3 Hackathon | February 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Multi-Agent Pipeline](#multi-agent-pipeline)
4. [Auto Mode   ion](#auto-mode-  ion)
5. [Analysis Modes & Taxonomies](#analysis-modes--taxonomies)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Frontend Components](#frontend-components)
9. [Voice & Avatar System](#voice--avatar-system)
10. [Business Mode](#business-mode)
11. [Authentication System](#authentication-system)
12. [Environment Variables](#environment-variables)
13. [Tech Stack](#tech-stack)

---

## 🎯 Project Overview

**Cleir   ** is an AI-powered application that analyzes conversations to    manipulation, gaslighting, scams, and toxic communication patterns. Users can paste text conversations or upload screenshots, and the system automatically determines what type of analysis is needed.

### Key Features

- 🤖 **5-Agent AI Pipeline** - Specialized agents work together for comprehensive analysis
- 🔍 **Auto Mode   ion** - AI automatically determines if content is a scam, relationship manipulation, or self-analysis
- 🗣️ **Voice Responses** - ElevenLabs TTS provides spoken analysis with animated avatar
- 📊 **35+   ion Patterns** - Comprehensive taxonomies covering relationship manipulation, scams, and self-reflection
- 💾 **Persistent History** - Supabase database stores all analyses for tracking patterns over time
- 📸 **Screenshot Analysis** - Upload images of conversations for visual extraction

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 16)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Chat Input  │  │ Chat Messages │  │ Speaking Avatar (TTS)  │ │
│  └──────┬──────┘  └──────────────┘  └─────────────────────────┘ │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                        │
│  ┌──────────────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐  │
│  │ /api/analyze │  │ /api/tts │  │ /api/chat│  │ /api/history │  │
│  └──────┬───────┘  └─────────┘  └─────────┘  └───────────────┘  │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MULTI-AGENT ORCHESTRATOR                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        AUTO MODE   ION (Gemini 3 Flash Preview)      │   │
│  │         Determines: relationship | scam | self           │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────┐    │
│  │EXTRACTOR│→ │ CLASSIFIER │→ │PSYCHOLOGIST │→ │ DEFENDER │    │
│  │ Agent 1 │  │  Agent 2   │  │   Agent 3   │  │ Agent 4  │    │
│  └─────────┘  └────────────┘  └─────────────┘  └──────────┘    │
│         │                                                   │    │
│         └───────────────────────────────────────────────────┘    │
│                                    │                             │
│                                    ▼                             │
│                          ┌──────────────┐                        │
│                          │   GUARDIAN   │                        │
│                          │   Agent 5    │                        │
│                          └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ analysis_sessions│ │   ed_tactics │ │ health_score_history│ │
│  └────────────────┘  └─────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent Pipeline

The system uses **5 specialized AI agents**, each powered by **Gemini 3 Flash Preview** (`gemini-3-flash-preview`), working in sequence:

### Agent 1: The Extractor ("The Eyes")
**File:** `lib/agents/extractor.ts`

**Purpose:** Extracts and structures conversation data from text or images.

**Capabilities:**
- Parses raw text conversations
- Uses Gemini's vision capabilities to read screenshot images
- Identifies participants, platform, relationship type
- Extracts URLs, phone numbers, emails (for scam   ion)
- Determines conversation context

**Output:**
```typescript
{
  participants: { user: string, other: string },
  messages: ExtractedMessage[],
  platform: string,
  conversationContext: string,
  relationshipType: string,
  urls: string[],
  phoneNumbers: string[],
  emails: string[]
}
```

---

### Agent 2: The Classifier ("The   ive")
**File:** `lib/agents/classifier.ts`

**Purpose:** Identifies manipulation tactics and assigns threat levels.

**Capabilities:**
- Scans for 35+ manipulation patterns from the taxonomy
- Calculates confidence scores for each   ion
- Assigns severity levels (none → low → medium → high → critical)
- Extracts evidence quotes with message indices
- Determines overall threat level

**Output:**
```typescript
{
  tactics  ed: Tactic  ion[],
  overallThreatLevel: "safe" | "mild" | "moderate" | "severe" | "critical",
  primaryManipulator: string,
  manipulationTimeline: TimelineEvent[],
  urlSafetyChecks: UrlSafetyCheck[] // For scam mode
}
```

---

### Agent 3: The Psychologist ("The Mind Reader")
**File:** `lib/agents/psychologist.ts`

**Purpose:** Provides psychological analysis of the manipulation dynamics.

**Capabilities:**
- Analyzes manipulator's psychological profile
- Assesses emotional impact on the victim
- Calculates relationship health score (0-100)
- Identifies power dynamics and control patterns
- Recognizes victim trauma responses

**Output:**
```typescript
{
  manipulatorProfile: {
    likelyMotivations: string[],
    psychologicalTraits: string[],
    manipulationStyle: string,
    dangerAssessment: string
  },
  victimImpactAssessment: {
    emotionalEffects: string[],
    cognitiveEffects: string[],
    behavioralChanges: string[],
    vulnerabilityFactors: string[]
  },
  relationshipHealthScore: number,
  powerDynamics: string
}
```

---

### Agent 4: The Defender ("The Strategist")
**File:** `lib/agents/defender.ts`

**Purpose:** Generates protective responses and safety strategies.

**Capabilities:**
- Creates boundary-setting responses
- Provides scripts for difficult conversations
- Generates safety exit strategies
- Recommends resources (hotlines, support groups)
- Suggests documentation strategies

**Output:**
```typescript
{
  immediateActions: string[],
  recommendedResponses: ScriptedResponse[],
  boundaryScripts: string[],
  safetyPlan: {
    warningSignsToWatch: string[],
    exitStrategies: string[],
    supportResources: string[]
  },
  documentationAdvice: string
}
```

---

### Agent 5: The Guardian ("The Voice")
**File:** `lib/agents/guardian.ts`

**Purpose:** Synthesizes all analysis into a cohesive, empathetic response.

**Capabilities:**
- Creates human-friendly summary with emojis
- Generates voice script for TTS (warm, supportive tone)
- Builds full markdown report
- Adapts tone based on threat level
- Provides validation and emotional support

**Output:**
```typescript
{
  summaryHeadline: string,
  threatEmoji: "💚" | "🟡" | "🟠" | "🔴" | "🚨",
  voiceScript: string,
  fullMarkdownResponse: string,
  formattedResponse: {
    header: string,
    tacticsSection: string,
    psychologySection: string,
    defensesSection: string,
    resourcesSection: string
  }
}
```

---

## 🎯 Auto Mode   ion

The system **automatically determines** the appropriate analysis mode without user input.

**File:** `lib/agents/extractor.ts` - `  AnalysisMode()`

###   ion Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT ANALYSIS                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Does content contain financial red flags?                   │
│  • Money requests, gift cards, crypto                        │
│  • Urgency tactics ("act now", "don't tell anyone")         │
│  • Claims from banks/IRS/tech support                        │
│  • Suspicious links or credential requests                   │
│  • Too-good-to-be-true offers                               │
└─────────────────────────────────────────────────────────────┘
          │ YES                              │ NO
          ▼                                  ▼
    ┌───────────┐              ┌─────────────────────────────┐
    │   SCAM    │              │ Does user explicitly want   │
    │   MODE    │              │ to analyze THEIR OWN        │
    └───────────┘              │ behavior?                   │
                               └─────────────────────────────┘
                                     │ YES          │ NO
                                     ▼              ▼
                              ┌─────────────┐ ┌──────────────┐
                              │SELF_ANALYSIS│ │ RELATIONSHIP │
                              │    MODE     │ │    MODE      │
                              └─────────────┘ └──────────────┘
```

### API Response Includes   ion Metadata

```json
{
  "metadata": {
    "mode  ion": {
      "  edMode": "scam",
      "confidence": 0.95,
      "reasoning": "  ed urgency tactics and request for gift cards",
      "wasAuto  ed": true
    }
  }
}
```

---

## 📚 Analysis Modes & Taxonomies

### Mode 1: Relationship Analysis (15 Tactics)
**File:** `lib/taxonomy.ts` - `RELATIONSHIP_TAXONOMY`

| Tactic | Severity | Description |
|--------|----------|-------------|
| `gaslighting` | Critical | Denying reality, making victim question their memory |
| `love_bombing` | High | Excessive affection to gain control |
| `triangulation` | High | Using third parties to manipulate |
| `stonewalling` | High | Refusing to communicate |
| `blame_shifting` | High | Never taking responsibility |
| `emotional_blackmail` | Critical | Using fear, obligation, guilt |
| `intermittent_reinforcement` | High | Unpredictable rewards/punishments |
| `isolation` | Critical | Cutting off support networks |
| `minimizing` | Medium | Downplaying victim's concerns |
| `projection` | Medium | Accusing victim of manipulator's behavior |
| `moving_goalposts` | Medium | Constantly changing expectations |
| `silent_treatment` | High | Punishing through withdrawal |
| `word_salad` | Medium | Confusing circular arguments |
| `hoovering` | High | Drawing victim back after separation |
| `future_faking` | Medium | False promises about the future |

---

### Mode 2: Scam   ion (12 Tactics)
**File:** `lib/taxonomy.ts` - `SCAM_TAXONOMY`

| Tactic | Severity | Description |
|--------|----------|-------------|
| `urgency_pressure` | Critical | "Act now or lose out!" |
| `authority_impersonation` | Critical | Claiming to be IRS, bank, police |
| `emotional_appeal` | High | Playing on fear, greed, loneliness |
| `too_good_to_be_true` | High | Lottery wins, huge returns |
| `credential_harvesting` | Critical | Requesting passwords, SSN |
| `advance_fee` | Critical | Pay upfront for prize/job |
| `romance_scam` | Critical | Fake love + money requests |
| `tech_support` | High | "Your computer has a virus" |
| `payment_redirect` | Critical | Unusual payment methods |
| `identity_theft_setup` | Critical | Collecting personal info |
| `phantom_debt` | High | Fake debt collection |
| `investment_fraud` | Critical | Crypto/forex scams |

---

### Mode 3: Self-Analysis (8 Patterns)
**File:** `lib/taxonomy.ts` - `SELF_TAXONOMY`

| Pattern | Severity | Description |
|---------|----------|-------------|
| `passive_aggression` | Medium | Indirect hostility |
| `over_apologizing` | Low | Excessive self-blame |
| `boundary_violations` | High | Not respecting others' limits |
| `emotional_dumping` | Medium | Overwhelming others with problems |
| `defensiveness` | Medium | Unable to accept feedback |
| `catastrophizing` | Medium | Always expecting the worst |
| `people_pleasing` | Low | Sacrificing self for approval |
| `avoidance` | Medium | Refusing to address issues |

---

## 🌐 API Endpoints

### POST `/api/analyze`
**Main analysis endpoint with auto-  ion**

**Request:**
```json
{
  "conversationText": "string (optional)",
  "imageData": "base64 string (optional)",
  "mimeType": "image/jpeg (optional)",
  "mode": "relationship|scam|self_analysis (optional - auto-  ed if omitted)",
  "userId": "string (optional)",
  "saveToDatabase": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "mode": "  ed mode",
    "extraction": { ... },
    "classification": { ... },
    "psychology": { ... },
    "defenses": { ... },
    "guardian": { ... },
    "metadata": {
      "processingTimeMs": 2500,
      "mode  ion": {
        "  edMode": "scam",
        "confidence": 0.92,
        "reasoning": "...",
        "wasAuto  ed": true
      }
    }
  }
}
```

---

### POST `/api/chat`
**General chat endpoint for conversational interactions**

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

---

### POST `/api/tts`
**Text-to-speech endpoint using ElevenLabs**

**Request:**
```json
{
  "text": "Text to speak"
}
```

**Response:**
```json
{
  "audio_base64": "...",
  "alignment": {
    "characters": ["H", "e", "l", "l", "o"],
    "character_start_times_seconds": [0.0, 0.1, ...],
    "character_end_times_seconds": [0.1, 0.2, ...]
  }
}
```

---

### GET `/api/history`
**Retrieve analysis history**

**Query params:** `userId`, `limit`, `mode`

---

### GET `/api/evidence`
**Export evidence for a session**

**Query params:** `sessionId`

---

### GET `/api/export`
**Export full analysis as downloadable report**

**Query params:** `sessionId`, `format` (json|pdf|markdown)

---

## 💾 Database Schema

**Platform:** Supabase (PostgreSQL)

### Tables

#### `analysis_sessions`
```sql
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mode analysis_mode NOT NULL,
  platform TEXT,
  relationship_type TEXT,
  overall_threat_level threat_level,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  tactics_count INTEGER DEFAULT 0,
  raw_input TEXT,
  full_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `  ed_tactics`
```sql
CREATE TABLE   ed_tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES analysis_sessions(id),
  tactic_key TEXT NOT NULL,
  tactic_name TEXT NOT NULL,
  category tactic_category NOT NULL,
  confidence DECIMAL(3,2),
  severity severity_level,
  evidence_quotes TEXT[],
  message_indices INTEGER[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `health_score_history`
```sql
CREATE TABLE health_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES analysis_sessions(id),
  score INTEGER NOT NULL,
  threat_level threat_level,
  mode analysis_mode,
  tactics_  ed TEXT[],
  recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🎨 Frontend Components

### Component Structure
```
components/chat/
├── index.ts              # Barrel exports
├── chat-sidebar.tsx      # Chat history sidebar
├── chat-message.tsx      # Individual message component
├── chat-messages.tsx     # Message list container
├── chat-input.tsx        # Input with image upload
└── speaking-avatar.tsx   # Animated TTS avatar
```

### Key Features

- **Dark theme** with purple accent (#8b5cf6)
- **Responsive design** for mobile/desktop
- **Image upload** via file picker or paste
- **Markdown rendering** for analysis results
- **Local storage** persistence for chat history
- **Voice toggle** for TTS responses

---

## 🗣️ Voice & Avatar System

### ElevenLabs TTS Configuration
**File:** `app/api/tts/route.ts`

```typescript
{
  model_id: "eleven_turbo_v2_5",
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
    speed: 1.2
  },
  output_format: "mp3_44100_128"
}
```

### Speaking Avatar
**File:** `components/chat/speaking-avatar.tsx`

- Animated mouth sync using character alignment data
- Visual states: idle, speaking, listening
- Smooth transitions between phoneme positions

---

## 🔐 Environment Variables

```env
# Required - AI
GEMINI_API_KEY=your_gemini_api_key

# Optional - Voice
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=voice_id

# Required - Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public_anon_key
SUPABASE_SERVICE_ROLE_KEY=service_role_key

# Required - Maps (for Business Mode Itinerary)
GOOGLE_MAPS_API_KEY=your_server_side_maps_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_side_maps_key

# Optional - Business Mode
DIASPORA_AI_VISA_API_KEY=your_diaspora_visa_key
```

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 16.1.6 |
| **Runtime** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **AI Model** | Gemini 3 Flash Preview | `gemini-3-flash-preview` |
| **TTS** | ElevenLabs | eleven_turbo_v2_5 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth | Email + GitHub OAuth |
| **Maps** | Google Maps API | @react-google-maps/api |
| **Places** | Google Places API | Server-side enrichment |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | Latest |
| **Deployment** | Vercel | - |

---

## 📁 Project Structure

```
Cleir-  /
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Main analysis endpoint
│   │   ├── chat/
│   │   │   ├── route.ts          # Chat endpoint
│   │   │   └── title/route.ts    # Title generation
│   │   ├── tts/route.ts          # Text-to-speech
│   │   ├── history/route.ts      # Analysis history
│   │   ├── evidence/route.ts     # Evidence export
│   │   └── export/route.ts       # Report export
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main chat UI
├── components/
│   └── chat/                     # Chat UI components
├── lib/
│   ├── agents/
│   │   ├── prompts.ts            # All agent prompts
│   │   ├── extractor.ts          # Agent 1 + mode   ion
│   │   ├── classifier.ts         # Agent 2
│   │   ├── psychologist.ts       # Agent 3
│   │   ├── defender.ts           # Agent 4
│   │   ├── guardian.ts           # Agent 5
│   │   └── orchestrator.ts       # Pipeline coordinator
│   ├── taxonomy.ts               # 35+ manipulation patterns
│   └── supabase.ts               # Database client
├── types/
│   └── agents.ts                 # TypeScript interfaces
├── public/
├── DOCUMENTATION.md              # This file
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## ✅ Development Status

| Feature | Status |
|---------|--------|
| Multi-agent pipeline | ✅ Complete |
| Auto mode   ion | ✅ Complete |
| Relationship taxonomy (15) | ✅ Complete |
| Scam taxonomy (12) | ✅ Complete |
| Self-analysis taxonomy (8) | ✅ Complete |
| Screenshot/image analysis | ✅ Complete |
| ElevenLabs TTS integration | ✅ Complete |
| Speaking avatar | ✅ Complete |
| Supabase persistence | ✅ Complete |
| Chat history | ✅ Complete |
| API documentation | ✅ Complete |
| **Business Mode** | ✅ Complete |
| **User Authentication** | ✅ Complete |
| **Diaspora AI Visa API** | ✅ Complete |
| **Per-User Chat Storage** | ✅ Complete |
| **Mode Toggle (Personal/Business)** | ✅ Complete |

---

## 💼 Business Mode

### Overview
The application now supports a **Business Mode** alongside the Personal (manipulation   ion) mode. Users can switch between modes using a toggle in the top-right corner.

### Features

| Feature | Description |
|---------|-------------|
| **Mode Toggle** | Switch between Personal and Business modes instantly |
| **Separate Chat Histories** | Each mode maintains its own chat history |
| **Business Assistant** | Powered by Gemini 3 Flash Preview for professional queries |
| **Voice Responses** | TTS support with animated avatar |
| **Diaspora AI Visa API** | Real-time visa requirement checks |
| **AI Itinerary Generation** | Automatic travel itinerary creation with Google Maps |

### Business Mode Specialized Agents

| Agent | Endpoint | Purpose |
|-------|----------|---------|
| **VisaLens** | `/api/business/visa` | Visa requirements and immigration guidance |
| **LegalLens** | `/api/business/legal` | Legal document analysis and advice |
| **ScamShield** | `/api/business/scam` | Business fraud and scam   ion |
| **TripGuard** | `/api/business/trip` | Travel safety and itinerary planning |

### Business Mode API Endpoint

**`POST /api/business-chat`**

The business chat endpoint automatically   s itinerary requests and generates comprehensive travel plans.

```typescript
// Request
{
  messages: [
    { role: "user", content: "Plan a 5-day trip to Rome, Italy" }
  ]
}

// Response (with itinerary)
{
  content: "I've created your 5-day Rome itinerary! ...",
  hasItinerary: true,
  itinerary: {
    type: "itinerary",
    title: "5-Day Rome Adventure",
    destination: "Rome, Italy",
    start_date: "2026-03-01",
    end_date: "2026-03-05",
    travel_style: "cultural",
    budget_level: "mid-range",
    days: [
      {
        day_number: 1,
        title: "Ancient Rome",
        date: "2026-03-01",
        activities: [
          {
            time: "09:00 AM",
            title: "Colosseum",
            type: "attraction",
            location: "Piazza del Colosseo, Rome",
            description: "Explore the iconic amphitheater",
            latitude: 41.8902,
            longitude: 12.4922,
            rating: 4.7,
            photos: ["https://..."],
            website: "https://..."
          }
          // ... more activities
        ]
      }
      // ... more days
    ]
  }
}
```

---

## 🗺️ Itinerary & Google Maps Integration

### Overview
Business Mode includes AI-powered itinerary generation with full Google Maps integration. When users request trip planning, the system:

1. **  s** itinerary requests via Gemini 3 Flash
2. **Generates** structured JSON itinerary with activities
3. **Enriches** each activity with Google Places API data
4. **Displays** interactive map with markers and routes

### Itinerary   ion Triggers

The AI   s these phrases as itinerary requests:
- "plan a trip to..."
- "create an itinerary for..."
- "I want to visit..."
- "help me plan..."
- "travel to..."
- "vacation in..."
- "going to [destination]..."

### Google Places Enrichment

**File:** `lib/itinerary/places.ts`

Each activity is enriched with:
- 📍 **Coordinates** (latitude/longitude for map markers)
- ⭐ **Ratings** and review counts
- 📷 **Photos** (up to 3 per location)
- ⏰ **Opening hours** and "open now" status
- 📞 **Phone number** and website
- 🗺️ **Google Maps URL** for directions
- 💰 **Price level** ($ to $$$$)
- 📝 **Editorial summary** from Google

### Itinerary Sheet Component

**File:** `components/itinerary/itinerary-sheet.tsx`

A slide-up sheet displays the itinerary with:

| Feature | Description |
|---------|-------------|
| **Day Tabs** | Navigate between trip days |
| **Activity Timeline** | Chronological list with type icons |
| **Google Map** | Interactive map with dark mode styling |
| **Markers** | Color-coded by activity type (hotel, restaurant, attraction, etc.) |
| **Directions** | Driving route between activities |
| **Info Windows** | Click markers to see place details |
| **Fit Bounds** | Auto-zoom to show all activities |

### Activity Types & Icons

| Type | Icon | Marker Color |
|------|------|--------------|
| `flight` | ✈️ | Blue |
| `hotel` | 🏨 | Purple |
| `restaurant` | 🍽️ | Amber |
| `attraction` | 🏛️ | Emerald |
| `transport` | 🚕 | Indigo |

### Places API Interface

```typescript
interface EnrichedActivity {
  title: string;
  type: "flight" | "hotel" | "restaurant" | "attraction" | "transport" | "other";
  location?: string;
  description?: string;
  time?: string;
  price?: string;
  latitude: number;
  longitude: number;
  // Enriched from Google Places
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  photos?: string[];
  openNow?: boolean;
  openingHours?: string[];
  website?: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  editorialSummary?: string;
}
```

### Diaspora AI Visa API Integration

The business mode can query the Diaspora AI Visa API for real-time visa requirements:

**API Endpoint:** `https://api.diasporaai.com/api/v1/visa/requirements`

**Example Request:**
```bash
curl -X POST https://api.diasporaai.com/api/v1/visa/requirements \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"origin": "Ghana", "destination": "Canada", "purpose": "tourism"}'
```

**Tested & Verified:** ✅ API integration working with key `dsp_visa_p8vDd8pZt5LhZKLScH5YL9yAWtEm2Kvn`

---

## 🔐 Authentication System

### Overview
Full user authentication using Supabase Auth with support for email/password and GitHub OAuth.

### Features

| Feature | Description |
|---------|-------------|
| **Email Sign Up** | Create account with email and password |
| **Email Sign In** | Sign in with existing credentials |
| **GitHub OAuth** | One-click sign in with GitHub |
| **No Email Verification** | Users can start immediately |
| **Profile Dropdown** | Shows user initials, email, and sign out option |
| **Per-User Storage** | All chats saved to database per user |
| **Cross-Device Sync** | Access your chats from any device |

### Auth Components

**`components/auth/auth-form.tsx`**
- Split-screen layout (testimonial left, form right)
- Two-step flow: email first, then password
- GitHub OAuth button
- Terms of Service and Privacy Policy links

**`components/auth/profile-dropdown.tsx`**
- User avatar with initials
- Displays user email
- Sign out functionality

### Database Schema for User Chats

```sql
CREATE TABLE user_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'personal' CHECK (mode IN ('personal', 'business')),
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security ensures users can only access their own chats
ALTER TABLE user_chats ENABLE ROW LEVEL SECURITY;
```

### Supabase Client Helpers

**`lib/supabase-client.ts`**
```typescript
// Available functions:
getUserChats(userId, mode?)  // Get all user chats, optionally filtered by mode
getChatById(chatId)          // Get a specific chat
createChat(userId, mode, title, messages)  // Create new chat
updateChat(chatId, { title?, messages? })  // Update existing chat
deleteChat(chatId)           // Delete a chat
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📞 Support Resources

The app provides these resources to users:

- **National Domestic Violence Hotline:** 1-800-799-7233
- **Crisis Text Line:** Text HOME to 741741
- **FTC Scam Reporting:** reportfraud.ftc.gov
- **Identity Theft:** identitytheft.gov

---

*Built with 💜 for the Gemini 3 Hackathon*
