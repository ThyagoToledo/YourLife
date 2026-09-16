BEGIN;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS global_wallpaper_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS conversation_preferences (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallpaper_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    use_global_wallpaper BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE media_assets DROP CONSTRAINT IF EXISTS media_assets_purpose_check;
ALTER TABLE media_assets ADD CONSTRAINT media_assets_purpose_check
    CHECK (purpose IN ('avatar', 'cover', 'post', 'message', 'community', 'wallpaper'));

CREATE INDEX IF NOT EXISTS posts_media_asset_idx ON posts(media_asset_id) WHERE media_asset_id IS NOT NULL;

COMMIT;
