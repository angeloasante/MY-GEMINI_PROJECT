# 🛡️ Gaslighter Detect

**AI-Powered Manipulation Detection for Conversations**

> Detect manipulation tactics, identify scams, and improve your communication patterns with a 5-agent AI pipeline powered by Gemini 2.0-flash.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0--flash-blue)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🔍 Three Analysis Modes

| Mode | Description |
|------|-------------|
| 💔 **Relationship** | Detect manipulation tactics like gaslighting, DARVO, love bombing |
| 🛡️ **Scam Shield** | Identify phishing, fraud, romance scams, and suspicious links |
| 🪞 **Self-Analysis** | Reflect on your own communication patterns (over-apologizing, fawning) |

### 🤖 5-Agent AI Pipeline

1. **Extractor** — Vision AI extracts text and context from screenshots
2. **Classifier** — Pattern matching against 35+ tactics
3. **Psychologist** — Deep psychological analysis and validation
4. **Defender** — Actionable response scripts and resources
5. **Guardian** — Memorable synthesis with voice delivery

### 📊 Full Database Integration

- Session history with search and filtering
- Health score tracking over time
- Evidence vault for important analyses
- Pattern statistics and trends

### 🎙️ Voice Responses

- Natural TTS via ElevenLabs
- Animated speaking avatar
- Voice scripts optimized for audio delivery

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API key
- ElevenLabs API key (optional, for voice)
- Supabase project (optional, for persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gaslighter-detect
cd gaslighter-detect

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional - Voice
ELEVENLABS_API_KEY=your_elevenlabs_key

# Optional - Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup (Optional)

If using Supabase for persistence:

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy contents of `supabase/schema.sql`
4. Run the SQL to create tables

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

### Analyzing a Screenshot

1. **Select Mode** — Choose Relationship, Scam Shield, or Self-Analysis
2. **Upload Screenshot** — Click the attachment button
3. **Wait for Analysis** — ~4-5 seconds for full pipeline
4. **Review Results** — Tactics detected, psychological analysis, response scripts
5. **Listen (optional)** — Enable voice for audio breakdown

### Understanding Results

#### Threat Levels

| Level | Meaning |
|-------|---------|
| 💚 Green | Healthy communication, no concerns |
| 🟡 Yellow | Minor issues, possibly unintentional |
| 🟠 Orange | Clear manipulation patterns |
| 🔴 Red | Severe manipulation, seek support |

#### Health Score

- **80-100**: Healthy relationship dynamics
- **60-79**: Some concerning patterns
- **40-59**: Unhealthy dynamics present
- **20-39**: Dangerous patterns detected
- **0-19**: Emergency - seek help immediately

---

## 🏗️ Architecture

```
User Input (Screenshot + Mode)
         │
         ▼
┌─────────────────────────────────────┐
│     GEMINI 2.0-FLASH PIPELINE       │
├─────────────────────────────────────┤
│  Agent 1: Extractor (Vision)        │
│  Agent 2: Classifier (JSON Mode)    │
│  Agent 3: Psychologist (Reasoning)  │
│  Agent 4: Defender (Instruction)    │
│  Agent 5: Guardian (Creative)       │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
ElevenLabs   Supabase
   TTS       Database
```

---

## 📁 Project Structure

```
gaslighter-detect/
├── app/
│   ├── api/
│   │   ├── analyze/     # Multi-agent endpoint
│   │   ├── chat/        # Chat endpoint
│   │   ├── tts/         # Voice synthesis
│   │   ├── history/     # Analysis history
│   │   ├── evidence/    # Evidence vault
│   │   └── export/      # PDF/HTML export
│   └── page.tsx         # Main UI
├── components/
│   └── chat/            # Chat components
├── lib/
│   ├── agents/          # 5 AI agents
│   ├── supabase.ts      # Database client
│   └── taxonomy.ts      # Pattern definitions
├── types/               # TypeScript types
└── supabase/
    └── schema.sql       # Database schema
```

---

## 🔒 Privacy & Safety

- **No image storage** — Screenshots processed in memory only
- **Optional persistence** — Database features are opt-in
- **Crisis resources** — Hotlines included for severe cases
- **No diagnosis** — Educational tool, not medical advice
- **User control** — Delete your data anytime

---

## 📚 Documentation

See [GEMINI_HACKATHON.md](./GEMINI_HACKATHON.md) for complete technical documentation including:

- Full architecture details
- Complete taxonomy of 35+ patterns
- API reference
- Database schema
- Safety considerations

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 💜 Support

If you're dealing with manipulation, abuse, or feeling unsafe:

- **National DV Hotline**: 1-800-799-7233
- **Crisis Text Line**: Text HOME to 741741
- **RAINN**: 1-800-656-4673

**Your feelings are valid. You deserve healthy relationships.** 💜

---

Built with 💔→💪 for the Gemini 3 Hackathon
