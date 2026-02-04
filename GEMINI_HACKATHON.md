# 🛡️ Gaslighter Detect v3.0

## Multi-Agent AI System Powered by Gemini 3 Flash Preview

> **Hackathon Submission**: Google Gemini 3 Hackathon  
> **Category**: AI for Social Good / Mental Health & Safety Tech  
> **Core Technology**: Gemini 3 Flash Preview (gemini-3-flash-preview) + Multi-Agent Architecture + Supabase + Google Maps API

---

## 🎯 The Problem

**Digital communication is rife with manipulation** — whether it's emotional abuse in relationships, sophisticated scam attempts, or our own unhealthy communication patterns. People face:

### 💔 Relationship Manipulation
- **1 in 3 people** experience emotional manipulation in relationships
- Victims often don't recognize patterns until it's too late
- Question their own sanity ("Am I being dramatic?")
- Feel isolated and confused about how to respond

### 🛡️ Scam Epidemic
- **$10+ billion** lost to scams annually in the US alone
- Phishing attacks are increasingly sophisticated
- Elderly and vulnerable populations are targeted
- People feel ashamed after being victimized

### 🪞 Self-Awareness Gap
- Many people unknowingly perpetuate unhealthy patterns
- Over-apologizing, people-pleasing, boundary violations
- These patterns developed as survival mechanisms
- Traditional therapy is expensive and inaccessible

---

## 💡 Our Solution: Gaslighter Detect

**Gaslighter Detect** is an AI-powered conversation analyst with **three powerful modes**:

| Mode | Description | Use Case |
|------|-------------|----------|
| 💔 **Relationship Analysis** | Detect manipulation tactics in conversations | Toxic relationships, emotional abuse |
| 🛡️ **Scam Shield** | Identify phishing, fraud, and scam attempts | Suspicious messages, too-good-to-be-true offers |
| 🪞 **Self-Analysis** | Reflect on your own communication patterns | Personal growth, breaking unhealthy patterns |

Simply screenshot a conversation, select your mode, and our **5-agent AI pipeline** powered by **Gemini 3 Flash Preview** delivers:

- 🔍 **What's happening** (extracted patterns with evidence)
- 🧠 **Why it's problematic** (psychological explanation)
- 💪 **What to do** (actionable responses and resources)
- 🎙️ **Voice delivery** (memorable audio via ElevenLabs)
- 📊 **History tracking** (see patterns over time via Supabase)

---

## 🏗️ Architecture: The 5-Agent Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                │
│         Screenshot + Analysis Mode (relationship/scam/self)      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             AGENT 1: THE EXTRACTOR ("The Eyes")                  │
│         Gemini 3 Flash Preview Vision                            │
│         • Extracts text from screenshot                          │
│         • Identifies speakers & platform                         │
│         • Detects URLs, phone numbers, emails (for scam mode)    │
│         ⏱️ ~800ms                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             AGENT 2: THE CLASSIFIER ("The Brain")                │
│         Mode-Specific Pattern Recognition                        │
│         • Relationship: 15 manipulation tactics                  │
│         • Scam: 12 fraud patterns + URL safety                   │
│         • Self: 8 unhealthy communication patterns               │
│         ⏱️ ~600ms                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            AGENT 3: THE PSYCHOLOGIST ("The Expert")              │
│         Deep Psychological Analysis                              │
│         • Translation table (what they said vs meant)            │
│         • Why these tactics work                                 │
│         • Long-term psychological impact                         │
│         • Health score (0-100)                                   │
│         ⏱️ ~700ms                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             AGENT 4: THE DEFENDER ("The Coach")                  │
│         Actionable Response Strategies                           │
│         • Recommended responses with scripts                     │
│         • What NOT to say                                        │
│         • Anticipated pushback & counters                        │
│         • Safety resources & hotlines                            │
│         ⏱️ ~700ms                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             AGENT 5: THE GUARDIAN ("The Voice")                  │
│         Final Synthesis & Delivery                               │
│         • Memorable markdown response                            │
│         • Voice script for TTS (under 150 words)                 │
│         • Mode-appropriate tone & urgency                        │
│         ⏱️ ~500ms                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ├──────────────────────────────────┐
                      ▼                                  ▼
┌─────────────────────────────────┐  ┌─────────────────────────────┐
│         ELEVENLABS TTS          │  │       SUPABASE DATABASE      │
│   eleven_turbo_v2_5, speed 1.2  │  │   Session, tactics, history  │
│         ⏱️ ~800ms               │  │       Health score trend     │
└─────────────────────────────────┘  └─────────────────────────────┘

                    Total Pipeline: ~4-5 seconds
