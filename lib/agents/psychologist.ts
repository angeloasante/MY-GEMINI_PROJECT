// ============================================
// AGENT 3: THE PSYCHOLOGIST ("The Expert")
// Deep psychological analysis and validation
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AnalysisMode,
  ExtractedConversation,
  ClassificationResult,
  PsychologicalAnalysis,
} from '@/types/agents';
import { getTaxonomyForMode } from '@/lib/taxonomy';
import {
  PSYCHOLOGIST_RELATIONSHIP_PROMPT,
  PSYCHOLOGIST_SCAM_PROMPT,
  PSYCHOLOGIST_SELF_PROMPT,
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getPromptForMode(mode: AnalysisMode): string {
  switch (mode) {
    case 'scam':
      return PSYCHOLOGIST_SCAM_PROMPT;
    case 'self_analysis':
      return PSYCHOLOGIST_SELF_PROMPT;
    case 'relationship':
    default:
      return PSYCHOLOGIST_RELATIONSHIP_PROMPT;
  }
}

export async function analyzesPsychology(
  extraction: ExtractedConversation,
  classification: ClassificationResult,
  mode: AnalysisMode
): Promise<PsychologicalAnalysis> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.4, // Slightly higher for nuanced analysis
      responseMimeType: 'application/json',
    },
  });

  const taxonomy = getTaxonomyForMode(mode);
  const prompt = getPromptForMode(mode);

  // Build detailed tactic context
  const tacticDetails = classification.tacticsDetected.map(t => {
    const tacticDef = taxonomy[t.tactic];
    return `- ${t.tacticName} (${t.severity} severity, ${(t.confidence * 100).toFixed(0)}% confidence)
    Evidence: "${t.evidenceQuotes.join('", "')}"
    ${tacticDef?.longTermImpact ? `Long-term impact: ${tacticDef.longTermImpact}` : ''}`;
  }).join('\n');

  const conversationText = extraction.messages
    .map((m, i) => `[${i}] ${m.sender}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${prompt}

---

CONVERSATION CONTEXT:
Platform: ${extraction.platform}
Relationship Type: ${extraction.relationshipType}

CONVERSATION:
${conversationText}

DETECTED TACTICS (from Classifier Agent):
${tacticDetails || 'No tactics detected'}

Overall Threat Level: ${classification.overallThreatLevel}
Pattern Type: ${classification.patternType}

${mode === 'scam' && classification.scamType ? `Scam Type: ${classification.scamType}` : ''}

Provide deep psychological analysis for this ${mode === 'relationship' ? 'relationship situation' : mode === 'scam' ? 'scam attempt' : 'self-communication pattern'}.`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    let parsed: PsychologicalAnalysis;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse psychologist response as JSON');
      }
    }

    // Ensure health score is bounded
    const healthScore = Math.max(0, Math.min(100, parsed.relationshipHealthScore || 50));

    return {
      translations: parsed.translations || [],
      tacticsExplained: parsed.tacticsExplained || [],
      victimValidation: parsed.victimValidation || getDefaultValidation(mode),
      relationshipHealthScore: healthScore,
      warningSignsForFuture: parsed.warningSignsForFuture || [],
      psychologicalExplanation: parsed.psychologicalExplanation || '',
      longTermImpact: parsed.longTermImpact || '',
      // Mode-specific fields
      scamExplanation: mode === 'scam' ? parsed.scamExplanation : undefined,
      vulnerabilityFactors: mode === 'scam' ? parsed.vulnerabilityFactors : undefined,
      selfAwarenessInsights: mode === 'self_analysis' ? parsed.selfAwarenessInsights : undefined,
      healingSteps: mode === 'self_analysis' ? parsed.healingSteps : undefined,
    };
  } catch (error) {
    console.error('Psychologist error:', error);
    throw new Error(`Psychologist failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getDefaultValidation(mode: AnalysisMode): string {
  switch (mode) {
    case 'scam':
      return 'You are not at fault. Scammers are skilled manipulators who exploit human psychology.';
    case 'self_analysis':
      return 'Recognizing your own patterns takes tremendous courage and self-awareness. Be proud of this step.';
    case 'relationship':
    default:
      return 'Your feelings are valid. What you experienced is not normal or acceptable.';
  }
}
