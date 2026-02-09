// ============================================
// AGENT 4: THE DEFENDER ("The Coach")
// Provides defense strategies and resources
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AnalysisMode,
  ExtractedConversation,
  ClassificationResult,
  PsychologicalAnalysis,
  DefenseStrategies,
  SafetyResource,
} from '@/types/agents';
import {
  DEFENDER_RELATIONSHIP_PROMPT,
  DEFENDER_SCAM_PROMPT,
  DEFENDER_SELF_PROMPT,
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getPromptForMode(mode: AnalysisMode): string {
  switch (mode) {
    case 'scam':
      return DEFENDER_SCAM_PROMPT;
    case 'self_analysis':
      return DEFENDER_SELF_PROMPT;
    case 'relationship':
    default:
      return DEFENDER_RELATIONSHIP_PROMPT;
  }
}

// Default safety resources by mode
const RELATIONSHIP_RESOURCES: SafetyResource[] = [
  {
    name: 'National Domestic Violence Hotline',
    contact: '1-800-799-7233',
    description: '24/7 support for domestic violence situations',
    url: 'https://thehotline.org',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    description: 'Free 24/7 crisis counseling via text',
    url: 'https://crisistextline.org',
  },
  {
    name: 'RAINN (Rape, Abuse & Incest National Network)',
    contact: '1-800-656-4673',
    description: '24/7 support for sexual assault survivors',
    url: 'https://rainn.org',
  },
];

const SCAM_RESOURCES: SafetyResource[] = [
  {
    name: 'FTC Report Fraud',
    contact: 'reportfraud.ftc.gov',
    description: 'Report scams to the Federal Trade Commission',
    url: 'https://reportfraud.ftc.gov',
  },
  {
    name: 'IC3 (FBI Internet Crime)',
    contact: 'ic3.gov',
    description: 'Report internet crimes to the FBI',
    url: 'https://www.ic3.gov',
  },
  {
    name: 'AARP Fraud Helpline',
    contact: '1-877-908-3360',
    description: 'Fraud support and reporting',
    url: 'https://aarp.org/fraud',
  },
  {
    name: 'IdentityTheft.gov',
    contact: 'identitytheft.gov',
    description: 'Report and recover from identity theft',
    url: 'https://www.identitytheft.gov',
  },
];

const SELF_RESOURCES: SafetyResource[] = [
  {
    name: 'Psychology Today Therapist Finder',
    contact: 'psychologytoday.com/therapists',
    description: 'Find a therapist in your area',
    url: 'https://www.psychologytoday.com/us/therapists',
  },
  {
    name: 'BetterHelp',
    contact: 'betterhelp.com',
    description: 'Online therapy and counseling',
    url: 'https://betterhelp.com',
  },
  {
    name: '7 Cups',
    contact: '7cups.com',
    description: 'Free emotional support from trained listeners',
    url: 'https://7cups.com',
  },
];

function getDefaultResources(mode: AnalysisMode): SafetyResource[] {
  switch (mode) {
    case 'scam':
      return SCAM_RESOURCES;
    case 'self_analysis':
      return SELF_RESOURCES;
    case 'relationship':
    default:
      return RELATIONSHIP_RESOURCES;
  }
}

export async function generateDefenses(
  extraction: ExtractedConversation,
  classification: ClassificationResult,
  psychology: PsychologicalAnalysis,
  mode: AnalysisMode
): Promise<DefenseStrategies> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  const prompt = getPromptForMode(mode);

  const tacticsSummary = classification.tacticsDetected
    .map(t => `- ${t.tacticName}: "${t.evidenceQuotes[0] || 'N/A'}" (${t.severity})`)
    .join('\n');

  const conversationText = extraction.messages
    .map((m, i) => `[${i}] ${m.sender}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${prompt}

---

CONVERSATION:
${conversationText}

DETECTED TACTICS:
${tacticsSummary || 'No specific tactics detected'}

THREAT LEVEL: ${classification.overallThreatLevel}
HEALTH SCORE: ${psychology.relationshipHealthScore}/100

PSYCHOLOGICAL CONTEXT:
${psychology.psychologicalExplanation}

${mode === 'scam' ? `SCAM TYPE: ${classification.scamType || 'Unknown'}` : ''}
${mode === 'scam' && extraction.urls && extraction.urls.length > 0 ? `SUSPICIOUS URLS: ${extraction.urls.join(', ')}` : ''}

Provide actionable defense strategies and resources for this situation.`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    let parsed: DefenseStrategies;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse defender response as JSON');
      }
    }

    // Ensure we always have resources
    const defaultResources = getDefaultResources(mode);
    const combinedResources = [
      ...(parsed.safetyResources || []),
      ...defaultResources,
    ].filter((r, i, arr) => 
      arr.findIndex(x => x.name === r.name) === i // Deduplicate
    );

    return {
      recommendedResponses: parsed.recommendedResponses || [],
      whatNotToSay: parsed.whatNotToSay || [],
      anticipatedPushback: parsed.anticipatedPushback || [],
      safetyResources: combinedResources.slice(0, 5), // Top 5 resources
      immediateActions: parsed.immediateActions || [],
      grayRockTechnique: mode === 'relationship' ? parsed.grayRockTechnique : undefined,
      reportingSteps: mode === 'scam' ? parsed.reportingSteps : undefined,
      financialProtection: mode === 'scam' ? parsed.financialProtection : undefined,
      selfCareActions: mode === 'self_analysis' ? parsed.selfCareActions : undefined,
      boundaryPractice: mode === 'self_analysis' ? parsed.boundaryPractice : undefined,
    };
  } catch (error) {
    console.error('Defender error:', error);
    throw new Error(`Defender failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
