CREATE TABLE public.discord_oauth_connections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 discord_user_id text NOT NULL,
 encrypted_tokens text NOT NULL,
 token_expires_at timestamptz NOT NULL,
 session_expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
GRANT ALL ON public.discord_oauth_connections TO service_role;
ALTER TABLE public.discord_oauth_connections ENABLE ROW LEVEL SECURITY;
CREATE INDEX discord_connections_expiry ON public.discord_oauth_connections (session_expires_at);