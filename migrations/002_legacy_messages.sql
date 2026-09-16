BEGIN;

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS legacy_message_id INTEGER UNIQUE;

WITH legacy_pairs AS (
    SELECT DISTINCT
        LEAST(from_user_id, to_user_id) AS first_user_id,
        GREATEST(from_user_id, to_user_id) AS second_user_id
    FROM messages
), inserted_conversations AS (
    INSERT INTO conversations (id, kind, direct_key, owner_id)
    SELECT gen_random_uuid(), 'direct', first_user_id::text || ':' || second_user_id::text, first_user_id
    FROM legacy_pairs
    ON CONFLICT (direct_key) DO NOTHING
    RETURNING id
)
SELECT COUNT(*) FROM inserted_conversations;

INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
SELECT c.id, split_part(c.direct_key, ':', 1)::integer, 'member', c.created_at
FROM conversations c WHERE c.kind = 'direct' AND c.direct_key IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
SELECT c.id, split_part(c.direct_key, ':', 2)::integer, 'member', c.created_at
FROM conversations c WHERE c.kind = 'direct' AND c.direct_key IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO chat_messages (
    id, conversation_id, sender_id, content, format,
    client_message_id, created_at, legacy_message_id
)
SELECT
    gen_random_uuid(), c.id, m.from_user_id, m.content, 'plain',
    gen_random_uuid(), m.created_at, m.id
FROM messages m
JOIN conversations c
  ON c.direct_key = LEAST(m.from_user_id, m.to_user_id)::text || ':' || GREATEST(m.from_user_id, m.to_user_id)::text
ON CONFLICT (legacy_message_id) DO NOTHING;

WITH latest_read AS (
    SELECT DISTINCT ON (m.to_user_id, cm.conversation_id)
        cm.conversation_id, m.to_user_id, migrated.id AS message_id
    FROM messages m
    JOIN chat_messages migrated ON migrated.legacy_message_id = m.id
    JOIN conversation_members cm
      ON cm.conversation_id = migrated.conversation_id AND cm.user_id = m.to_user_id
    WHERE m.is_read = TRUE
    ORDER BY m.to_user_id, cm.conversation_id, m.created_at DESC, m.id DESC
)
UPDATE conversation_members cm
SET last_read_message_id = latest_read.message_id
FROM latest_read
WHERE cm.conversation_id = latest_read.conversation_id
  AND cm.user_id = latest_read.to_user_id;

COMMIT;
