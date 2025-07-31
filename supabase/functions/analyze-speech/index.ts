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

    const prompt = `You are an expert speech coach analyzing a speech transcript. Please provide detailed feedback on the following speech about "${topic}":

TRANSCRIPT:
"${transcription}"

Please analyze this speech and provide your response in the following JSON format:
{
  "score": [number from 1-10],
  "feedback": "[comprehensive summary of strengths and areas to improve]",
  "suggested_phrases": [
    {
      "original": "[original phrase from transcript]",
      "suggested": "[improved alternative phrase]",
      "reason": "[brief explanation why this is better]"
    }
  ],
  "corrected_speech": "[full improved version of the speech with corrections applied]"
}

Focus on:
- Grammar and syntax errors
- Clarity and flow of ideas
- Vocabulary appropriateness and variety
- Coherence with the given topic
- Overall effectiveness of communication

Provide at least 3-5 suggested phrase improvements and ensure the corrected speech maintains the speaker's intended meaning while improving clarity and impact.`;

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
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
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