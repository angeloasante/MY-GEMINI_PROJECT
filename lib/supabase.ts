import { createClient } from "@supabase/supabase-js";

// Server-side client with service role (full access)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
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
  platform?: string;
  relationship_type?: string;
  overall_threat_level?: "green" | "yellow" | "orange" | "red";
  health_score?: number;
  tactics_count?: number;
  raw_input?: string;
  full_response?: object;
}

export async function saveAnalysisSession(params: SaveAnalysisParams) {
  const { data, error } = await supabaseAdmin
    .from("analysis_sessions")
    .insert({
      user_id: params.user_id,
      mode: params.mode,
      platform: params.platform,
      relationship_type: params.relationship_type,
      overall_threat_level: params.overall_threat_level,
      health_score: params.health_score,
      tactics_count: params.tactics_count,
      raw_input: params.raw_input,
      full_response: params.full_response,
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
      overall_threat_level,
      health_score,
      tactics_count,
      platform,
      created_at,
      full_response
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
