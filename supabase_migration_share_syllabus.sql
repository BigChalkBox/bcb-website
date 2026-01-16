-- ============================================
-- SHARE SYLLABUS FEATURE - DATABASE MIGRATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Add owner_id to curricula table
ALTER TABLE curricula 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Create curriculum_shares junction table for many-to-many sharing
CREATE TABLE IF NOT EXISTS curriculum_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_by_name TEXT,  -- Store name at share time for display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curriculum_id, shared_with_id)
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_curricula_owner ON curricula(owner_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_shares_shared_with ON curriculum_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_shares_curriculum ON curriculum_shares(curriculum_id);

-- 4. Enable RLS on curriculum_shares (recommended for security)
ALTER TABLE curriculum_shares ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for curriculum_shares
-- Allow users to see shares they created or received
CREATE POLICY "Users can view their own shares" ON curriculum_shares
    FOR SELECT USING (
        auth.uid() = shared_by_id OR auth.uid() = shared_with_id
    );

-- Allow curriculum owners to create shares
CREATE POLICY "Owners can share their curricula" ON curriculum_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by_id
    );

-- Allow share creators to delete their shares
CREATE POLICY "Owners can delete their shares" ON curriculum_shares
    FOR DELETE USING (
        auth.uid() = shared_by_id
    );
