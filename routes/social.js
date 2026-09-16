const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const express = require('express');
const { put, get: getBlob } = require('@vercel/blob');
const { RekognitionClient, DetectModerationLabelsCommand } = require('@aws-sdk/client-rekognition');
const { AccessToken } = require('livekit-server-sdk');
const Ably = require('ably');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_MESSAGE_LENGTH = 8000;
const POLICY_VERSION = '2026-09-15';

function uuid() {
    return crypto.randomUUID();
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function createSocialRouter({ db, authenticateToken }) {
    const router = express.Router();
    const query = (text, values = []) => db.query(text, values);
    const ably = process.env.ABLY_API_KEY ? new Ably.Rest({ key: process.env.ABLY_API_KEY }) : null;

    async function publishSignal(channel, name, data) {
        if (!ably) return;
        try {
            await ably.channels.get(channel).publish(name, data);
        } catch (error) {
            console.warn('Falha ao publicar sinal de tempo real; clientes usarão reconciliação:', error.message);
        }
    }

    router.use(authenticateToken);

    async function conversationMembership(conversationId, userId) {
        const result = await query(
            `SELECT c.id, c.kind, c.title, c.owner_id, c.community_id, cm.role
             FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id
             WHERE c.id = $1 AND cm.user_id = $2 AND cm.left_at IS NULL`,
            [conversationId, userId]
        );
        return result.rows[0] || null;
    }

    async function communityMembership(communityId, userId) {
        const result = await query(
            `SELECT c.*, cm.role
             FROM communities c
             JOIN community_members cm ON cm.community_id = c.id
             WHERE c.id = $1 AND cm.user_id = $2`,
            [communityId, userId]
        );
        return result.rows[0] || null;
    }

    async function assertNotBlocked(userId, otherUserId) {
        const result = await query(
            `SELECT 1 FROM user_blocks
             WHERE (blocker_id = $1 AND blocked_id = $2)
                OR (blocker_id = $2 AND blocked_id = $1)`,
            [userId, otherUserId]
        );
        return result.rows.length === 0;
    }

    async function areFriends(userId, otherUserId) {
        const result = await query(
            `SELECT 1 FROM followers
             WHERE status = 'accepted' AND (
                (follower_id = $1 AND following_id = $2)
                OR (follower_id = $2 AND following_id = $1)
             )`,
            [userId, otherUserId]
        );
        return result.rows.length > 0;
    }

    router.get('/settings', async (req, res, next) => {
        try {
            const result = await query(
                `INSERT INTO user_settings (user_id) VALUES ($1)
                 ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
                 RETURNING enter_to_send AS "enterToSend", compact_mode AS "compactMode", font_scale AS "fontScale"`,
                [req.user.id]
            );
            res.json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.patch('/settings', async (req, res, next) => {
        try {
            const enterToSend = req.body.enterToSend !== false;
            const compactMode = req.body.compactMode === true;
            const fontScale = Number(req.body.fontScale || 1);
            if (fontScale < 0.8 || fontScale > 1.5) {
                return res.status(400).json({ success: false, code: 'INVALID_FONT_SCALE', error: 'Escala de fonte inválida' });
            }
            const result = await query(
                `INSERT INTO user_settings (user_id, enter_to_send, compact_mode, font_scale)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) DO UPDATE SET
                    enter_to_send = EXCLUDED.enter_to_send,
                    compact_mode = EXCLUDED.compact_mode,
                    font_scale = EXCLUDED.font_scale,
                    updated_at = NOW()
                 RETURNING enter_to_send AS "enterToSend", compact_mode AS "compactMode", font_scale AS "fontScale"`,
                [req.user.id, enterToSend, compactMode, fontScale]
            );
            res.json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.post('/media/uploads', async (req, res, next) => {
        try {
            const { purpose, fileName, contentType, contextId = null } = req.body;
            if (!['avatar', 'cover', 'post', 'message', 'community'].includes(purpose)) {
                return res.status(400).json({ success: false, code: 'INVALID_PURPOSE', error: 'Finalidade de mídia inválida' });
            }
            if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
                return res.status(415).json({ success: false, code: 'UNSUPPORTED_IMAGE', error: 'Use JPEG, PNG ou WebP estático' });
            }
            const id = uuid();
            await query(
                `INSERT INTO media_assets (id, owner_id, purpose, context_id, original_name, mime_type, status, policy_version)
                 VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
                [id, req.user.id, purpose, contextId, String(fileName || 'imagem').slice(0, 180), contentType, POLICY_VERSION]
            );
            res.status(201).json({ id, uploadUrl: `/api/v2/media/${id}/content`, maxBytes: MAX_IMAGE_BYTES });
        } catch (error) { next(error); }
    });

    router.put('/media/:id/content', express.raw({ type: [...ALLOWED_IMAGE_TYPES], limit: MAX_IMAGE_BYTES }), async (req, res, next) => {
        try {
            const mediaResult = await query(
                `SELECT * FROM media_assets WHERE id = $1 AND owner_id = $2 FOR UPDATE`,
                [req.params.id, req.user.id]
            );
            const media = mediaResult.rows[0];
            if (!media) return res.status(404).json({ success: false, code: 'MEDIA_NOT_FOUND', error: 'Mídia não encontrada' });
            if (media.status !== 'pending') return res.status(409).json({ success: false, code: 'MEDIA_ALREADY_PROCESSED', error: 'Upload já processado' });
            const contentType = req.headers['content-type'];
            if (!ALLOWED_IMAGE_TYPES.has(contentType) || !Buffer.isBuffer(req.body) || req.body.length === 0) {
                return res.status(415).json({ success: false, code: 'INVALID_IMAGE_BODY', error: 'Arquivo de imagem inválido' });
            }

            await query(`UPDATE media_assets SET status = 'processing', byte_size = $2, updated_at = NOW() WHERE id = $1`, [media.id, req.body.length]);
            const safeName = media.original_name.replace(/[^a-zA-Z0-9._-]/g, '-');
            const privateBlob = await put(`quarantine/${media.owner_id}/${media.id}/${safeName}`, req.body, {
                access: 'private',
                contentType,
                addRandomSuffix: false
            });

            let labels = [];
            let status = 'review';
            const moderationEnabled = Boolean(process.env.AWS_REGION);
            if (moderationEnabled) {
                const client = new RekognitionClient({ region: process.env.AWS_REGION });
                const response = await client.send(new DetectModerationLabelsCommand({
                    Image: { Bytes: req.body },
                    MinConfidence: Number(process.env.MODERATION_MIN_CONFIDENCE || 80)
                }));
                labels = (response.ModerationLabels || []).map((label) => ({
                    name: label.Name,
                    parentName: label.ParentName,
                    confidence: label.Confidence
                }));
                const deniedNames = (process.env.MODERATION_DENY_LABELS || 'Explicit Nudity,Sexual Activity,Graphic Male Nudity,Graphic Female Nudity').split(',').map((value) => value.trim());
                status = labels.some((label) => deniedNames.includes(label.name)) ? 'rejected' : 'approved';
            }

            let publicUrl = null;
            if (status === 'approved' && ['avatar', 'cover', 'post', 'community'].includes(media.purpose)) {
                const approvedBlob = await put(`approved/${media.owner_id}/${media.id}/${safeName}`, req.body, {
                    access: 'public',
                    contentType,
                    addRandomSuffix: false
                });
                publicUrl = approvedBlob.url;
            }

            await query(
                `UPDATE media_assets SET private_url = $2, public_url = $3, status = $4,
                    moderation_labels = $5::jsonb, updated_at = NOW() WHERE id = $1`,
                [media.id, privateBlob.url, publicUrl, status, JSON.stringify(labels)]
            );
            res.status(status === 'review' ? 202 : 200).json({ id: media.id, status, publicUrl });
        } catch (error) {
            await query(`UPDATE media_assets SET status = 'failed', updated_at = NOW() WHERE id = $1 AND owner_id = $2`, [req.params.id, req.user.id]).catch(() => {});
            next(error);
        }
    });

    router.get('/media/:id', async (req, res, next) => {
        try {
            const result = await query(
                `SELECT id, purpose, original_name AS "fileName", mime_type AS "contentType", byte_size AS "byteSize",
                        status, public_url AS "publicUrl", created_at AS "createdAt"
                 FROM media_assets WHERE id = $1 AND owner_id = $2`,
                [req.params.id, req.user.id]
            );
            if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Mídia não encontrada' });
            res.json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.get('/media/:id/content', async (req, res, next) => {
        try {
            const result = await query(
                `SELECT ma.* FROM media_assets ma
                 WHERE ma.id = $1 AND ma.status = 'approved' AND (
                    ma.owner_id = $2 OR EXISTS (
                        SELECT 1 FROM message_attachments a
                        JOIN chat_messages m ON m.id = a.message_id
                        JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
                        WHERE a.asset_id = ma.id AND cm.user_id = $2 AND cm.left_at IS NULL
                    )
                 )`,
                [req.params.id, req.user.id]
            );
            const media = result.rows[0];
            if (!media) return res.status(404).json({ success: false, error: 'Mídia não encontrada' });
            if (media.public_url) return res.redirect(302, media.public_url);
            const blob = await getBlob(media.private_url, { access: 'private' });
            if (!blob || !blob.stream) return res.status(404).json({ success: false, error: 'Arquivo indisponível' });
            res.setHeader('Content-Type', media.mime_type);
            res.setHeader('Cache-Control', 'private, max-age=300');
            Readable.fromWeb(blob.stream).pipe(res);
        } catch (error) { next(error); }
    });

    router.patch('/profile/media', async (req, res, next) => {
        try {
            const { avatarAssetId, coverAssetId } = req.body;
            for (const [field, assetId, purpose] of [['avatar', avatarAssetId, 'avatar'], ['cover_image', coverAssetId, 'cover']]) {
                if (assetId === undefined) continue;
                if (assetId === null) {
                    await query(`UPDATE users SET ${field} = NULL, ${field === 'avatar' ? 'avatar_asset_id' : 'cover_asset_id'} = NULL WHERE id = $1`, [req.user.id]);
                    continue;
                }
                const assetResult = await query(
                    `SELECT id, public_url FROM media_assets WHERE id = $1 AND owner_id = $2 AND purpose = $3 AND status = 'approved'`,
                    [assetId, req.user.id, purpose]
                );
                if (!assetResult.rows[0]) return res.status(409).json({ success: false, code: 'MEDIA_NOT_APPROVED', error: 'A imagem ainda não foi aprovada' });
                const idColumn = field === 'avatar' ? 'avatar_asset_id' : 'cover_asset_id';
                await query(`UPDATE users SET ${field} = $2, ${idColumn} = $3 WHERE id = $1`, [req.user.id, assetResult.rows[0].public_url, assetId]);
            }
            const result = await query(`SELECT id, name, avatar, cover_image FROM users WHERE id = $1`, [req.user.id]);
            res.json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.get('/conversations', async (req, res, next) => {
        try {
            const result = await query(
                `SELECT c.id, c.kind, c.title, c.community_id AS "communityId", cm.role,
                        lm.id AS "lastMessageId", lm.content AS "lastMessage", lm.created_at AS "lastMessageAt"
                 FROM conversation_members cm
                 JOIN conversations c ON c.id = cm.conversation_id
                 LEFT JOIN LATERAL (
                    SELECT id, content, created_at FROM chat_messages
                    WHERE conversation_id = c.id AND deleted_at IS NULL
                    ORDER BY created_at DESC, id DESC LIMIT 1
                 ) lm ON TRUE
                 WHERE cm.user_id = $1 AND cm.left_at IS NULL
                 ORDER BY COALESCE(lm.created_at, c.created_at) DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) { next(error); }
    });

    router.post('/conversations', async (req, res, next) => {
        try {
            const kind = req.body.kind;
            const memberIds = [...new Set((req.body.memberIds || []).map(Number).filter(Number.isInteger))];
            if (!['direct', 'group'].includes(kind)) return res.status(400).json({ success: false, error: 'Tipo de conversa inválido' });
            if (kind === 'direct' && memberIds.length !== 1) return res.status(400).json({ success: false, error: 'Conversa direta exige um destinatário' });
            if (kind === 'group' && (memberIds.length < 1 || memberIds.length > 19)) return res.status(400).json({ success: false, error: 'Grupo deve ter entre 2 e 20 participantes incluindo você' });
            if (memberIds.includes(req.user.id)) return res.status(400).json({ success: false, error: 'Não repita seu usuário nos membros' });
            for (const memberId of memberIds) {
                if (!(await assertNotBlocked(req.user.id, memberId))) return res.status(403).json({ success: false, error: 'Não é possível conversar com um usuário bloqueado' });
                if (!(await areFriends(req.user.id, memberId))) return res.status(403).json({ success: false, error: 'Adicione o usuário como amigo antes de incluí-lo' });
            }
            const directKey = kind === 'direct' ? [req.user.id, memberIds[0]].sort((a, b) => a - b).join(':') : null;
            if (directKey) {
                const existing = await query(`SELECT id, kind, title FROM conversations WHERE direct_key = $1`, [directKey]);
                if (existing.rows[0]) return res.json(existing.rows[0]);
            }
            const id = uuid();
            await query(
                `INSERT INTO conversations (id, kind, title, owner_id, direct_key) VALUES ($1, $2, $3, $4, $5)`,
                [id, kind, kind === 'group' ? String(req.body.title || 'Novo grupo').slice(0, 80) : null, req.user.id, directKey]
            );
            await query(`INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'owner')`, [id, req.user.id]);
            for (const memberId of memberIds) {
                await query(`INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'member')`, [id, memberId]);
            }
            res.status(201).json({ id, kind, title: req.body.title || null });
        } catch (error) { next(error); }
    });

    router.post('/conversations/:id/members/:userId', async (req, res, next) => {
        try {
            const membership = await conversationMembership(req.params.id, req.user.id);
            const newUserId = Number(req.params.userId);
            if (!membership || membership.kind !== 'group' || !['owner', 'admin'].includes(membership.role)) {
                return res.status(403).json({ success: false, error: 'Sem permissão para adicionar membros' });
            }
            if (!Number.isInteger(newUserId) || newUserId === req.user.id) return res.status(400).json({ success: false, error: 'Usuário inválido' });
            const count = await query(`SELECT COUNT(*)::int AS count FROM conversation_members WHERE conversation_id = $1 AND left_at IS NULL`, [req.params.id]);
            if (count.rows[0].count >= 20) return res.status(409).json({ success: false, error: 'O grupo atingiu o limite de 20 membros' });
            if (!(await areFriends(req.user.id, newUserId)) || !(await assertNotBlocked(req.user.id, newUserId))) {
                return res.status(403).json({ success: false, error: 'Só é possível adicionar amigos não bloqueados' });
            }
            await query(
                `INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, left_at)
                 VALUES ($1, $2, 'member', NOW(), NULL)
                 ON CONFLICT (conversation_id, user_id) DO UPDATE SET joined_at = NOW(), left_at = NULL, role = 'member'`,
                [req.params.id, newUserId]
            );
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.delete('/conversations/:id/members/:userId', async (req, res, next) => {
        try {
            const actor = await conversationMembership(req.params.id, req.user.id);
            const targetUserId = Number(req.params.userId);
            if (!actor || actor.kind !== 'group') return res.status(403).json({ success: false, error: 'Sem acesso ao grupo' });
            const target = await conversationMembership(req.params.id, targetUserId);
            if (!target) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
            const leaving = targetUserId === req.user.id;
            if (target.role === 'owner') return res.status(409).json({ success: false, error: 'Transfira a propriedade antes de o dono sair' });
            if (!leaving && !['owner', 'admin'].includes(actor.role)) return res.status(403).json({ success: false, error: 'Sem permissão para remover membros' });
            await query(`UPDATE conversation_members SET left_at = NOW() WHERE conversation_id = $1 AND user_id = $2`, [req.params.id, targetUserId]);
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.post('/conversations/:id/transfer-owner', async (req, res, next) => {
        try {
            const actor = await conversationMembership(req.params.id, req.user.id);
            const newOwnerId = Number(req.body.userId);
            if (!actor || actor.kind !== 'group' || actor.role !== 'owner') return res.status(403).json({ success: false, error: 'Somente o dono pode transferir o grupo' });
            const target = await conversationMembership(req.params.id, newOwnerId);
            if (!target) return res.status(404).json({ success: false, error: 'Novo dono não pertence ao grupo' });
            await query(
                `WITH former_owner AS (
                    UPDATE conversation_members SET role = 'admin'
                    WHERE conversation_id = $1 AND user_id = $2
                 ), new_owner AS (
                    UPDATE conversation_members SET role = 'owner'
                    WHERE conversation_id = $1 AND user_id = $3
                 )
                 UPDATE conversations SET owner_id = $3 WHERE id = $1`,
                [req.params.id, req.user.id, newOwnerId]
            );
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.get('/conversations/:id/messages', async (req, res, next) => {
        try {
            if (!(await conversationMembership(req.params.id, req.user.id))) return res.status(403).json({ success: false, error: 'Sem acesso à conversa' });
            const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
            const values = [req.params.id, limit];
            let cursorClause = '';
            if (req.query.before) {
                values.push(req.query.before);
                cursorClause = `AND (m.created_at, m.id) < (SELECT created_at, id FROM chat_messages WHERE id = $3)`;
            }
            const result = await query(
                `SELECT m.id, m.conversation_id AS "conversationId", m.sender_id AS "senderId", u.name AS "senderName",
                        m.content, m.format, m.reply_to_id AS "replyToId", m.created_at AS "createdAt",
                        m.edited_at AS "editedAt", m.deleted_at AS "deletedAt",
                        COALESCE((
                            SELECT json_agg(json_build_object('id', ma.id, 'fileName', ma.original_name, 'contentType', ma.mime_type))
                            FROM message_attachments attachment
                            JOIN media_assets ma ON ma.id = attachment.asset_id AND ma.status = 'approved'
                            WHERE attachment.message_id = m.id
                        ), '[]'::json) AS attachments
                 FROM chat_messages m JOIN users u ON u.id = m.sender_id
                 WHERE m.conversation_id = $1 ${cursorClause}
                 ORDER BY m.created_at DESC, m.id DESC LIMIT $2`,
                values
            );
            res.json({ messages: result.rows.reverse(), nextCursor: result.rows.length === limit ? result.rows[0]?.id : null });
        } catch (error) { next(error); }
    });

    router.post('/conversations/:id/messages', async (req, res, next) => {
        try {
            if (!(await conversationMembership(req.params.id, req.user.id))) return res.status(403).json({ success: false, error: 'Sem acesso à conversa' });
            const content = String(req.body.content || '').trim();
            const format = req.body.format === 'markdown' ? 'markdown' : 'plain';
            const clientMessageId = req.body.clientMessageId;
            const attachmentIds = [...new Set(req.body.attachmentIds || [])];
            if ((!content && attachmentIds.length === 0) || content.length > MAX_MESSAGE_LENGTH || !clientMessageId) {
                return res.status(400).json({ success: false, error: 'Mensagem inválida' });
            }
            for (const assetId of attachmentIds) {
                const asset = await query(`SELECT 1 FROM media_assets WHERE id = $1 AND owner_id = $2 AND purpose = 'message' AND status = 'approved'`, [assetId, req.user.id]);
                if (!asset.rows[0]) return res.status(409).json({ success: false, error: 'Anexo ainda não aprovado' });
            }
            const id = uuid();
            const result = await query(
                `INSERT INTO chat_messages (id, conversation_id, sender_id, content, format, client_message_id, reply_to_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (sender_id, client_message_id) DO UPDATE SET client_message_id = EXCLUDED.client_message_id
                 RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", content, format, created_at AS "createdAt"`,
                [id, req.params.id, req.user.id, content, format, clientMessageId, req.body.replyToId || null]
            );
            for (const assetId of attachmentIds) {
                await query(`INSERT INTO message_attachments (message_id, asset_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [result.rows[0].id, assetId]);
            }
            await publishSignal(`conversation:${req.params.id}`, 'message.created', { id: result.rows[0].id });
            res.status(201).json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.patch('/messages/:id', async (req, res, next) => {
        try {
            const content = String(req.body.content || '').trim();
            if (!content || content.length > MAX_MESSAGE_LENGTH) return res.status(400).json({ success: false, error: 'Mensagem inválida' });
            const result = await query(
                `UPDATE chat_messages SET content = $3, format = $4, edited_at = NOW()
                 WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL
                 RETURNING id, content, format, edited_at AS "editedAt"`,
                [req.params.id, req.user.id, content, req.body.format === 'markdown' ? 'markdown' : 'plain']
            );
            if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Mensagem não encontrada' });
            res.json(result.rows[0]);
        } catch (error) { next(error); }
    });

    router.delete('/messages/:id', async (req, res, next) => {
        try {
            const result = await query(
                `UPDATE chat_messages SET content = '', deleted_at = NOW()
                 WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL RETURNING id`,
                [req.params.id, req.user.id]
            );
            if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Mensagem não encontrada' });
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.put('/conversations/:id/read', async (req, res, next) => {
        try {
            const result = await query(
                `UPDATE conversation_members cm SET last_read_message_id = $3
                 WHERE conversation_id = $1 AND user_id = $2 AND left_at IS NULL
                   AND EXISTS (SELECT 1 FROM chat_messages m WHERE m.id = $3 AND m.conversation_id = $1)
                 RETURNING conversation_id`,
                [req.params.id, req.user.id, req.body.messageId]
            );
            if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Conversa ou mensagem não encontrada' });
            res.json({ success: true });
        } catch (error) { next(error); }
    });

    router.post('/communities', async (req, res, next) => {
        try {
            const name = String(req.body.name || '').trim();
            if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, error: 'Nome inválido' });
            const communityId = uuid();
            const conversationId = uuid();
            const channelId = uuid();
            await query(`INSERT INTO communities (id, owner_id, name, description, visibility) VALUES ($1, $2, $3, $4, $5)`, [communityId, req.user.id, name, String(req.body.description || '').slice(0, 500), req.body.visibility === 'public' ? 'public' : 'private']);
            await query(`INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'owner')`, [communityId, req.user.id]);
            await query(`INSERT INTO conversations (id, kind, title, owner_id, community_id) VALUES ($1, 'channel', 'geral', $2, $3)`, [conversationId, req.user.id, communityId]);
            await query(`INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'owner')`, [conversationId, req.user.id]);
            await query(`INSERT INTO community_channels (id, community_id, conversation_id, name, kind) VALUES ($1, $2, $3, 'geral', 'text')`, [channelId, communityId, conversationId]);
            res.status(201).json({ id: communityId, name, defaultChannelId: channelId, defaultConversationId: conversationId });
        } catch (error) { next(error); }
    });

    router.get('/communities', async (req, res, next) => {
        try {
            const result = await query(
                `SELECT c.id, c.name, c.description, c.visibility, cm.role,
                        COUNT(DISTINCT members.user_id)::int AS "memberCount"
                 FROM communities c
                 JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = $1
                 JOIN community_members members ON members.community_id = c.id
                 GROUP BY c.id, cm.role ORDER BY c.name`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) { next(error); }
    });

    router.post('/communities/:id/channels', async (req, res, next) => {
        try {
            const membership = await communityMembership(req.params.id, req.user.id);
            if (!membership || !['owner', 'admin'].includes(membership.role)) return res.status(403).json({ success: false, error: 'Sem permissão' });
            const name = String(req.body.name || '').trim().toLowerCase().replace(/\s+/g, '-');
            if (!/^[a-z0-9-]{2,40}$/.test(name)) return res.status(400).json({ success: false, error: 'Nome de canal inválido' });
            const conversationId = uuid();
            const channelId = uuid();
            await query(`INSERT INTO conversations (id, kind, title, owner_id, community_id) VALUES ($1, 'channel', $2, $3, $4)`, [conversationId, name, req.user.id, req.params.id]);
            const members = await query(`SELECT user_id, role FROM community_members WHERE community_id = $1`, [req.params.id]);
            for (const member of members.rows) await query(`INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, $3)`, [conversationId, member.user_id, ['owner', 'admin'].includes(member.role) ? 'admin' : 'member']);
            await query(`INSERT INTO community_channels (id, community_id, conversation_id, name, kind) VALUES ($1, $2, $3, $4, $5)`, [channelId, req.params.id, conversationId, name, req.body.kind === 'voice' ? 'voice' : 'text']);
            res.status(201).json({ id: channelId, conversationId, name });
        } catch (error) { next(error); }
    });

    router.post('/communities/:id/invites', async (req, res, next) => {
        try {
            const membership = await communityMembership(req.params.id, req.user.id);
            if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) return res.status(403).json({ success: false, error: 'Sem permissão' });
            const token = crypto.randomBytes(32).toString('base64url');
            const expiresInHours = Math.min(Math.max(Number(req.body.expiresInHours) || 24, 1), 168);
            const expiresAt = new Date(Date.now() + expiresInHours * 3600000);
            await query(`INSERT INTO community_invites (id, community_id, token_hash, created_by, expires_at, max_uses) VALUES ($1, $2, $3, $4, $5, $6)`, [uuid(), req.params.id, hashToken(token), req.user.id, expiresAt, Math.min(Math.max(Number(req.body.maxUses) || 1, 1), 100)]);
            res.status(201).json({ token, expiresAt });
        } catch (error) { next(error); }
    });

    router.post('/invites/:token/accept', async (req, res, next) => {
        try {
            const inviteResult = await query(
                `UPDATE community_invites SET used_count = used_count + 1
                 WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() AND used_count < max_uses
                 RETURNING community_id`,
                [hashToken(req.params.token)]
            );
            const invite = inviteResult.rows[0];
            if (!invite) return res.status(410).json({ success: false, error: 'Convite inválido ou expirado' });
            await query(`INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`, [invite.community_id, req.user.id]);
            const channels = await query(`SELECT conversation_id FROM community_channels WHERE community_id = $1`, [invite.community_id]);
            for (const channel of channels.rows) await query(`INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO UPDATE SET left_at = NULL`, [channel.conversation_id, req.user.id]);
            res.json({ success: true, communityId: invite.community_id });
        } catch (error) { next(error); }
    });

    router.post('/calls', async (req, res, next) => {
        try {
            if (!(await conversationMembership(req.body.conversationId, req.user.id))) return res.status(403).json({ success: false, error: 'Sem acesso à conversa' });
            const callId = uuid();
            const roomId = `yourlife-${callId}`;
            await query(`INSERT INTO calls (id, conversation_id, created_by, provider_room_id) VALUES ($1, $2, $3, $4)`, [callId, req.body.conversationId, req.user.id, roomId]);
            const members = await query(`SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND left_at IS NULL`, [req.body.conversationId]);
            for (const member of members.rows) await query(`INSERT INTO call_participants (call_id, user_id, state) VALUES ($1, $2, $3)`, [callId, member.user_id, member.user_id === req.user.id ? 'joined' : 'invited']);
            await Promise.all(members.rows.filter((member) => member.user_id !== req.user.id).map((member) => publishSignal(`user:${member.user_id}`, 'call.invited', { callId })));
            res.status(201).json({ id: callId, conversationId: req.body.conversationId, state: 'ringing' });
        } catch (error) { next(error); }
    });

    router.get('/calls', async (req, res, next) => {
        try {
            const result = await query(
                `SELECT c.id, c.conversation_id AS "conversationId", c.state, c.created_at AS "createdAt",
                        c.started_at AS "startedAt", c.ended_at AS "endedAt", cp.state AS "participantState"
                 FROM call_participants cp JOIN calls c ON c.id = cp.call_id
                 WHERE cp.user_id = $1 ORDER BY c.created_at DESC LIMIT 50`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) { next(error); }
    });

    router.post('/calls/:id/:action(accept|decline|leave)', async (req, res, next) => {
        try {
            const callResult = await query(`SELECT c.* FROM calls c JOIN call_participants cp ON cp.call_id = c.id WHERE c.id = $1 AND cp.user_id = $2`, [req.params.id, req.user.id]);
            const call = callResult.rows[0];
            if (!call) return res.status(404).json({ success: false, error: 'Ligação não encontrada' });
            const participantState = req.params.action === 'accept' ? 'joined' : req.params.action === 'decline' ? 'declined' : 'left';
            await query(`UPDATE call_participants SET state = $3, joined_at = CASE WHEN $3 = 'joined' THEN NOW() ELSE joined_at END, left_at = CASE WHEN $3 IN ('left','declined') THEN NOW() ELSE left_at END WHERE call_id = $1 AND user_id = $2`, [call.id, req.user.id, participantState]);
            if (req.params.action === 'accept') await query(`UPDATE calls SET state = 'active', started_at = COALESCE(started_at, NOW()) WHERE id = $1`, [call.id]);
            const active = await query(`SELECT COUNT(*)::int AS count FROM call_participants WHERE call_id = $1 AND state = 'joined'`, [call.id]);
            if (req.params.action === 'leave' && active.rows[0].count === 0) await query(`UPDATE calls SET state = 'ended', ended_at = NOW() WHERE id = $1`, [call.id]);
            res.json({ success: true, state: participantState });
        } catch (error) { next(error); }
    });

    router.post('/calls/:id/token', async (req, res, next) => {
        try {
            if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
                return res.status(503).json({ success: false, code: 'CALLS_NOT_CONFIGURED', error: 'Serviço de chamadas ainda não configurado' });
            }
            const result = await query(`SELECT c.provider_room_id FROM calls c JOIN call_participants cp ON cp.call_id = c.id WHERE c.id = $1 AND cp.user_id = $2 AND cp.state = 'joined' AND c.state IN ('accepted','active')`, [req.params.id, req.user.id]);
            if (!result.rows[0]) return res.status(403).json({ success: false, error: 'Aceite a ligação antes de entrar' });
            const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: String(req.user.id), ttl: '10m' });
            token.addGrant({ roomJoin: true, room: result.rows[0].provider_room_id, canPublish: true, canSubscribe: true });
            res.json({ token: await token.toJwt(), url: process.env.LIVEKIT_URL });
        } catch (error) { next(error); }
    });

    router.post('/realtime/token', async (req, res, next) => {
        try {
            if (!process.env.ABLY_API_KEY) return res.status(503).json({ success: false, code: 'REALTIME_NOT_CONFIGURED', error: 'Tempo real ainda não configurado' });
            const conversations = await query(`SELECT conversation_id FROM conversation_members WHERE user_id = $1 AND left_at IS NULL`, [req.user.id]);
            const capability = Object.fromEntries(conversations.rows.map((row) => [`conversation:${row.conversation_id}`, ['subscribe', 'presence']]));
            capability[`user:${req.user.id}`] = ['subscribe'];
            const client = new Ably.Rest({ key: process.env.ABLY_API_KEY });
            const tokenRequest = await client.auth.createTokenRequest({ clientId: String(req.user.id), capability: JSON.stringify(capability), ttl: 60 * 60 * 1000 });
            res.json(tokenRequest);
        } catch (error) { next(error); }
    });

    router.put('/blocks/:userId', async (req, res, next) => {
        try {
            const blockedId = Number(req.params.userId);
            if (!Number.isInteger(blockedId) || blockedId === req.user.id) return res.status(400).json({ success: false, error: 'Usuário inválido' });
            await query(`INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [req.user.id, blockedId]);
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.delete('/blocks/:userId', async (req, res, next) => {
        try {
            await query(`DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [req.user.id, Number(req.params.userId)]);
            res.status(204).end();
        } catch (error) { next(error); }
    });

    router.post('/reports', async (req, res, next) => {
        try {
            const allowedTargets = ['user', 'message', 'post', 'community', 'call'];
            const reason = String(req.body.reason || '').trim();
            if (!allowedTargets.includes(req.body.targetType) || !req.body.targetId || reason.length < 3 || reason.length > 1000) return res.status(400).json({ success: false, error: 'Denúncia inválida' });
            const id = uuid();
            await query(`INSERT INTO reports (id, reporter_id, target_type, target_id, reason) VALUES ($1, $2, $3, $4, $5)`, [id, req.user.id, req.body.targetType, String(req.body.targetId), reason]);
            res.status(201).json({ id, status: 'open' });
        } catch (error) { next(error); }
    });

    router.use((error, req, res, next) => {
        console.error('Erro na API social:', error);
        if (res.headersSent) return next(error);
        res.status(error.status || 500).json({ success: false, code: error.code || 'SOCIAL_API_ERROR', error: 'Não foi possível concluir a operação' });
    });

    return router;
}

module.exports = { createSocialRouter };
