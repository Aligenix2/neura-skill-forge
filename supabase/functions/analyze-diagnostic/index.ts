import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, prompt, wordCount, durationSeconds } = await req.json();

    console.log('Analyzing diagnostic speech:', { wordCount, durationSeconds });

    if (!transcription || transcription.length < 10) {
      throw new Error('Transcription too short for analysis');
    }

    const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    const systemPrompt = `You are an expert speech coach analyzing a student's diagnostic speech. 
Your goal is to provide encouraging, simple feedback that helps them improve.

CRITICAL INSTRUCTIONS:
- Use simple, friendly language - avoid technical jargon
- Be encouraging and positive while being honest
- Keep feedback to 2-3 sentences per parameter
- Scores should be 1-10, with 5-7 being typical for most students
- Focus on what they did well AND one thing to improve for each area

Analyze the speech on these parameters:
1. Clarity (1-10): How clear and understandable is their speech?
2. Pacing (1-10): Is their speed appropriate? (optimal is 120-150 WPM)
3. Tone & Expression (1-10): Do they sound engaged and expressive?
4. Confidence (1-10): Do they sound self-assured?
5. Vocabulary & Word Choice (1-10): Do they use varied, appropriate words?

Provide an overall recommendation (Beginner/Intermediate/Advanced) and suggest the best training mode:
- Debate: For students who show strong argumentative thinking and confidence
- Interview: For students who need to work on structured responses and clarity
- MUN: For students who show diplomacy and formal speaking skills

Also provide a short, encouraging motivation message.`;

    const userPrompt = `Prompt chosen: "${prompt}"

Transcription: "${transcription}"

Speech metrics:
- Word count: ${wordCount}
- Duration: ${durationSeconds} seconds
- Words per minute: ${wpm}

Provide your analysis in the following JSON format:
{
  "scores": {
    "clarity": <1-10>,
    "pacing": <1-10>,
    "tone_expression": <1-10>,
    "confidence": <1-10>,
    "vocabulary": <1-10>
  },
  "feedback": {
    "clarity": "<2-3 sentences>",
    "pacing": "<2-3 sentences>",
    "tone_expression": "<2-3 sentences>",
    "confidence": "<2-3 sentences>",
    "vocabulary": "<2-3 sentences>"
  },
  "overall_recommendation": "<Beginner|Intermediate|Advanced>",
  "recommended_mode": "<debate|interview|mun>",
  "motivation": "<One encouraging sentence>"
}`;

    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    let analysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse AI analysis');
    }

    // Validate and clamp scores
    const scores = analysis.scores;
    Object.keys(scores).forEach(key => {
      scores[key] = Math.max(1, Math.min(10, scores[key]));
    });

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Store diagnostic result
        const { error: insertError } = await supabase
          .from('diagnostic_results')
          .insert({
            user_id: user.id,
            prompt_chosen: prompt,
            clarity_score: scores.clarity,
            pacing_score: scores.pacing,
            tone_expression_score: scores.tone_expression,
            confidence_score: scores.confidence,
            vocabulary_score: scores.vocabulary,
            feedback: analysis.feedback,
            overall_recommendation: analysis.overall_recommendation,
            recommended_mode: analysis.recommended_mode,
            motivation: analysis.motivation,
            transcription: transcription
          });

        if (insertError) {
          console.error('Error storing diagnostic result:', insertError);
        } else {
          console.log('Diagnostic result stored successfully');
        }
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-diagnostic function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to analyze diagnostic speech' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
