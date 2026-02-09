// ============================================
// AGENT 1: THE EXTRACTOR ("The Eyes")
// Extracts and structures conversation data
// Also handles automatic mode   ion
// ============================================

import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { AgentInput, ExtractedConversation, AnalysisMode } from '@/types/agents';
import { EXTRACTOR_PROMPT, EXTRACTOR_SELF_ANALYSIS_PROMPT, MODE_  ION_PROMPT } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================
// AUTO MODE   ION
// ============================================
interface Mode  ionResult {
    edMode: AnalysisMode;
  confidence: number;
  reasoning: string;
}

export async function   AnalysisMode(input: AgentInput): Promise<Mode  ionResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const parts: Part[] = [];

  // Add image if provided
  if (input.imageData) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType || 'image/jpeg',
        data: input.imageData,
      },
    });
    parts.push({ text: `${MODE_  ION_PROMPT}\n\nAnalyze this conversation screenshot and determine the appropriate analysis mode.` });
  } else if (input.conversationText) {
    parts.push({
      text: `${MODE_  ION_PROMPT}\n\nAnalyze this conversation and determine the appropriate analysis mode:\n\n${input.conversationText}`,
    });
  } else {
    // Default to relationship if no input
    return {
        edMode: 'relationship',
      confidence: 0.5,
      reasoning: 'No input provided, defaulting to relationship analysis',
    };
  }

  try {
    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    let parsed: Mode  ionResult;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Default fallback
        return {
            edMode: 'relationship',
          confidence: 0.5,
          reasoning: 'Failed to parse mode   ion response, defaulting to relationship',
        };
      }
    }

    // Validate the   ed mode
    const validModes: AnalysisMode[] = ['relationship', 'scam', 'self_analysis'];
    if (!validModes.includes(parsed.  edMode)) {
      parsed.  edMode = 'relationship';
    }

    return {
        edMode: parsed.  edMode,
      confidence: parsed.confidence || 0.8,
      reasoning: parsed.reasoning || 'Mode   ed based on content analysis',
    };
  } catch (error) {
    console.error('Mode   ion error:', error);
    // Return default mode on error
    return {
        edMode: 'relationship',
      confidence: 0.5,
      reasoning: `Mode   ion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================
// CONVERSATION EXTRACTION
// ============================================
export async function extractConversation(input: AgentInput): Promise<ExtractedConversation> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.1, // Low temp for accurate extraction
      responseMimeType: 'application/json',
    },
  });

  const prompt = input.mode === 'self_analysis'
    ? `${EXTRACTOR_PROMPT}\n\n${EXTRACTOR_SELF_ANALYSIS_PROMPT}`
    : EXTRACTOR_PROMPT;

  const parts: Part[] = [];

  // Add image if provided
  if (input.imageData) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType || 'image/jpeg',
        data: input.imageData,
      },
    });
    parts.push({ text: `${prompt}\n\nExtract all conversation data from this screenshot.` });
  } else if (input.conversationText) {
    parts.push({
      text: `${prompt}\n\nExtract and structure this conversation:\n\n${input.conversationText}`,
    });
  } else {
    throw new Error('No input provided: need imageData or conversationText');
  }

  try {
    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    let parsed: ExtractedConversation;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse extractor response as JSON');
      }
    }

    // Validate required fields and provide defaults
    return {
      participants: parsed.participants || { user: 'You', other: 'Them' },
      messages: parsed.messages || [],
      platform: parsed.platform || 'Unknown',
      conversationContext: parsed.conversationContext || 'Unknown',
      relationshipType: parsed.relationshipType || 'unknown',
      rawText: parsed.rawText || '',
      urls: parsed.urls || [],
      phoneNumbers: parsed.phoneNumbers || [],
      emails: parsed.emails || [],
    };
  } catch (error) {
    console.error('Extractor error:', error);
    throw new Error(`Extractor failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to    contact info from text
export function   ContactInfo(text: string): {
  urls: string[];
  phones: string[];
  emails: string[];
} {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const phoneRegex = /[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,6}[-\s\.]?[0-9]{3,6}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  return {
    urls: text.match(urlRegex) || [],
    phones: text.match(phoneRegex) || [],
    emails: text.match(emailRegex) || [],
  };
}
