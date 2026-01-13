CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_chats_tag_trgm
    ON chats USING gin (tag gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_chats_name_trgm
    ON chats USING gin (name gin_trgm_ops);
