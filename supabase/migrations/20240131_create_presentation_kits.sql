-- Create application_kits table for rich presentation & cover letter data
CREATE TABLE IF NOT EXISTS public.application_kits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Target Job Details
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    job_url TEXT,
    job_description_snippet TEXT,

    -- AI Generated Content (Stored as structured JSONB for flexibility)
    cover_letter_content JSONB, -- { subject, body_html }
    
    -- Rich Presentation Data
    slides_data JSONB, -- Array of visuals: [{ title, bullets[], visual_cue, speaker_notes, layout: 'bullets_right' }]
    
    -- Interview Prep
    interview_qa JSONB, -- Array of: [{ question, suggested_answer, rationale, category }]

    -- Metadata
    visual_style TEXT DEFAULT 'modern_professional', -- For frontend theming
    ai_model_used TEXT DEFAULT 'gemini-1.5-pro',
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.application_kits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own kits" 
ON public.application_kits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kits" 
ON public.application_kits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kits" 
ON public.application_kits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kits" 
ON public.application_kits FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_application_kits_updated
  BEFORE UPDATE ON public.application_kits
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
