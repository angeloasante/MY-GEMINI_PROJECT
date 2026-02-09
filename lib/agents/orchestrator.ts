// ============================================
// ORCHESTRATOR: Multi-Agent Pipeline
// Chains all 5 agents with DB persistence
// Now with AUTO MODE   ION
// ============================================

import { extractConversation,   AnalysisMode } from './extractor';
import { classifyTactics } from './classifier';
import { analyzesPsychology } from './psychologist';
import { generateDefenses } from './defender';
import { synthesizeResponse } from './guardian';
import {
  AgentInput,
  AnalysisResult,
  AnalysisMode,
} from '@/types/agents';
import {
  saveAnalysisSession,
  save  edTactic,
  saveHealthScore,
} from '@/lib/supabase';

export interface OrchestratorOptions {
  saveToDatabase?: boolean;
  userId?: string;
  sessionId?: string;
  forceMode?: AnalysisMode; // Optional: override auto-  ion
}

export async function runAnalysisPipeline(
  input: AgentInput,
  options: OrchestratorOptions = {}
): Promise<AnalysisResult> {
  const {
    saveToDatabase = true,
    userId = 'anonymous',
    sessionId,
    forceMode,
  } = options;

  const startTime = Date.now();

  // ===== AUTO MODE   ION =====
  let mode: AnalysisMode;
  let modeConfidence = 1.0;
  let modeReasoning = '';

  if (forceMode) {
    mode = forceMode;
    modeReasoning = 'Mode manually specified';
    console.log(`[Orchestrator] Using forced mode: ${mode}`);
  } else {
    console.log('[Orchestrator] Auto-  ing analysis mode...');
    const   ion = await   AnalysisMode(input);
    mode =   ion.  edMode;
    modeConfidence =   ion.confidence;
    modeReasoning =   ion.reasoning;
    console.log(`[Orchestrator]   ed mode: ${mode} (confidence: ${(modeConfidence * 100).toFixed(0)}%)`);
    console.log(`[Orchestrator] Reasoning: ${modeReasoning}`);
  }

  // Update input with   ed mode
  input.mode = mode;

  console.log(`[Orchestrator] Starting ${mode} analysis pipeline...`);

  try {
    // ===== AGENT 1: EXTRACTOR =====
    console.log('[Agent 1] Extractor: Processing input...');
    const extraction = await extractConversation(input);
    console.log(`[Agent 1] Extracted ${extraction.messages.length} messages`);

    // ===== AGENT 2: CLASSIFIER =====
    console.log('[Agent 2] Classifier:   ing patterns...');
    const classification = await classifyTactics(extraction, mode);
    console.log(`[Agent 2] Found ${classification.tactics  ed.length} tactics`);

    // ===== AGENT 3: PSYCHOLOGIST =====
    console.log('[Agent 3] Psychologist: Analyzing psychology...');
    const psychology = await analyzesPsychology(extraction, classification, mode);
    console.log(`[Agent 3] Health score: ${psychology.relationshipHealthScore}/100`);

    // ===== AGENT 4: DEFENDER =====
    console.log('[Agent 4] Defender: Generating responses...');
    const defenses = await generateDefenses(extraction, classification, psychology, mode);
    console.log(`[Agent 4] Generated ${defenses.recommendedResponses.length} responses`);

    // ===== AGENT 5: GUARDIAN =====
    console.log('[Agent 5] Guardian: Synthesizing response...');
    const guardian = await synthesizeResponse(extraction, classification, psychology, defenses, mode);
    console.log('[Agent 5] Response ready');

    const processingTime = Date.now() - startTime;

    // Build final result
    const result: AnalysisResult = {
      sessionId: sessionId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mode,
      extraction,
      classification,
      psychology,
      defenses,
      guardian,
      metadata: {
        processingTimeMs: processingTime,
        agentsUsed: ['extractor', 'classifier', 'psychologist', 'defender', 'guardian'],
        modelVersion: 'gemini-3-flash-preview',
        mode  ion: {
            edMode: mode,
          confidence: modeConfidence,
          reasoning: modeReasoning,
          wasAuto  ed: !forceMode,
        },
      },
    };

    // ===== SAVE TO DATABASE =====
    if (saveToDatabase) {
      try {
        console.log('[Database] Saving analysis session...');
        
        // Save main session
        const savedSession = await saveAnalysisSession({
          user_id: userId,
          mode,
          input_type: input.imageData ? "screenshot" : "text",
          input_content: input.conversationText || '[Image input]',
          input_mime_type: input.mimeType,
          platform: extraction.platform,
          relationship_type: extraction.relationshipType,
          threat_level: classification.overallThreatLevel,
          health_score: psychology.relationshipHealthScore,
          tactics_count: classification.tactics  ed.length,
          primary_tactic: classification.tactics  ed[0]?.tactic,
          extracted_data: extraction,
          classification_data: classification,
          psychology_data: psychology,
          defense_data: defenses,
          guardian_response: guardian,
          voice_script: guardian.voiceScript,
          processing_time_ms: processingTime,
        });

        // Save   ed tactics
        for (const tactic of classification.tactics  ed) {
          await save  edTactic({
            session_id: savedSession.id,
            tactic_key: tactic.tactic,
            tactic_name: tactic.tacticName,
            category: tactic.category,
            confidence: tactic.confidence,
            severity: tactic.severity,
            evidence_quotes: tactic.evidenceQuotes,
            message_indices: tactic.messageIndices,
          });
        }

        // Save health score to history
        await saveHealthScore({
          user_id: userId,
          session_id: savedSession.id,
          score: psychology.relationshipHealthScore,
          threat_level: classification.overallThreatLevel,
          mode,
          tactics_  ed: classification.tactics  ed.map(t => t.tactic),
        });

        console.log(`[Database] Session saved: ${savedSession.id}`);
        result.sessionId = savedSession.id;
      } catch (dbError) {
        console.error('[Database] Failed to save:', dbError);
        // Don't fail the whole pipeline for DB errors
      }
    }

    console.log(`[Orchestrator] Pipeline completed in ${processingTime}ms`);
    return result;

  } catch (error) {
    console.error('[Orchestrator] Pipeline failed:', error);
    throw error;
  }
}

// Quick analysis for chat mode (lighter weight)
export async function quickAnalysis(
  text: string,
  forceMode?: AnalysisMode
): Promise<{
  threatLevel: string;
  tacticsCount: number;
  summary: string;
  voiceScript: string;
    edMode: AnalysisMode;
}> {
  const result = await runAnalysisPipeline(
    { conversationText: text },
    { saveToDatabase: false, forceMode }
  );

  return {
    threatLevel: result.classification.overallThreatLevel,
    tacticsCount: result.classification.tactics  ed.length,
    summary: result.guardian.summaryHeadline,
    voiceScript: result.guardian.voiceScript,
      edMode: result.mode,
  };
}

// Export individual agents for direct use
export { extractConversation,   AnalysisMode } from './extractor';
export { classifyTactics } from './classifier';
export { analyzesPsychology } from './psychologist';
export { generateDefenses } from './defender';
export { synthesizeResponse } from './guardian';
