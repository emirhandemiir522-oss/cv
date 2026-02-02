-- Create cover_letters table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
    company_name TEXT,
    job_title TEXT,
    job_description TEXT,
    content JSONB, -- Stores the generated letter content { subject, body, company_analysis }
    target_job_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own cover letters" 
ON public.cover_letters FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letters" 
ON public.cover_letters FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" 
ON public.cover_letters FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cover_letters_updated
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