```

---

## 📊 Taxonomy: 35+ Patterns Across 3 Modes

### 💔 Relationship Manipulation Tactics (15)

| Tactic | Severity | Example Indicators |
|--------|----------|-------------------|
| **Gaslighting** | 🔴 Critical | "That never happened", "You're imagining things" |
| **DARVO** | 🔴 Critical | Deny, Attack, Reverse Victim & Offender |
| **Emotional Blackmail** | 🔴 Critical | "If you leave, I'll hurt myself" |
| **Isolation** | 🔴 High | "Your friends are toxic", "Only I understand you" |
| **Love Bombing** | 🟠 High | Excessive affection/gifts too early |
| **Blame Shifting** | 🟠 High | "You made me do this" |
| **Contempt** | 🟠 High | Name-calling, belittling, mocking |
| **Guilt Tripping** | 🟡 Medium | "After everything I've done for you" |
| **Stonewalling** | 🟡 Medium | Silent treatment, refusing to discuss |
| **Moving Goalposts** | 🟡 Medium | Nothing is ever enough |
| **Triangulation** | 🟡 Medium | "My ex would never do this" |
| **Invalidation** | 🟡 Medium | "You're overreacting", "Get over it" |
| **Future Faking** | 🟡 Medium | Empty promises of change |
| **Intermittent Reinforcement** | 🟠 High | Hot/cold, unpredictable affection |
| **Healthy Communication** | 💚 None | Baseline for comparison |

### 🛡️ Scam Shield Patterns (12)

| Pattern | Severity | Indicators |
|---------|----------|------------|
| **Urgency Pressure** | 🔴 Critical | "Act NOW or lose this opportunity" |
| **Authority Impersonation** | 🔴 Critical | "This is IRS/FBI/Amazon" |
| **Phishing Attempt** | 🔴 Critical | Fake login links, credential requests |
| **Romance Scam** | 🔴 Critical | Quick emotional attachment, financial asks |
| **Tech Support Scam** | 🔴 Critical | "Your computer has a virus" |
| **Investment Scam** | 🔴 Critical | "Guaranteed 300% returns" |
| **Lottery/Prize Scam** | 🟠 High | "You've won! Pay fee to claim" |
| **Advance Fee Fraud** | 🟠 High | "Send money to receive money" |
| **Fake Check Scam** | 🟠 High | Overpayment with refund request |
| **Sextortion** | 🔴 Critical | Blackmail with intimate content |
| **Charity Scam** | 🟡 Medium | Fake disaster relief |
| **Job Scam** | 🟡 Medium | Upfront fees for employment |

### 🪞 Self-Analysis Patterns (8)

| Pattern | Description |
|---------|-------------|
| **Over-Apologizing** | Saying sorry when you did nothing wrong |
| **Fawning/People-Pleasing** | Prioritizing others' comfort over your needs |
| **Self-Blame** | Taking responsibility for others' behavior |
| **Minimizing Needs** | "It's fine, I don't really need that" |
| **Validation Seeking** | Excessive need for external approval |
| **Boundary Violations** | Allowing/making inappropriate intrusions |
| **Catastrophizing** | Expecting the worst in all situations |
| **Emotional Suppression** | "I'm fine" when you're not |

---

## 🗄️ Database Schema (Supabase)

```sql
-- Core Analysis Sessions
analysis_sessions (
  id UUID PRIMARY KEY,
  user_id TEXT,
  mode TEXT,                    -- 'relationship' | 'scam' | 'self_analysis'
  platform TEXT,                -- WhatsApp, iMessage, etc.
  relationship_type TEXT,
  overall_threat_level TEXT,    -- green/yellow/orange/red
  health_score INTEGER,
  tactics_count INTEGER,
  raw_input TEXT,
  full_response JSONB,
  created_at TIMESTAMPTZ
)

-- Detected Tactics (for analytics)
detected_tactics (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES analysis_sessions,
  tactic_key TEXT,
  tactic_name TEXT,
  category TEXT,
  confidence DECIMAL,
  severity TEXT,
  evidence_quotes TEXT[],
  message_indices INTEGER[]
)

-- Health Score Tracking
health_score_history (
  id UUID PRIMARY KEY,
  user_id TEXT,
  session_id UUID,
  score INTEGER,
  threat_level TEXT,
  mode TEXT,
  tactics_detected TEXT[],
  recorded_at TIMESTAMPTZ
)

