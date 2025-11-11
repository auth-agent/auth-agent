-- Auth Agent OAuth 2.1 Database Schema for Supabase
-- Simplified version without 2FA

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- TABLES
-- ====================================

-- OAuth Clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT UNIQUE NOT NULL,
    client_secret_hash TEXT NOT NULL,
    client_name TEXT NOT NULL,
    allowed_redirect_uris TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT UNIQUE NOT NULL,
    agent_secret_hash TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Authorization Requests (for spinning page polling)
CREATE TABLE IF NOT EXISTS auth_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    state TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL DEFAULT 'S256',
    scope TEXT NOT NULL DEFAULT 'openid profile email',
    agent_id TEXT REFERENCES agents(agent_id) ON DELETE SET NULL,
    authenticated BOOLEAN NOT NULL DEFAULT FALSE,
    authorization_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 minutes')
);

-- Authorization Codes
CREATE TABLE IF NOT EXISTS auth_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    model TEXT NOT NULL,
    scope TEXT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Access and Refresh Tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    agent_id TEXT NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    scope TEXT NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    access_token_expires_at TIMESTAMPTZ NOT NULL,
    refresh_token_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================
-- INDEXES
-- ====================================

-- Performance indexes for lookups
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients(client_id);
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_auth_requests_request_id ON auth_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_auth_requests_expires_at ON auth_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_codes_expires_at ON auth_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_token_id ON tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_tokens_access_token ON tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_tokens_refresh_token ON tokens(refresh_token);
CREATE INDEX IF NOT EXISTS idx_tokens_agent_id ON tokens(agent_id);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- For now, allow service role to access everything
-- In production, you should create more granular policies
CREATE POLICY "Service role can do everything on clients" ON clients
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on agents" ON agents
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on auth_requests" ON auth_requests
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on auth_codes" ON auth_codes
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on tokens" ON tokens
    FOR ALL USING (true);

-- ====================================
-- FUNCTIONS FOR AUTO-UPDATING updated_at
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- CLEANUP FUNCTIONS (for expired records)
-- ====================================

-- Function to clean up expired auth requests
CREATE OR REPLACE FUNCTION cleanup_expired_auth_requests()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_requests WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired auth codes
CREATE OR REPLACE FUNCTION cleanup_expired_auth_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- VIEWS (for easier querying)
-- ====================================

-- Active tokens view
CREATE OR REPLACE VIEW active_tokens AS
SELECT
    t.*,
    a.user_email,
    a.user_name,
    c.client_name
FROM tokens t
JOIN agents a ON t.agent_id = a.agent_id
JOIN clients c ON t.client_id = c.client_id
WHERE t.revoked = FALSE
  AND t.access_token_expires_at > NOW();

-- Pending auth requests view
CREATE OR REPLACE VIEW pending_auth_requests AS
SELECT
    ar.*,
    c.client_name
FROM auth_requests ar
JOIN clients c ON ar.client_id = c.client_id
WHERE ar.authenticated = FALSE
  AND ar.expires_at > NOW();

COMMENT ON TABLE clients IS 'OAuth 2.1 client applications';
COMMENT ON TABLE agents IS 'AI agents that authenticate via OAuth';
COMMENT ON TABLE auth_requests IS 'Pending authorization requests (for spinning page polling)';
COMMENT ON TABLE auth_codes IS 'Authorization codes (PKCE flow)';
COMMENT ON TABLE tokens IS 'Access and refresh tokens';
