CREATE TABLE public.discord_onboarding (
  discord_user_id text PRIMARY KEY,
  bot_already_installed boolean NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.discord_onboarding TO service_role;
ALTER TABLE public.discord_onboarding ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.discord_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_user_id text NOT NULL,
  category text NOT NULL CHECK (category IN ('feature', 'bug', 'bot_issue', 'experience')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.discord_feedback TO service_role;
ALTER TABLE public.discord_feedback ENABLE ROW LEVEL SECURITY;
CREATE INDEX discord_feedback_owner_created ON public.discord_feedback (discord_user_id, created_at);