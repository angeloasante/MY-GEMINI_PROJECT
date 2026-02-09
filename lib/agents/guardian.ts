// ============================================
// AGENT 5: THE GUARDIAN ("The Voice")
// Final synthesis with memorable presentation
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AnalysisMode,
  ExtractedConversation,
  ClassificationResult,
  PsychologicalAnalysis,
  DefenseStrategies,
  GuardianResponse,
} from '@/types/agents';
import {
  GUARDIAN_RELATIONSHIP_PROMPT,
  GUARDIAN_SCAM_PROMPT,
  GUARDIAN_SELF_PROMPT,
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getPromptForMode(mode: AnalysisMode): string {
  switch (mode) {
    case 'scam':
      return GUARDIAN_SCAM_PROMPT;
    case 'self_analysis':
      return GUARDIAN_SELF_PROMPT;
    case 'relationship':
    default:
      return GUARDIAN_RELATIONSHIP_PROMPT;
  }
}

function getSeverityEmoji(level: string): '💚' | '🟡' | '🟠' | '🔴' | '🚨' {
  switch (level) {
    case 'green':
      return '💚';
    case 'yellow':
      return '🟡';
    case 'orange':
      return '🟠';
    case 'red':
      return '🔴';
    default:
      return '🚨';
  }
}

export async function synthesizeResponse(
  extraction: ExtractedConversation,
  classification: ClassificationResult,
  psychology: PsychologicalAnalysis,
  defenses: DefenseStrategies,
  mode: AnalysisMode
): Promise<GuardianResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.7, // Higher for creative, engaging output
      responseMimeType: 'application/json',
    },
  });

  const prompt = getPromptForMode(mode);

  // Build comprehensive context for Guardian
  const tacticsFound = classification.tacticsDetected
    .map(t => `• ${t.tacticName} (${t.severity}): "${t.evidenceQuotes[0] || 'N/A'}"`)
    .join('\n');

  const translations = psychology.translations
    .map(t => `"${t.original}" → "${t.meaning}"`)
    .join('\n');

  const responses = defenses.recommendedResponses
    .slice(0, 3)
    .map(r => `[${r.type}] "${r.response}"`)
    .join('\n');

  const resources = (defenses.safetyResources || [])
    .slice(0, 3)
    .map(r => `• ${r.name}: ${r.contact}`)
    .join('\n');

  const conversationText = extraction.messages
    .map(m => `${m.sender}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${prompt}

---

MODE: ${mode.toUpperCase()}
CONVERSATION:
${conversationText}

TACTICS DETECTED (${classification.tacticsDetected.length}):
${tacticsFound || 'None detected'}

THREAT LEVEL: ${classification.overallThreatLevel.toUpperCase()}
HEALTH SCORE: ${psychology.relationshipHealthScore}/100
PATTERN TYPE: ${classification.patternType}
${classification.scamType ? `SCAM TYPE: ${classification.scamType}` : ''}

TRANSLATIONS (what they said vs meant):
${translations || 'N/A'}

PSYCHOLOGICAL EXPLANATION:
${psychology.psychologicalExplanation}

VALIDATION MESSAGE:
${psychology.victimValidation}

RECOMMENDED RESPONSES:
${responses || 'No specific responses generated'}

SAFETY RESOURCES:
${resources}

Create a powerful, memorable Guardian response that synthesizes ALL of this into an engaging format.
Voice script MUST be under 150 words and natural for text-to-speech.`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    let parsed: GuardianResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse guardian response as JSON');
      }
    }

    // Ensure voice script is within limits
    let voiceScript = parsed.voiceScript || generateFallbackVoice(classification, psychology, mode);
    const wordCount = voiceScript.split(/\s+/).length;
    if (wordCount > 150) {
      // Truncate if too long
      voiceScript = voiceScript.split(/\s+/).slice(0, 140).join(' ') + '... Stay safe out there.';
    }

    return {
      summaryHeadline: parsed.summaryHeadline || generateHeadline(classification, mode),
      severityEmoji: getSeverityEmoji(classification.overallThreatLevel),
      formattedResponse: {
        redFlags: parsed.formattedResponse?.redFlags || '',
        breakdown: parsed.formattedResponse?.breakdown || '',
        translations: parsed.formattedResponse?.translations || '',
        yourMove: parsed.formattedResponse?.yourMove || '',
        // Mode-specific fields
        scamAlert: mode === 'scam' ? parsed.formattedResponse?.scamAlert : undefined,
        urgentActions: mode === 'scam' ? parsed.formattedResponse?.urgentActions : undefined,
        selfReflection: mode === 'self_analysis' ? parsed.formattedResponse?.selfReflection : undefined,
        growthPlan: mode === 'self_analysis' ? parsed.formattedResponse?.growthPlan : undefined,
      },
      voiceScript: voiceScript,
      fullMarkdownResponse: parsed.fullMarkdownResponse || buildFallbackMarkdown(
        classification,
        psychology,
        defenses,
        mode
      ),
    };
  } catch (error) {
    console.error('Guardian error:', error);
    throw new Error(`Guardian failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateHeadline(classification: ClassificationResult, mode: AnalysisMode): string {
  const level = classification.overallThreatLevel;
  const count = classification.tacticsDetected.length;

  if (mode === 'scam') {
    if (level === 'red') return '🚨 HIGH RISK SCAM DETECTED';
    if (level === 'orange') return '⚠️ SUSPICIOUS ACTIVITY DETECTED';
    if (level === 'yellow') return '⚡ POSSIBLE SCAM INDICATORS';
    return '✅ NO SCAM DETECTED';
  }

  if (mode === 'self_analysis') {
    if (count > 3) return '🪞 Multiple patterns identified for growth';
    if (count > 0) return '💭 Some communication patterns to explore';
    return '💚 Healthy communication observed!';
  }

  // Relationship mode
  if (level === 'red') return `🚩 ${count} SERIOUS RED FLAGS DETECTED`;
  if (level === 'orange') return `⚠️ ${count} MANIPULATION TACTICS FOUND`;
  if (level === 'yellow') return `⚡ ${count} CONCERNING PATTERNS`;
  return '💚 No manipulation detected!';
}

function generateFallbackVoice(
  classification: ClassificationResult,
  psychology: PsychologicalAnalysis,
  mode: AnalysisMode
): string {
  const level = classification.overallThreatLevel;
  const count = classification.tacticsDetected.length;

  if (mode === 'scam') {
    if (level === 'red') {
      return `This is a serious scam attempt... Do not engage further. Block this contact immediately and report it. Never send money or personal information. ${psychology.victimValidation}`;
    }
    return `I analyzed this message for scam indicators. ${count > 0 ? `I found ${count} red flags that suggest this may not be legitimate.` : 'It looks relatively safe, but stay cautious.'} Always verify before sharing personal information.`;
  }

  if (mode === 'self_analysis') {
    return `I really admire you for doing this self-reflection... I noticed ${count} patterns in your communication that might be worth exploring. ${psychology.victimValidation} Small changes over time can make a big difference.`;
  }

  // Relationship mode
  if (level === 'red' || level === 'orange') {
    return `Oh no... I spotted ${count} manipulation tactics in this conversation. ${psychology.victimValidation} This is not how someone who truly cares about you should communicate. You deserve so much better than this.`;
  }

  return `I analyzed this conversation... ${count > 0 ? `I found ${count} concerning patterns.` : 'The communication looks relatively healthy.'} ${psychology.victimValidation} Trust your instincts.`;
}

function buildFallbackMarkdown(
  classification: ClassificationResult,
  psychology: PsychologicalAnalysis,
  defenses: DefenseStrategies,
  mode: AnalysisMode
): string {
  const emoji = getSeverityEmoji(classification.overallThreatLevel);
  
  let md = `# ${emoji} Analysis Complete\n\n`;

  if (classification.tacticsDetected.length > 0) {
    md += `## 🚩 Red Flags Detected\n\n`;
    classification.tacticsDetected.forEach(t => {
      md += `- **${t.tacticName}** (${t.severity}): "${t.evidenceQuotes[0] || 'Evidence found'}"\n`;
    });
    md += '\n';
  }

  if (psychology.psychologicalExplanation) {
    md += `## 🧠 What's Happening\n\n${psychology.psychologicalExplanation}\n\n`;
  }

  if (psychology.translations.length > 0) {
    md += `## 🗣️ Translation Table\n\n`;
    md += `| What They Said | What They Meant |\n|---|---|\n`;
    psychology.translations.forEach(t => {
      md += `| "${t.original}" | ${t.meaning} |\n`;
    });
    md += '\n';
  }

  if (defenses.recommendedResponses.length > 0) {
    md += `## 💪 Your Responses\n\n`;
    defenses.recommendedResponses.slice(0, 3).forEach(r => {
      md += `**${r.type.toUpperCase()}:** "${r.response}"\n\n`;
    });
  }

  md += `\n---\n\n💜 ${psychology.victimValidation}`;

  return md;
}
