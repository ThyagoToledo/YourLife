BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Admin inicial: identidade fixa por ID, nome e e-mail do proprietário do projeto.
-- O painel nunca usa apenas o nome como critério de autorização.
UPDATE users
SET is_admin = TRUE
WHERE id = 1
  AND lower(name) = 'thyago'
  AND lower(email) = 'thyago10a2007@gmail.com';

CREATE INDEX IF NOT EXISTS users_is_admin_idx ON users (is_admin) WHERE is_admin = TRUE;

COMMIT;
