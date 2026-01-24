-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone_number TEXT,
  home_address TEXT,
  pin_code TEXT,
  demo_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trusted contacts table
CREATE TABLE public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table for detection logs
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_url TEXT,
  entry_point TEXT NOT NULL DEFAULT 'Main Door',
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('verified', 'unverified')),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table for motion detection history
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'motion_detected',
  entry_point TEXT NOT NULL DEFAULT 'Main Door',
  snapshot_url TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create actions table for user responses
CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('verify', 'notify_neighbor', 'notify_police', 'lock_door')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create door_status table for lock state
CREATE TABLE public.door_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.door_status ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trusted contacts policies
CREATE POLICY "Users can view their own contacts" ON public.trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON public.trusted_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON public.trusted_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON public.trusted_contacts FOR DELETE USING (auth.uid() = user_id);

-- Visitors policies
CREATE POLICY "Users can view their own visitors" ON public.visitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visitors" ON public.visitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visitors" ON public.visitors FOR UPDATE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view their own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Actions policies
CREATE POLICY "Users can view their own actions" ON public.actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own actions" ON public.actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Door status policies
CREATE POLICY "Users can view their own door status" ON public.door_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own door status" ON public.door_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own door status" ON public.door_status FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for door_status timestamp
CREATE TRIGGER update_door_status_last_updated
  BEFORE UPDATE ON public.door_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.door_status (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for visitors and events
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;