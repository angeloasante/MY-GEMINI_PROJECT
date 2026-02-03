import { createClient } from "@supabase/supabase-js";

// Server-side client with service role (full access)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client-side client with anon key (RLS enforced)
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Helper to generate device ID for anonymous users
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  
  let deviceId = localStorage.getItem("guardian-device-id");
  if (!deviceId) {
    deviceId = `device_${crypto.randomUUID()}`;
    localStorage.setItem("guardian-device-id", deviceId);
  }
  return deviceId;
}

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

export interface SaveAnalysisParams {
  user_id: string;
  mode: "relationship" | "scam" | "self_analysis";
  input_type?: "screenshot" | "text" | "voice";
  input_content?: string;
  input_mime_type?: string;
  platform?: string;
  relationship_type?: string;
  threat_level?: "green" | "yellow" | "orange" | "red";
  health_score?: number;
  tactics_count?: number;
  primary_tactic?: string;
  extracted_data?: object;
  classification_data?: object;
  psychology_data?: object;
  defense_data?: object;
  guardian_response?: object;
  voice_script?: string;
  processing_time_ms?: number;
}

export async function saveAnalysisSession(params: SaveAnalysisParams) {
  const { data, error } = await supabaseAdmin
    .from("analysis_sessions")
    .insert({
      user_id: params.user_id,
      mode: params.mode,
      input_type: params.input_type || "screenshot",
      input_content: params.input_content,
      input_mime_type: params.input_mime_type,
      platform: params.platform,
      relationship_type: params.relationship_type,
      threat_level: params.threat_level,
      health_score: params.health_score,
      tactics_count: params.tactics_count,
      primary_tactic: params.primary_tactic,
      extracted_data: params.extracted_data,
      classification_data: params.classification_data,
      psychology_data: params.psychology_data,
      defense_data: params.defense_data,
      guardian_response: params.guardian_response,
      voice_script: params.voice_script,
      processing_time_ms: params.processing_time_ms,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving analysis session:", error);
    throw error;
  }

  return data;
}

export interface SaveTacticParams {
  session_id: string;
  tactic_key: string;
  tactic_name: string;
  category: string;
  confidence: number;
  severity: string;
  evidence_quotes?: string[];
  message_indices?: number[];
}

export async function saveDetectedTactic(params: SaveTacticParams) {
  const { data, error } = await supabaseAdmin
    .from("detected_tactics")
    .insert({
      session_id: params.session_id,
      tactic_key: params.tactic_key,
      tactic_name: params.tactic_name,
      category: params.category,
      severity: params.severity,
      confidence: params.confidence,
      evidence_quotes: params.evidence_quotes,
      message_indices: params.message_indices,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving tactic:", error);
    throw error;
  }

  return data;
}

export interface SaveHealthScoreParams {
  user_id: string;
  session_id: string;
  score: number;
  threat_level: string;
  mode?: string;
  tactics_detected?: string[];
}

export async function saveHealthScore(params: SaveHealthScoreParams) {
  const { error } = await supabaseAdmin
    .from("health_score_history")
    .insert({
      user_id: params.user_id,
      session_id: params.session_id,
      score: params.score,
      threat_level: params.threat_level,
      mode: params.mode,
      tactics_detected: params.tactics_detected,
    });

  if (error) {
    console.error("Error saving health score:", error);
  }
}

export async function getAnalysisHistory(userId: string, limit = 50, mode?: string) {
  let query = supabaseAdmin
    .from("analysis_sessions")
    .select(`
      id,
      mode,
      threat_level,
      health_score,
      tactics_count,
      platform,
      primary_tactic,
      created_at,
      extracted_data,
      classification_data,
      psychology_data,
      defense_data,
      guardian_response,
      voice_script
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (mode) {
    query = query.eq("mode", mode);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  return data || [];
}

export async function getHealthScoreTrend(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("health_score_history")
    .select("score, threat_level, recorded_at, mode")
    .eq("user_id", userId)
    .gte("recorded_at", startDate.toISOString())
    .order("recorded_at", { ascending: true });

  if (error) {
    console.error("Error fetching health trend:", error);
    return [];
  }

  return data || [];
}

export interface SaveToVaultParams {
  user_id: string;
  session_id: string | null;
  category: string;
  title: string;
  content: string;
  metadata?: object;
}

export async function saveToEvidenceVault(params: SaveToVaultParams) {
  const { data, error } = await supabaseAdmin
    .from("evidence_vault")
    .insert({
      user_id: params.user_id,
      session_id: params.session_id,
      category: params.category,
      title: params.title,
      content: params.content,
      metadata: params.metadata,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving to vault:", error);
    throw error;
  }

  return data;
}

export async function getEvidenceVault(userId: string, category?: string) {
  let query = supabaseAdmin
    .from("evidence_vault")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching vault:", error);
    return [];
  }

  return data || [];
}

export async function getSessionDetails(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("analysis_sessions")
    .select(`
      *,
      detected_tactics (*),
      conversation_messages (*)
    `)
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching session details:", error);
    return null;
  }

  return data;
}

export async function getTacticStats(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("detected_tactics")
    .select(`
      tactic_key,
      tactic_name,
      severity,
      confidence,
      analysis_sessions!inner(user_id)
    `)
    .eq("analysis_sessions.user_id", userId);

  if (error) {
    console.error("Error fetching tactic stats:", error);
    return [];
  }

  // Aggregate stats
  const stats: Record<string, { count: number; avgConfidence: number; name: string }> = {};
  
  (data as any[])?.forEach((tactic) => {
    if (!stats[tactic.tactic_key]) {
      stats[tactic.tactic_key] = { count: 0, avgConfidence: 0, name: tactic.tactic_name };
    }
    stats[tactic.tactic_key].count++;
    stats[tactic.tactic_key].avgConfidence += tactic.confidence || 0;
  });

  // Calculate averages and sort
  return Object.entries(stats)
    .map(([key, value]) => ({
      tacticKey: key,
      tacticName: value.name,
      count: value.count,
      avgConfidence: value.avgConfidence / value.count,
    }))
    .sort((a, b) => b.count - a.count);
}
