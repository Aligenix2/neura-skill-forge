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

    const prompt = `You are a warm, encouraging speech coach who believes every student can improve. Your mission is to build confidence while providing helpful guidance. You should be generous with praise and gentle with suggestions.

STUDENT'S SPEECH TRANSCRIPT:
"${transcription}"

TOPIC: "${topic}"

SCORING PHILOSOPHY:
- Be GENEROUS and ENCOURAGING in your marking
- Typical scores should range from 6-9 out of 10 
- Only give low scores (under 6) if there are serious comprehension issues
- Minor mistakes like filler words, small grammar errors, or simple vocabulary are NORMAL in speech
- Focus on effort, communication, and content over perfection

MARKING CRITERIA (2 points each, total 10 points):

1. CLARITY (2 points)
   - 2 points: Generally clear and easy to follow (minor hesitations are normal!)
   - 1 point: Mostly understandable with some unclear moments
   - 0 points: Very difficult to understand throughout

2. STRUCTURE & ORGANIZATION (2 points)  
   - 2 points: Has some logical flow or basic organization (even simple structure counts!)
   - 1 point: Some attempt at structure but could flow better
   - 0 points: Very scattered with no clear organization

3. VOCABULARY & EXPRESSION (2 points)
   - 2 points: Uses appropriate vocabulary for the level (simple words are perfectly fine!)
   - 1 point: Basic vocabulary but gets the message across
   - 0 points: Very limited vocabulary that makes communication difficult

4. GRAMMAR & SENTENCE CONSTRUCTION (2 points)
   - 2 points: Generally correct grammar (small mistakes in speech are normal!)
   - 1 point: Some grammar issues but meaning is still clear
   - 0 points: Many errors that make understanding difficult

5. RELEVANCE & CONTENT (2 points)
   - 2 points: Addresses the topic adequately (basic coverage is great!)
   - 1 point: Somewhat relevant but could be more developed
   - 0 points: Clearly off-topic or extremely shallow

FEEDBACK TONE GUIDELINES:
- Start with genuine praise using phrases like "Great job on...", "I really liked how you...", "Well done with..."
- Be specific about what worked well
- Frame improvements as friendly suggestions, not criticisms
- Use encouraging language like "You might try...", "A small suggestion would be..."
- End on a positive, motivating note

TRANSCRIPTION CORRECTION GUIDELINES:
- AUTOMATICALLY detect and correct minor speech recognition errors (e.g., "my pinion" → "in my opinion", "crisphere" → "crisp air")
- Make MINIMAL changes that preserve the student's voice and meaning
- Only fix obvious transcription errors (missing articles, wrong verb tenses, filler words)
- Correct errors based on sentence context to determine what the speaker most likely meant
- DO NOT rewrite entire sentences or change the student's natural expression
- Keep their personality and style intact
- Focus on making the text grammatically correct while preserving the original meaning

Please respond with this EXACT JSON structure:

{
  "original_transcription": "${transcription}",
  "overall_score": [number from 6-10 for most speeches],
  "category_scores": {
    "clarity": {
      "score": [0-2],
      "explanation": "[encouraging explanation focusing on what worked well]"
    },
    "structure": {
      "score": [0-2], 
      "explanation": "[positive explanation highlighting good points]"
    },
    "vocabulary": {
      "score": [0-2],
      "explanation": "[supportive explanation about word choices]"
    },
    "grammar": {
      "score": [0-2],
      "explanation": "[gentle explanation acknowledging speech is different from writing]"
    },
    "relevance": {
      "score": [0-2],
      "explanation": "[positive explanation about topic coverage]"
    }
  },
  "positive_aspects": [
    "Great job on [specific thing they did well]",
    "I really liked how you [specific positive observation]", 
    "Well done with [another specific strength]"
  ],
  "areas_to_improve": [
    "You might try [gentle suggestion]",
    "A small suggestion would be to [kind improvement tip]",
    "Consider [friendly advice for enhancement]"
  ],
  "suggested_phrases": [
    {
      "original": "[exact phrase from transcript]",
      "suggested": "[minimally improved version]",
      "reason": "[brief, encouraging explanation]"
    }
  ],
  "corrected_speech": "[lightly edited version preserving the student's voice and meaning]"
}

REMEMBER: Your goal is to encourage and motivate, not to find fault. Be generous, kind, and focus on building confidence!`;

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
            content: 'You are an encouraging speech coach. Always respond with valid JSON in the exact format requested. Be generous with praise and gentle with feedback. Your goal is to build student confidence while providing helpful guidance.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 2500,
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
        original_transcription: transcription,
        overall_score: 7,
        category_scores: {
          clarity: { score: 1, explanation: "Generally clear communication." },
          structure: { score: 1, explanation: "Some organization present." },
          vocabulary: { score: 1, explanation: "Appropriate vocabulary used." },
          grammar: { score: 2, explanation: "Good grammar overall." },
          relevance: { score: 2, explanation: "Addresses the topic well." }
        },
        positive_aspects: ["Good effort in addressing the topic", "Clear communication overall"],
        areas_to_improve: ["Consider organizing ideas more clearly"],
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