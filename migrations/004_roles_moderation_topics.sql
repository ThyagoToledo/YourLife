BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS platform_role TEXT NOT NULL DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS banned_reason TEXT;

DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT users_platform_role_ck CHECK (platform_role IN ('member', 'moderator', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT users_account_status_ck CHECK (account_status IN ('active', 'suspended', 'banned'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE users SET platform_role = 'admin' WHERE is_admin = TRUE;
UPDATE users SET platform_role = 'admin', is_admin = TRUE
WHERE id = 1 AND lower(name) = 'thyago' AND lower(email) = 'thyago10a2007@gmail.com';

CREATE INDEX IF NOT EXISTS users_platform_role_idx ON users (platform_role);
CREATE INDEX IF NOT EXISTS users_account_status_idx ON users (account_status);

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY,
    actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'message', 'post', 'comment', 'call')),
    target_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('warn', 'delete', 'suspend', 'ban', 'unban', 'close_call')),
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY,
    actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS moderation_actions_target_idx ON moderation_actions (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON admin_audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS conversation_topics (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS topic_comments (
    id UUID PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES conversation_topics(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE calls ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES conversation_topics(id) ON DELETE SET NULL;
DROP INDEX IF EXISTS calls_one_open_per_conversation_idx;
CREATE UNIQUE INDEX IF NOT EXISTS calls_one_open_per_topic_idx
    ON calls (conversation_id, COALESCE(topic_id, '00000000-0000-0000-0000-000000000000'::uuid))
    WHERE state IN ('ringing', 'accepted', 'active');
CREATE INDEX IF NOT EXISTS conversation_topics_conversation_idx ON conversation_topics (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS topic_comments_topic_idx ON topic_comments (topic_id, created_at ASC);

COMMIT;
