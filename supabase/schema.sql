-- ============================================
-- GASLIGHTER DETECT - DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (optional, for future auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE, -- For anonymous users
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYSIS SESSIONS
-- Main table for each analysis request
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  device_id TEXT, -- For anonymous tracking
  
  -- Input data
  input_type TEXT NOT NULL CHECK (input_type IN ('screenshot', 'text', 'voice')),
  input_content TEXT, -- base64 for images, raw text for text
  input_mime_type TEXT,
  
  -- Mode and context
  mode TEXT NOT NULL CHECK (mode IN ('relationship', 'scam', 'self_analysis')),
  platform TEXT, -- whatsapp, imessage, instagram, etc.
  relationship_type TEXT, -- romantic, family, work, friendship
  
  -- Results summary
  threat_level TEXT CHECK (threat_level IN ('green', 'yellow', 'orange', 'red')),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  primary_tactic TEXT,
  tactics_count INTEGER DEFAULT 0,
  
  -- Full results (JSON)
  extracted_data JSONB,
  classification_data JSONB,
  psychology_data JSONB,
  defense_data JSONB,
  guardian_response JSONB,
  
  -- Voice output
  voice_script TEXT,
  audio_url TEXT,
  
  -- Metadata
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_sessions_device_id ON analysis_sessions(device_id);
CREATE INDEX idx_sessions_created_at ON analysis_sessions(created_at DESC);
CREATE INDEX idx_sessions_threat_level ON analysis_sessions(threat_level);
CREATE INDEX idx_sessions_mode ON analysis_sessions(mode);

-- ============================================
-- DETECTED TACTICS
-- Individual tactics found in each analysis
-- ============================================
CREATE TABLE IF NOT EXISTS detected_tactics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  
  tactic_key TEXT NOT NULL, -- gaslighting, darvo, phishing, etc.
  tactic_name TEXT NOT NULL,
  category TEXT NOT NULL, -- relationship, scam
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Evidence
  evidence_quotes TEXT[],
  message_indices INTEGER[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tactics_session ON detected_tactics(session_id);
CREATE INDEX idx_tactics_key ON detected_tactics(tactic_key);
CREATE INDEX idx_tactics_severity ON detected_tactics(severity);

-- ============================================
-- CONVERSATION MESSAGES
-- Individual messages from extracted conversations
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  
  sender TEXT NOT NULL CHECK (sender IN ('user', 'other')),
  content TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  timestamp_original TEXT, -- Original timestamp if detected
  
  -- Flags
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_tactics TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON conversation_messages(session_id);

-- ============================================
-- EVIDENCE VAULT
-- Saved screenshots/evidence for documentation
-- ============================================
CREATE TABLE IF NOT EXISTS evidence_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Evidence data
  evidence_type TEXT CHECK (evidence_type IN ('screenshot', 'text', 'export')),
  content TEXT, -- base64 for images
  mime_type TEXT,
  
  -- Tags and organization
  tags TEXT[],
  folder TEXT DEFAULT 'General',
  
  -- Metadata
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vault_device ON evidence_vault(device_id);
CREATE INDEX idx_vault_folder ON evidence_vault(folder);
CREATE INDEX idx_vault_starred ON evidence_vault(is_starred);

-- ============================================
-- HEALTH SCORE HISTORY
-- Track relationship health over time
-- ============================================
CREATE TABLE IF NOT EXISTS health_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
  
  score INTEGER CHECK (score >= 0 AND score <= 100),
  threat_level TEXT,
  primary_tactic TEXT,
  mode TEXT,
  
  -- Context
  relationship_label TEXT, -- User can label: "Ex", "Mom", "Boss"
  notes TEXT,
  
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_device ON health_score_history(device_id);
CREATE INDEX idx_health_recorded ON health_score_history(recorded_at DESC);
CREATE INDEX idx_health_relationship ON health_score_history(relationship_label);

-- ============================================
-- PDF EXPORTS
-- Track generated exports
-- ============================================
CREATE TABLE IF NOT EXISTS pdf_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  export_type TEXT CHECK (export_type IN ('single', 'timeline', 'evidence')),
  
  -- Content stored in Supabase Storage, this is the path
  storage_path TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCAM REPORTS
-- Track scam patterns for community protection
-- ============================================
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
  
  scam_type TEXT NOT NULL, -- phishing, romance, tech_support, etc.
  sender_identifier TEXT, -- phone, email (hashed for privacy)
  urls_detected TEXT[],
  
  -- Aggregated for community protection
  is_verified BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scam_type ON scam_reports(scam_type);
CREATE INDEX idx_scam_sender ON scam_reports(sender_identifier);

-- ============================================
-- SELF ANALYSIS PATTERNS
-- Track user's own messaging patterns
-- ============================================
CREATE TABLE IF NOT EXISTS self_analysis_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
  
  pattern_type TEXT NOT NULL, -- over_apologizing, minimizing, fawning, etc.
  frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'constant')),
  examples TEXT[],
  
  -- Advice
  healthier_alternatives TEXT[],
  root_cause_explanation TEXT,
  
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_self_device ON self_analysis_patterns(device_id);
CREATE INDEX idx_self_pattern ON self_analysis_patterns(pattern_type);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_analysis_patterns ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to sessions" ON analysis_sessions
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to tactics" ON detected_tactics
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to messages" ON conversation_messages
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to vault" ON evidence_vault
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to health" ON health_score_history
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to exports" ON pdf_exports
  FOR ALL USING (true);

CREATE POLICY "Service role has full access to self_patterns" ON self_analysis_patterns
  FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get threat level distribution for a device
CREATE OR REPLACE FUNCTION get_threat_distribution(p_device_id TEXT)
RETURNS TABLE (
  threat_level TEXT,
  count BIGINT,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*) as total_count 
    FROM analysis_sessions 
    WHERE device_id = p_device_id
  )
  SELECT 
    a.threat_level,
    COUNT(*) as count,
    ROUND((COUNT(*)::DECIMAL / NULLIF(t.total_count, 0) * 100), 2) as percentage
  FROM analysis_sessions a, total t
  WHERE a.device_id = p_device_id
  GROUP BY a.threat_level, t.total_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get most common tactics for a device
CREATE OR REPLACE FUNCTION get_top_tactics(p_device_id TEXT, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  tactic_key TEXT,
  tactic_name TEXT,
  occurrence_count BIGINT,
  avg_confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.tactic_key,
    dt.tactic_name,
    COUNT(*) as occurrence_count,
    ROUND(AVG(dt.confidence), 2) as avg_confidence
  FROM detected_tactics dt
  JOIN analysis_sessions s ON dt.session_id = s.id
  WHERE s.device_id = p_device_id
  GROUP BY dt.tactic_key, dt.tactic_name
  ORDER BY occurrence_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate health score trend
CREATE OR REPLACE FUNCTION get_health_trend(p_device_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  avg_score DECIMAL,
  analysis_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(recorded_at) as date,
    ROUND(AVG(score), 0) as avg_score,
    COUNT(*) as analysis_count
  FROM health_score_history
  WHERE device_id = p_device_id
    AND recorded_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(recorded_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA INSERTION (for testing)
-- ============================================
-- Uncomment to add test data
/*
INSERT INTO analysis_sessions (device_id, input_type, mode, threat_level, health_score, primary_tactic, tactics_count)
VALUES 
  ('test-device-123', 'screenshot', 'relationship', 'red', 25, 'gaslighting', 3),
  ('test-device-123', 'text', 'scam', 'orange', NULL, 'phishing_link', 2);
*/

-- ============================================
-- GRANTS
-- ============================================
-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
