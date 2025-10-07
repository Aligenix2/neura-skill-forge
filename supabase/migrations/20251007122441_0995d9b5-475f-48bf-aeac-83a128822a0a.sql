-- Create table for diagnostic speech results
CREATE TABLE IF NOT EXISTS public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_chosen TEXT NOT NULL,
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 1 AND clarity_score <= 10),
  pacing_score INTEGER NOT NULL CHECK (pacing_score >= 1 AND pacing_score <= 10),
  tone_expression_score INTEGER NOT NULL CHECK (tone_expression_score >= 1 AND tone_expression_score <= 10),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 10),
  vocabulary_score INTEGER NOT NULL CHECK (vocabulary_score >= 1 AND vocabulary_score <= 10),
  feedback JSONB NOT NULL,
  overall_recommendation TEXT NOT NULL CHECK (overall_recommendation IN ('Beginner', 'Intermediate', 'Advanced')),
  recommended_mode TEXT NOT NULL CHECK (recommended_mode IN ('debate', 'interview', 'mun')),
  motivation TEXT NOT NULL,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own diagnostic results
CREATE POLICY "Users can view own diagnostic results"
ON public.diagnostic_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own diagnostic results
CREATE POLICY "Users can insert own diagnostic results"
ON public.diagnostic_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_diagnostic_results_user_id ON public.diagnostic_results(user_id);
CREATE INDEX idx_diagnostic_results_created_at ON public.diagnostic_results(created_at DESC);