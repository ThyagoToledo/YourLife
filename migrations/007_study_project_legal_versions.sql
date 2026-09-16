BEGIN;

UPDATE legal_documents SET active = FALSE
WHERE document_type IN ('terms', 'privacy');

INSERT INTO legal_documents (document_type, version, title, content_hash, effective_at, active)
VALUES
    ('terms', '2026-09-16-study-v2', 'Termos de Uso Your Life — projeto educacional', 'terms-2026-09-16-study-v2', '2026-09-16T00:00:00Z', TRUE),
    ('privacy', '2026-09-16-study-v2', 'Aviso de Privacidade Your Life — projeto educacional', 'privacy-2026-09-16-study-v2', '2026-09-16T00:00:00Z', TRUE)
ON CONFLICT (document_type, version) DO UPDATE SET active = TRUE;

COMMIT;
