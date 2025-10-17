-- Migration: create core tables for real-time chat service
-- Created: 2025-10-17
-- Description: Creates users, chat_rooms, messages, and message_likes tables with proper constraints and indexes

-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Stores user account information (nickname, email, password)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Unique constraints
    CONSTRAINT users_nickname_key UNIQUE (nickname),
    CONSTRAINT users_email_key UNIQUE (email)
);

COMMENT ON TABLE public.users IS '사용자 계정 정보를 저장하는 테이블';
COMMENT ON COLUMN public.users.id IS '사용자 고유 ID';
COMMENT ON COLUMN public.users.nickname IS '닉네임 (중복 불허)';
COMMENT ON COLUMN public.users.email IS '이메일 (중복 불허)';
COMMENT ON COLUMN public.users.password_hash IS '해싱된 비밀번호';
COMMENT ON COLUMN public.users.created_at IS '가입일시';
COMMENT ON COLUMN public.users.updated_at IS '정보 수정일시';

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 2. CHAT_ROOMS TABLE
-- ============================================================================
-- Stores chat room information
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    creator_id uuid NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Unique constraints
    CONSTRAINT chat_rooms_name_key UNIQUE (name),

    -- Foreign key constraints
    CONSTRAINT fk_chat_rooms_creator FOREIGN KEY (creator_id)
        REFERENCES public.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.chat_rooms IS '채팅방 정보를 저장하는 테이블';
COMMENT ON COLUMN public.chat_rooms.id IS '채팅방 고유 ID';
COMMENT ON COLUMN public.chat_rooms.name IS '채팅방 이름 (최대 100자, 중복 불허)';
COMMENT ON COLUMN public.chat_rooms.creator_id IS '개설자 ID';
COMMENT ON COLUMN public.chat_rooms.is_deleted IS '삭제 여부 (soft delete)';
COMMENT ON COLUMN public.chat_rooms.deleted_at IS '삭제 일시';
COMMENT ON COLUMN public.chat_rooms.created_at IS '생성일시';
COMMENT ON COLUMN public.chat_rooms.updated_at IS '수정일시';

-- Indexes for chat_rooms table
CREATE INDEX IF NOT EXISTS idx_chat_rooms_name ON public.chat_rooms(name);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_creator_id ON public.chat_rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_deleted ON public.chat_rooms(is_deleted);

-- ============================================================================
-- 3. MESSAGES TABLE
-- ============================================================================
-- Stores chat messages
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    message_type text NOT NULL DEFAULT 'text',
    reply_to_message_id uuid,
    is_deleted boolean NOT NULL DEFAULT false,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Check constraints
    CONSTRAINT chk_message_type CHECK (message_type IN ('text', 'emoticon')),

    -- Foreign key constraints
    CONSTRAINT fk_messages_chat_room FOREIGN KEY (chat_room_id)
        REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id)
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_reply_to FOREIGN KEY (reply_to_message_id)
        REFERENCES public.messages(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.messages IS '채팅 메시지를 저장하는 테이블';
COMMENT ON COLUMN public.messages.id IS '메시지 고유 ID';
COMMENT ON COLUMN public.messages.chat_room_id IS '채팅방 ID';
COMMENT ON COLUMN public.messages.user_id IS '작성자 ID';
COMMENT ON COLUMN public.messages.content IS '메시지 내용';
COMMENT ON COLUMN public.messages.message_type IS '메시지 타입 (text, emoticon)';
COMMENT ON COLUMN public.messages.reply_to_message_id IS '답장 대상 메시지 ID (NULL 가능)';
COMMENT ON COLUMN public.messages.is_deleted IS '삭제 여부 (soft delete)';
COMMENT ON COLUMN public.messages.deleted_at IS '삭제 일시';
COMMENT ON COLUMN public.messages.created_at IS '작성일시';
COMMENT ON COLUMN public.messages.updated_at IS '수정일시';

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON public.messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_message_id ON public.messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted);

-- ============================================================================
-- 4. MESSAGE_LIKES TABLE
-- ============================================================================
-- Stores message likes (one like per user per message)
CREATE TABLE IF NOT EXISTS public.message_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    -- Unique constraint to prevent duplicate likes
    CONSTRAINT message_likes_message_id_user_id_key UNIQUE (message_id, user_id),

    -- Foreign key constraints
    CONSTRAINT fk_message_likes_message FOREIGN KEY (message_id)
        REFERENCES public.messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_likes_user FOREIGN KEY (user_id)
        REFERENCES public.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.message_likes IS '메시지에 대한 좋아요를 저장하는 테이블';
COMMENT ON COLUMN public.message_likes.id IS '좋아요 고유 ID';
COMMENT ON COLUMN public.message_likes.message_id IS '메시지 ID';
COMMENT ON COLUMN public.message_likes.user_id IS '좋아요 누른 사용자 ID';
COMMENT ON COLUMN public.message_likes.created_at IS '좋아요 일시';

-- Indexes for message_likes table
CREATE INDEX IF NOT EXISTS idx_message_likes_message_id ON public.message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user_id ON public.message_likes(user_id);

-- ============================================================================
-- 5. TRIGGERS FOR UPDATED_AT AUTO-UPDATE
-- ============================================================================
-- Create trigger function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'updated_at 컬럼을 자동으로 업데이트하는 트리거 함수';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. DISABLE RLS (Row Level Security)
-- ============================================================================
-- Per project requirements, RLS is disabled for all tables
-- Authentication and authorization are handled at the application level (Hono backend)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_likes DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- ============================================================================
-- Uncomment the following section to insert sample data for testing

/*
-- Sample users
INSERT INTO public.users (nickname, email, password_hash)
VALUES
    ('테스트유저1', 'user1@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890'),
    ('테스트유저2', 'user2@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890'),
    ('채팅왕', 'chatking@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890')
ON CONFLICT (email) DO NOTHING;

-- Sample chat rooms
INSERT INTO public.chat_rooms (name, creator_id)
SELECT '자유 채팅방', id FROM public.users WHERE email = 'user1@example.com'
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.chat_rooms (name, creator_id)
SELECT '개발자 채팅방', id FROM public.users WHERE email = 'chatking@example.com'
ON CONFLICT (name) DO NOTHING;

-- Sample messages
INSERT INTO public.messages (chat_room_id, user_id, content, message_type)
SELECT
    cr.id,
    u.id,
    '안녕하세요! 첫 메시지입니다.',
    'text'
FROM public.chat_rooms cr
CROSS JOIN public.users u
WHERE cr.name = '자유 채팅방' AND u.email = 'user1@example.com';

INSERT INTO public.messages (chat_room_id, user_id, content, message_type)
SELECT
    cr.id,
    u.id,
    '반갑습니다!',
    'text'
FROM public.chat_rooms cr
CROSS JOIN public.users u
WHERE cr.name = '자유 채팅방' AND u.email = 'user2@example.com';

-- Sample message likes
INSERT INTO public.message_likes (message_id, user_id)
SELECT
    m.id,
    u.id
FROM public.messages m
CROSS JOIN public.users u
WHERE m.content = '안녕하세요! 첫 메시지입니다.' AND u.email = 'user2@example.com'
ON CONFLICT (message_id, user_id) DO NOTHING;
*/
