-- Add column to track initial assessment completion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_initial_assessment BOOLEAN DEFAULT FALSE;