-- Evidence Vault (save important analyses)
evidence_vault (
  id UUID PRIMARY KEY,
  user_id TEXT,
  session_id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB
)
```

---

## 🛠️ Technical Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.1.6, React 19, TypeScript 5.x |
| **AI Engine** | Gemini 3 Flash Preview (`gemini-3-flash-preview`) |
| **Personal Mode** | 5-Agent Pipeline (Extractor, Classifier, Psychologist, Defender, Guardian) |
| **Business Mode** | Auto-detect chat with 4 specialized agents (VisaLens, LegalLens, ScamShield, TripGuard) |
| **Itinerary Planning** | AI-generated travel itineraries with Google Maps integration |
| **Maps & Places** | Google Maps API + Google Places API (geocoding, place details, photos) |
| **Voice** | ElevenLabs TTS (eleven_turbo_v2_5, speed 1.2) |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Authentication** | Supabase Auth (Email + GitHub OAuth) |
| **Styling** | Tailwind CSS 4.x |
| **Animations** | Framer Motion |
| **Export** | HTML/PDF report generation |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
gaslighter-detect/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts       # Multi-agent analysis endpoint
│   │   ├── chat/route.ts          # Personal chat
│   │   ├── business-chat/route.ts # Business chat with itinerary detection
│   │   ├── business/              # Business mode specialized agents
│   │   │   ├── visa/route.ts      # VisaLens agent
│   │   │   ├── legal/route.ts     # LegalLens agent
│   │   │   ├── scam/route.ts      # ScamShield agent
│   │   │   └── trip/route.ts      # TripGuard agent
│   │   ├── tts/route.ts           # ElevenLabs TTS
│   │   ├── history/route.ts       # Analysis history API
│   │   ├── evidence/route.ts      # Evidence vault API
│   │   └── export/route.ts        # PDF/HTML export
│   └── page.tsx                   # Main UI with mode selector
├── components/
│   ├── chat/
│   │   ├── chat-input.tsx         # Input with image upload
│   │   ├── chat-message.tsx       # Message rendering
│   │   ├── chat-messages.tsx      # Message list with itinerary button
│   │   ├── mode-selector.tsx      # Analysis mode picker
│   │   └── speaking-avatar.tsx    # Animated avatar
│   └── itinerary/
│       └── itinerary-sheet.tsx    # Slide-up itinerary with Google Maps
├── lib/
│   ├── agents/                    # Personal mode agents
│   │   ├── prompts.ts             # All system prompts
│   │   ├── extractor.ts           # Agent 1: Vision
│   │   ├── classifier.ts          # Agent 2: Classification
│   │   ├── psychologist.ts        # Agent 3: Analysis
│   │   ├── defender.ts            # Agent 4: Responses
│   │   ├── guardian.ts            # Agent 5: Synthesis
│   │   └── orchestrator.ts        # Pipeline coordinator
│   ├── itinerary/
│   │   └── places.ts              # Google Places API enrichment
│   ├── supabase.ts                # Database helpers
│   └── taxonomy.ts                # All pattern definitions
├── types/
│   ├── agents.ts                # Agent type definitions
│   └── database.ts              # Supabase types
└── supabase/
    └── schema.sql               # Database schema
```

---

## 🚀 API Reference

### POST /api/analyze

Analyze a conversation screenshot with the multi-agent pipeline.

**Request:**
```json
{
  "imageData": "base64_encoded_image",
  "mimeType": "image/png",
  "mode": "relationship",
  "saveToDatabase": true,
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "mode": "relationship",
    "extraction": { /* parsed conversation */ },
    "classification": {
      "tacticsDetected": [ /* array of tactics */ ],
      "overallThreatLevel": "red",
      "primaryTactic": "gaslighting"
    },
    "psychology": {
      "translations": [ /* what they said vs meant */ ],
      "relationshipHealthScore": 22,
      "victimValidation": "..."
    },
    "defenses": {
      "recommendedResponses": [ /* scripts */ ],
      "safetyResources": [ /* hotlines */ ]
    },
    "guardian": {
      "summaryHeadline": "🚩 3 SERIOUS RED FLAGS DETECTED",
      "fullMarkdownResponse": "...",
      "voiceScript": "..."
    }
  },
  "timing": { "totalMs": 4200 }
}
```

### GET /api/history

Retrieve analysis history and statistics.

**Parameters:**
- `action`: `history` | `session` | `health-trend` | `tactic-stats` | `summary`
- `userId`: User identifier
- `sessionId`: For single session retrieval
- `limit`: Number of results
- `days`: Time range for trends

### GET /api/export

Generate exportable report.

**Parameters:**
- `sessionId`: Analysis session to export
- `format`: `html` | `json`

---

## �️ Business Mode & AI Itinerary

### Overview
Business Mode provides professional assistance with auto-detection of query intent. When travel planning is detected, it generates comprehensive itineraries with Google Maps integration.

