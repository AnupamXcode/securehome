CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  name text,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  device_info text
);
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own login history" ON public.login_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);