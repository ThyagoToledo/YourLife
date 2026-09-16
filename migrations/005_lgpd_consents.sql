BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS age_confirmed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS legal_documents (
    document_type TEXT NOT NULL CHECK (document_type IN ('terms', 'privacy')),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (document_type, version)
);

CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('terms_acceptance', 'privacy_acknowledgement', 'marketing')),
    document_type TEXT CHECK (document_type IN ('terms', 'privacy')),
    document_version TEXT,
    granted BOOLEAN NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    ip_hash TEXT,
    user_agent TEXT,
    FOREIGN KEY (document_type, document_version) REFERENCES legal_documents(document_type, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_consents_active_purpose_idx
    ON user_consents (user_id, purpose) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'correction', 'deletion', 'revocation', 'portability')),
    details TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'completed', 'rejected')),
    response_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS data_subject_requests_user_idx ON data_subject_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS data_subject_requests_status_idx ON data_subject_requests (status, created_at ASC);

INSERT INTO legal_documents (document_type, version, title, content_hash, effective_at, active)
VALUES
    ('terms', '2026-09-16', 'Termos de Uso Your Life', 'terms-2026-09-16-v1', '2026-09-16T00:00:00Z', TRUE),
    ('privacy', '2026-09-16', 'Aviso de Privacidade Your Life', 'privacy-2026-09-16-v1', '2026-09-16T00:00:00Z', TRUE)
ON CONFLICT (document_type, version) DO UPDATE SET active = TRUE;

COMMIT;