### Business Chat Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                      USER MESSAGE                                │
│         "Plan a 5-day trip to Rome, Italy"                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             GEMINI 3 FLASH PREVIEW                               │
│         • Detects itinerary request                              │
│         • Generates JSON with days, activities, locations        │
│         ⏱️ ~2-3 seconds                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             GOOGLE PLACES ENRICHMENT                             │
│         • Geocodes each activity location                        │
│         • Fetches ratings, photos, opening hours                 │
│         • Adds website, phone, Google Maps URL                   │
│         ⏱️ ~1-2 seconds                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│             ITINERARY SHEET UI                                   │
│         • Day tabs for navigation                                │
│         • Activity timeline with icons                           │
│         • Interactive Google Map with markers                    │
│         • Directions routing between activities                  │
└─────────────────────────────────────────────────────────────────┘
```

### Itinerary JSON Schema
```json
{
  "type": "itinerary",
  "title": "5-Day Rome Adventure",
  "destination": "Rome, Italy",
  "start_date": "2026-03-01",
  "end_date": "2026-03-05",
  "travel_style": "cultural",
  "budget_level": "mid-range",
  "days": [
    {
      "day_number": 1,
      "title": "Ancient Rome",
      "date": "2026-03-01",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Colosseum",
          "type": "attraction",
          "location": "Piazza del Colosseo, Rome",
          "description": "Explore the iconic amphitheater",
          "latitude": 41.8902,
          "longitude": 12.4922,
          "rating": 4.7,
          "photos": ["https://..."],
          "website": "https://parcocolosseo.it"
        }
      ]
    }
  ]
}
```

---

## �🔒 Safety & Ethics

### What We Do:
- ✅ Provide educational information about manipulation patterns
- ✅ Offer victim validation and support resources
- ✅ Suggest safe response strategies
- ✅ Connect users with professional resources
- ✅ Allow anonymous usage

### What We Don't Do:
- ❌ Diagnose mental health conditions
- ❌ Encourage retaliation or escalation
- ❌ Store images (processed in memory only)
- ❌ Replace professional therapy
- ❌ Make definitive judgments about relationships

### Crisis Resources Included:
- National Domestic Violence Hotline: 1-800-799-7233
- Crisis Text Line: Text HOME to 741741
- FTC Report Fraud: reportfraud.ftc.gov
- FBI IC3: ic3.gov
- Psychology Today Therapist Finder

---

## 🎯 Impact & Future Vision

### Current Impact:
- Instant manipulation detection (vs months of confusion)
- Accessible alternative to expensive therapy
- Scam protection for vulnerable populations
- Self-improvement tools for personal growth

### Roadmap:
- [ ] User accounts with full history
- [ ] Chrome extension for real-time analysis
- [ ] Relationship pattern timeline visualization
- [ ] Community pattern database
- [ ] Multi-language support
- [ ] Integration with therapy platforms

---

## 🏃 Quick Start

```bash
# Clone & Install
git clone https://github.com/yourusername/gaslighter-detect
cd gaslighter-detect
npm install

# Configure Environment
cp .env.example .env
# Add: GEMINI_API_KEY, ELEVENLABS_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Run Database Migrations
# Copy supabase/schema.sql to your Supabase SQL editor and run

# Start Development
npm run dev
```

---

## 🏆 Why Gemini 3 Flash Preview?

1. **Multimodal Vision**: Understands screenshot layouts, chat bubble colors, platform UI with enhanced accuracy
2. **Advanced Reasoning**: Superior psychological analysis with nuance and context awareness
3. **JSON Mode**: Guaranteed structured output for pipeline data flow
4. **Thinking Capability**: Built-in reasoning for complex manipulation pattern detection
5. **Speed**: 5-agent pipeline completes in ~3-4 seconds (faster than 2.0)
6. **1M Token Context**: Handles extremely long conversation histories
7. **Cost-Effective**: Optimized for consumer applications at scale
8. **Function Calling**: Native support for tool use and API integrations
9. **Structured Outputs**: Reliable JSON schema adherence for data pipelines

---

## 📝 License

MIT License - Built for the Gemini 3 Hackathon

---

## 💜 A Note to Users

If you're here, you're probably dealing with something difficult. Whether it's a manipulative relationship, a suspicious message, or your own patterns you want to change — **you're taking the right step**.

This tool is here to support you, not judge you. Your feelings are valid. Your experiences are real. And you deserve healthy, honest relationships.

**Trust your gut. You came here for a reason.** 💜

---

*Built with 💔→💪 by developers who've been there*

🛡️ **Gaslighter Detect** — Your AI guardian against manipulation
