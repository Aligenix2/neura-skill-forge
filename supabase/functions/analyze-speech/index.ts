import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, topic } = await req.json();

    if (!transcription || !topic) {
      return new Response(JSON.stringify({ error: 'Transcription and topic are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing speech for topic:', topic);
    console.log('Transcription length:', transcription.length);

    const prompt = `You are a supportive speech coach who believes in encouraging learners. Your role is to provide BALANCED, ENCOURAGING feedback that motivates students to improve. You MUST be lenient and kind in your scoring.

CRITICAL INSTRUCTIONS:
- Use a GENEROUS, ENCOURAGING marking approach - give students the benefit of the doubt
- Minor errors (filler words, small grammar mistakes) should NOT heavily impact scores
- Focus on what the speaker did WELL first, then gently suggest improvements
- Use warm, supportive language like "Great job on...", "Well done with...", "I loved how you..."
- Aim for scores between 6-9 for most speeches unless there are major issues
- Remember: The goal is to MOTIVATE and ENCOURAGE, not to discourage

TRANSCRIPT:
"${transcription}"

TOPIC: "${topic}"

MARKING SCHEME (out of 10 total, 2 marks per category):
Apply these criteria with a LENIENT, ENCOURAGING approach:

1. Clarity (2 marks)
   - 2 marks: Generally clear and understandable (minor filler words are normal!)
   - 1 mark: Mostly clear with some unclear moments
   - 0 marks: Frequently difficult to understand

2. Structure & Organization (2 marks)
   - 2 marks: Has some logical flow or attempt at organization
   - 1 mark: Basic structure present but could be improved
   - 0 marks: Very scattered with no apparent structure

3. Vocabulary & Expression (2 marks)
   - 2 marks: Uses appropriate vocabulary for the topic (simple is perfectly fine!)
   - 1 mark: Basic vocabulary but communicates effectively
   - 0 marks: Very limited vocabulary that hinders communication

4. Grammar & Sentence Construction (2 marks)
   - 2 marks: Generally good grammar (minor mistakes are normal in speech!)
   - 1 mark: Some grammar issues but meaning is clear
   - 0 marks: Many errors that significantly affect understanding

5. Relevance & Content (2 marks)
   - 2 marks: Addresses the topic adequately (even basic coverage counts!)
   - 1 mark: Somewhat relevant but could be more developed
   - 0 marks: Clearly off-topic or extremely shallow

Please provide your response in the following JSON format:
{
  "original_transcription": "${transcription}",
  "overall_score": [number from 1-10],
  "category_scores": {
    "clarity": {
      "score": [0-2],
      "explanation": "[short explanation of the score]"
    },
    "structure": {
      "score": [0-2],
      "explanation": "[short explanation of the score]"
    },
    "vocabulary": {
      "score": [0-2],
      "explanation": "[short explanation of the score]"
    },
    "grammar": {
      "score": [0-2],
      "explanation": "[short explanation of the score]"
    },
    "relevance": {
      "score": [0-2],
      "explanation": "[short explanation of the score]"
    }
  },
  "positive_aspects": [
    "[list of things the speaker did well - be encouraging and specific]"
  ],
  "areas_to_improve": [
    "[list of areas to improve in a friendly, constructive tone]"
  ],
  "suggested_phrases": [
    {
      "original": "[original phrase from transcript]",
      "suggested": "[improved alternative phrase]",
      "reason": "[brief explanation why this is better]"
    }
  ],
  "corrected_speech": "[full improved version of the speech with corrections applied]"
}

CORRECTION GUIDELINES:
- Make MINIMAL corrections that preserve the speaker's intended meaning
- Only fix minor transcription errors (missing articles, wrong verb tenses, filler words)
- Do NOT change full sentences or phrases unnecessarily
- Keep the speaker's natural voice and style

TONE REQUIREMENTS:
- Start positive_aspects with phrases like "Great job on...", "Well done with...", "I loved how you..."
- Use encouraging language throughout
- Be specific about what worked well
- Frame improvements as gentle suggestions, not criticisms
- Remember: This is about building confidence, not perfection

SCORING REMINDER: Aim for 6-9 out of 10 for most speeches. Only give very low scores if there are serious comprehension issues.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert speech coach. Always respond with valid JSON in the exact format requested. Do not include any text outside the JSON response.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('Raw OpenAI response:', analysisText);

    // Parse the JSON response from OpenAI
    let analysisResult;
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedResponse = analysisText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response was:', analysisText);
      // Fallback response if JSON parsing fails
      analysisResult = {
        score: 7,
        feedback: "Analysis completed successfully, but there was an issue formatting the detailed response.",
        suggested_phrases: [],
        corrected_speech: transcription
      };
    }

    console.log('Parsed analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-speech function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze speech',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});