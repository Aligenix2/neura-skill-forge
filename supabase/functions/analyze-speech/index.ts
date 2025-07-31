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

    const prompt = `You are an expert speech coach analyzing a speech transcript. Use a balanced and slightly lenient marking style. Avoid overly strict grading. The goal is to encourage learners, not to discourage them.

TRANSCRIPT:
"${transcription}"

TOPIC: "${topic}"

Please analyze this speech using the following marking scheme out of 10, based on 5 categories (2 marks each):

1. Clarity (2 marks)
   - 2 marks: Speech is clear, well-articulated, and easy to understand
   - 1 mark: Mostly clear but has occasional mumbling, filler words, or unclear words
   - 0 marks: Often unclear, hard to follow

2. Structure & Organization (2 marks)
   - 2 marks: Has a clear beginning, middle, and end; ideas flow logically
   - 1 mark: Some structure is present, but flow is inconsistent
   - 0 marks: No clear structure, ideas feel scattered

3. Vocabulary & Expression (2 marks)
   - 2 marks: Uses varied and appropriate vocabulary; expressive and engaging
   - 1 mark: Simple or repetitive vocabulary, but gets the point across
   - 0 marks: Poor vocabulary or word choice that weakens the message

4. Grammar & Sentence Construction (2 marks)
   - 2 marks: No or very few grammatical mistakes; natural phrasing
   - 1 mark: Some grammar issues, but meaning remains clear
   - 0 marks: Many errors that affect understanding

5. Relevance & Content (2 marks)
   - 2 marks: Speech fully addresses the topic with meaningful ideas or examples
   - 1 mark: Partially addresses the topic or lacks depth
   - 0 marks: Off-topic or content is too shallow

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

IMPORTANT: Be encouraging and supportive in your feedback. Focus on what the speaker did well before suggesting improvements. Use a friendly, constructive tone throughout. Provide at least 3-5 suggested phrase improvements and ensure the corrected speech maintains the speaker's intended meaning while improving clarity and impact.`;

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