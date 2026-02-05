-- Create verified_persons table for storing facial encodings
CREATE TABLE public.verified_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  face_descriptor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verified_persons ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own verified persons"
ON public.verified_persons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verified persons"
ON public.verified_persons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verified persons"
ON public.verified_persons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verified persons"
ON public.verified_persons FOR DELETE
USING (auth.uid() = user_id);

-- Create intruder_logs table for storing intruder detection events
CREATE TABLE public.intruder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  face_descriptor JSONB,
  action_taken TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intruder_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own intruder logs"
ON public.intruder_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intruder logs"
ON public.intruder_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intruder logs"
ON public.intruder_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Add video_url to visitors table
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add face_match_confidence to visitors table
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS face_match_confidence REAL;

-- Add matched_person_id to visitors table for linking to verified persons
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS matched_person_id UUID REFERENCES public.verified_persons(id);

-- Create storage buckets for face data
INSERT INTO storage.buckets (id, name, public) VALUES ('verified-persons', 'verified-persons', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('intruders', 'intruders', false);

-- Storage policies for verified-persons bucket
CREATE POLICY "Users can view their own verified person photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'verified-persons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own verified person photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verified-persons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own verified person photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'verified-persons' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for intruders bucket
CREATE POLICY "Users can view their own intruder media"
ON storage.objects FOR SELECT
USING (bucket_id = 'intruders' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own intruder media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'intruders' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.verified_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.intruder_logs;