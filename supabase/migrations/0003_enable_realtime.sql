-- Migration: Enable Realtime for messages and message_likes tables
-- Created: 2025-10-18
-- Description: Configures Realtime subscriptions for real-time chat functionality

-- ============================================================================
-- 1. ENABLE REPLICA IDENTITY
-- ============================================================================
-- This is required for Supabase Realtime to track changes
ALTER TABLE IF EXISTS public.messages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.message_likes REPLICA IDENTITY FULL;

-- ============================================================================
-- 2. ENABLE REALTIME PUBLICATION
-- ============================================================================
-- Add tables to the supabase_realtime publication
-- This allows clients to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_likes;

-- Note: If the publication doesn't exist, create it first:
-- CREATE PUBLICATION supabase_realtime FOR TABLE public.messages, public.message_likes;

-- ============================================================================
-- 3. VERIFY CONFIGURATION
-- ============================================================================
-- You can verify the configuration with these queries:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('messages', 'message_likes');
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
