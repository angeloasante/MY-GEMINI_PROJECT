-- ============================================
-- Cleir    - USER CHATS SCHEMA
-- Add to existing Supabase database
-- ============================================

-- ============================================
-- USER CHATS TABLE
-- Stores all chat conversations per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'personal' CHECK (mode IN ('personal', 'business')),
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_user_chats_user_id ON user_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chats_mode ON user_chats(mode);
CREATE INDEX IF NOT EXISTS idx_user_chats_updated ON user_chats(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE user_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own chats
CREATE POLICY "Users can view own chats" ON user_chats
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own chats
CREATE POLICY "Users can create own chats" ON user_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chats
CREATE POLICY "Users can update own chats" ON user_chats
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own chats
CREATE POLICY "Users can delete own chats" ON user_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_chats_updated_at ON user_chats;
CREATE TRIGGER update_user_chats_updated_at
  BEFORE UPDATE ON user_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
