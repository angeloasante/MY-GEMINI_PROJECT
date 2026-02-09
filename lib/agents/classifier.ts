// ============================================
// AGENT 2: THE CLASSIFIER ("The Brain")
// Identifies manipulation/scam/self patterns
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AnalysisMode,
  ExtractedConversation,
  ClassificationResult,
  SelfPattern,
  UrlSafetyCheck,
} from '@/types/agents';
import {
  RELATIONSHIP_TAXONOMY,
  SCAM_TAXONOMY,
  SELF_TAXONOMY,
  getTaxonomyForMode,
} from '@/lib/taxonomy';
import {
  CLASSIFIER_RELATIONSHIP_PROMPT,
  CLASSIFIER_SCAM_PROMPT,
  CLASSIFIER_SELF_PROMPT,
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getPromptForMode(mode: AnalysisMode): string {
  switch (mode) {
    case 'scam':
      return CLASSIFIER_SCAM_PROMPT;
    case 'self_analysis':
      return CLASSIFIER_SELF_PROMPT;
    case 'relationship':
    default:
      return CLASSIFIER_RELATIONSHIP_PROMPT;
  }
}

function getTaxonomyContext(mode: AnalysisMode): string {
  const taxonomy = getTaxonomyForMode(mode);
  const entries = Object.entries(taxonomy)
    .map(([key, tactic]) => {
      const indicators = tactic.indicators || tactic.markers || [];
      const examples = tactic.examples || [];
      return `${key}: "${tactic.name}"
  Description: ${tactic.description}
  Indicators: ${indicators.join('; ')}
  Severity: ${tactic.severity}
  Example: ${examples[0] || 'N/A'}`;
    })
    .join('\n\n');

  return `TAXONOMY FOR ${mode.toUpperCase()} MODE:\n\n${entries}`;
}

export async function classifyTactics(
  extraction: ExtractedConversation,
  mode: AnalysisMode
): Promise<ClassificationResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const prompt = getPromptForMode(mode);
  const taxonomyContext = getTaxonomyContext(mode);

  const conversationContext = extraction.messages
    .map((m, i) => `[${i}] ${m.sender}: ${m.content}`)
    .join('\n');

  const urlContext = extraction.urls && extraction.urls.length > 0
    ? `\n\nURLS FOUND: ${extraction.urls.join(', ')}`
    : '';

  const fullPrompt = `${prompt}

${taxonomyContext}

---

CONVERSATION TO ANALYZE:
Platform: ${extraction.platform}
Relationship: ${extraction.relationshipType}

${conversationContext}${urlContext}

Analyze this conversation for ${mode === 'relationship' ? 'manipulation' : mode === 'scam' ? 'scam/fraud' : 'self-communication'} patterns.`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    let parsed: ClassificationResult;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse classifier response as JSON');
      }
    }

    // Validate and normalize the response
    return {
      mode: mode,
      tactics  ed: (parsed.tactics  ed || []).map(tactic => ({
        tactic: tactic.tactic,
        tacticName: tactic.tacticName || tactic.tactic,
        category: mode === 'scam' ? 'scam' : mode === 'self_analysis' ? 'self' : 'relationship',
        confidence: Math.min(1, Math.max(0, tactic.confidence || 0)),
        evidenceQuotes: tactic.evidenceQuotes || [],
        messageIndices: tactic.messageIndices || [],
        severity: validateSeverity(tactic.severity),
      })),
      overallThreatLevel: validateThreatLevel(parsed.overallThreatLevel),
      primaryTactic: parsed.primaryTactic || '',
      patternType: validatePatternType(parsed.patternType),
      // Mode-specific fields
      scamType: mode === 'scam' ? parsed.scamType : undefined,
      urlSafetyChecks: mode === 'scam' ? (parsed.urlSafetyChecks || []) as UrlSafetyCheck[] : undefined,
      selfPatterns: mode === 'self_analysis' ? (parsed.selfPatterns || []) as SelfPattern[] : undefined,
    };
  } catch (error) {
    console.error('Classifier error:', error);
    throw new Error(`Classifier failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateSeverity(severity: string | undefined): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  const valid = ['none', 'low', 'medium', 'high', 'critical'];
  return valid.includes(severity || '') ? severity as 'none' | 'low' | 'medium' | 'high' | 'critical' : 'low';
}

function validateThreatLevel(level: string | undefined): 'green' | 'yellow' | 'orange' | 'red' {
  const valid = ['green', 'yellow', 'orange', 'red'];
  return valid.includes(level || '') ? level as 'green' | 'yellow' | 'orange' | 'red' : 'yellow';
}

function validatePatternType(type: string | undefined): 'isolated_incident' | 'recurring_pattern' | 'escalating' {
  const valid = ['isolated_incident', 'recurring_pattern', 'escalating'];
  return valid.includes(type || '') ? type as 'isolated_incident' | 'recurring_pattern' | 'escalating' : 'isolated_incident';
}
