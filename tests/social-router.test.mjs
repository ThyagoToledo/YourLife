import express from 'express';
import request from 'supertest';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import socialModule from '../routes/social.js';

const { createSocialRouter } = socialModule;

function createTestApp(rows = []) {
    const calls = [];
    const db = {
        calls,
        query: async (...args) => {
            calls.push(args);
            return { rows };
        }
    };
    const app = express();
    app.use(express.json());
    app.use('/api/v2', createSocialRouter({
        db,
        authenticateToken: (req, res, next) => {
            req.user = { id: 7, email: 'teste@example.com' };
            next();
        }
    }));
    return { app, db };
}

describe('API social v2', () => {
    it('rejeita finalidade de mídia que não pertence à política', async () => {
        const { app, db } = createTestApp();
        const response = await request(app)
            .post('/api/v2/media/uploads')
            .send({ purpose: 'arquivo-livre', fileName: 'x.svg', contentType: 'image/svg+xml' });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, 'INVALID_PURPOSE');
        assert.equal(db.calls.length, 0);
    });

    it('rejeita SVG mesmo para uma finalidade válida', async () => {
        const { app, db } = createTestApp();
        const response = await request(app)
            .post('/api/v2/media/uploads')
            .send({ purpose: 'avatar', fileName: 'x.svg', contentType: 'image/svg+xml' });

        assert.equal(response.status, 415);
        assert.equal(response.body.code, 'UNSUPPORTED_IMAGE');
        assert.equal(db.calls.length, 0);
    });

    it('valida o intervalo da escala de fonte', async () => {
        const { app, db } = createTestApp();
        const response = await request(app)
            .patch('/api/v2/settings')
            .send({ fontScale: 4, enterToSend: true, compactMode: false });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, 'INVALID_FONT_SCALE');
        assert.equal(db.calls.length, 0);
    });

    it('impede uma conversa direta sem destinatário', async () => {
        const { app, db } = createTestApp();
        const response = await request(app)
            .post('/api/v2/conversations')
            .send({ kind: 'direct', memberIds: [] });

        assert.equal(response.status, 400);
        assert.equal(db.calls.length, 0);
    });

    it('impede bloquear a própria conta', async () => {
        const { app, db } = createTestApp();
        const response = await request(app).put('/api/v2/blocks/7');

        assert.equal(response.status, 400);
        assert.equal(db.calls.length, 0);
    });

    it('aceita denúncia válida e grava apenas metadados necessários', async () => {
        const { app, db } = createTestApp();
        const response = await request(app)
            .post('/api/v2/reports')
            .send({ targetType: 'message', targetId: 'm-1', reason: 'Conteúdo impróprio' });

        assert.equal(response.status, 201);
        assert.equal(response.body.status, 'open');
        assert.equal(db.calls.length, 1);
        assert.deepEqual(db.calls[0][1].slice(1), [7, 'message', 'm-1', 'Conteúdo impróprio']);
    });
});
