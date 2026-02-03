// API Route: /api/analyze
// Main endpoint for the multi-agent screenshot analysis pipeline
// Supports AUTO MODE DETECTION - no need to specify mode

import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/agents/orchestrator";
import { AgentInput, AnalysisMode } from "@/types/agents";

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[ANALYZE API ${timestamp}] ${message}`, data !== undefined ? data : "");
}

function logError(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[ANALYZE API ERROR ${timestamp}] ${message}`, data !== undefined ? data : "");
}

export async function POST(request: NextRequest) {
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("Analyze request received");

  try {
    const body = await request.json();
    const { 
      imageData, 
      conversationText, 
      mimeType,
      mode, // Optional - will be auto-detected if not provided
      userId,
      saveToDatabase = true 
    } = body;

    log("Request details:", { 
      hasImage: !!imageData, 
      hasText: !!conversationText,
      mimeType, 
      mode: mode || 'AUTO-DETECT',
      userId,
      saveToDatabase 
    });

    // Validate input
    if (!imageData && !conversationText) {
      logError("No content provided");
      return NextResponse.json(
        { error: "No content provided. Send imageData or conversationText." },
        { status: 400 }
      );
    }

    // Validate mode if provided
    const validModes: AnalysisMode[] = ['relationship', 'scam', 'self_analysis'];
    if (mode && !validModes.includes(mode)) {
      logError("Invalid mode:", mode);
      return NextResponse.json(
        { error: `Invalid mode. Must be one of: ${validModes.join(', ')} (or omit for auto-detection)` },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      logError("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Build agent input (mode is optional now)
    const agentInput: AgentInput = {
      imageData: imageData || undefined,
      conversationText: conversationText || undefined,
      mimeType: mimeType || 'image/jpeg',
    };

    // Run the full multi-agent analysis pipeline
    // forceMode is optional - if not provided, mode will be auto-detected
    const startTime = Date.now();
    const result = await runAnalysisPipeline(agentInput, {
      saveToDatabase,
      userId: userId || 'anonymous',
      forceMode: mode as AnalysisMode | undefined, // undefined triggers auto-detection
    });
    const totalTime = Date.now() - startTime;

    log(`Analysis complete in ${totalTime}ms`);
    log(`Mode: ${result.mode} ${result.metadata.modeDetection?.wasAutoDetected ? '(auto-detected)' : '(manual)'}`);
    if (result.metadata.modeDetection) {
      log(`Mode Confidence: ${(result.metadata.modeDetection.confidence * 100).toFixed(0)}%`);
      log(`Mode Reasoning: ${result.metadata.modeDetection.reasoning}`);
    }
    log(`Threat Level: ${result.classification.overallThreatLevel}`);
    log(`Tactics Found: ${result.classification.tacticsDetected.length}`);
    log(`Health Score: ${result.psychology.relationshipHealthScore}/100`);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      data: result,
      timing: {
        totalMs: totalTime,
      },
    });
  } catch (error) {
    logError("Analysis failed:", error);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return NextResponse.json(
      { 
        error: "Analysis failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
