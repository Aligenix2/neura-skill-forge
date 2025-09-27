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
    const { transcription, topic, wordCount, durationSeconds, pauseStats } = await req.json();

    if (!transcription || !topic) {
      return new Response(JSON.stringify({ error: 'Transcription and topic are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate WPM if duration is provided
    const wordsPerMinute = wordCount && durationSeconds ? Math.round((wordCount / durationSeconds) * 60) : null;

    console.log('Analyzing speech for topic:', topic);
    console.log('Transcription length:', transcription.length);
    console.log('Calculated WPM:', wordsPerMinute);

    const prompt = `You are a speech coach analyzing a high school student's public speaking performance. 
You are given:
- Transcript of their speech
- Word count: ${wordCount || 'Not provided'}
- Duration in seconds: ${durationSeconds || 'Not provided'}
- Calculated Words Per Minute (WPM): ${wordsPerMinute || 'Not calculated'}
- Pause statistics: ${pauseStats ? JSON.stringify(pauseStats) : 'Not provided'}

STUDENT'S SPEECH TRANSCRIPT:
"${transcription}"

TOPIC ASSIGNED: "${topic}"

CRITICAL PACING ANALYSIS INSTRUCTIONS:

1. Calculate the student's average words per minute (WPM): ${wordsPerMinute || 'Not available'}

2. Classify pacing into ONE of these categories based on WPM:
   * Very Slow (below 100 WPM)
   * Slightly Slow (100–120 WPM) 
   * Ideal/Engaging Pace (120–160 WPM)
   * Slightly Fast (160–180 WPM)
   * Very Fast (above 180 WPM)

3. DO NOT show raw WPM numbers to the student. Report the category and explain in simple, student-friendly language.

4. Provide specific feedback based on pacing category:
   - Very Slow: Encourage more energy, practice reading aloud faster, add variety to avoid monotony
   - Slightly Slow: Praise clarity, suggest practicing at quicker pace for liveliness
   - Ideal/Engaging Pace: Praise them, highlight how it keeps audience engaged
   - Slightly Fast: Encourage more pauses, practice deep breaths, slow at key points
   - Very Fast: Explain audience may miss words, suggest deliberate pauses, stress important words

5. Keep tone encouraging, supportive, and easy to understand (avoid technical terms like WPM).

ANALYSIS REQUIREMENTS:

🔍 1. SPEECH UNDERSTANDING & CONTEXT
- Analyze if the student addressed the given topic
- Determine if the response is complete, incomplete, or irrelevant
- Consider the depth and relevance of content provided

🧠 2. AUTOMATIC TRANSCRIPTION CORRECTION
- Auto-correct obvious speech recognition errors (e.g., "my pinion" → "in my opinion")
- Fix minimal grammar issues, add punctuation, and correct obvious misrecognitions
- Preserve the student's original intent, voice, and natural speaking style
- DO NOT rewrite entire phrases or change the core meaning

Please respond with this EXACT JSON structure:

{
  "content_score": [1-10],
  "clarity_score": [1-10],
  "delivery_score": [1-10],
  "pacing_score": [1-10],
  "pacing_category": "[One of: Very Slow, Slightly Slow, Ideal/Engaging Pace, Slightly Fast, Very Fast]",
  "pacing_evidence": "[Student-friendly explanation of their pacing category, NO raw WPM numbers]",
  "pacing_advice": "[Specific improvement tips based on pacing category, encouraging tone]",
  "overall_comment": "Encouraging summary combining all factors.",
  "original_transcription": "${transcription}",
  "positive_aspects": [
    "Nice job with [specific strength]",
    "Well expressed when you said [specific example]", 
    "I liked how you [specific positive observation]"
  ],
  "areas_to_improve": [
    "[Constructive suggestion for improvement]",
    "[Specific advice for enhancement]",
    "[Actionable tip for better performance]"
  ],
  "suggested_phrases": [
    {
      "original": "[exact phrase from transcript]",
      "suggested": "[improved version]",
      "reason": "[brief explanation of improvement]"
    }
  ],
  "corrected_speech": "[properly punctuated and lightly corrected version preserving student's voice and meaning]"
}

Remember: Be encouraging, specific, and constructive. Focus on building confidence while providing helpful guidance for improvement.`;

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
            content: 'You are an encouraging speech coach who provides detailed, constructive analysis. Always respond with valid JSON in the exact format requested. Be specific, balanced, and motivating in your feedback. Ensure the overall score equals the sum of category scores.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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
    let analysisResult: any;
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedResponse = analysisText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      analysisResult = JSON.parse(cleanedResponse);
      
      // Validate score ranges (1-10)
      const scores = ['content_score', 'clarity_score', 'delivery_score', 'pacing_score'];
      scores.forEach(scoreKey => {
        if (analysisResult[scoreKey] < 1) analysisResult[scoreKey] = 1;
        if (analysisResult[scoreKey] > 10) analysisResult[scoreKey] = 10;
      });
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response was:', analysisText);
      // Fallback response if JSON parsing fails
      analysisResult = {
        content_score: 5,
        clarity_score: 5,
        delivery_score: 5,
        pacing_score: 5,
        pacing_evidence: wordsPerMinute ? `Student spoke at ${wordsPerMinute} WPM.` : "Pacing could not be calculated.",
        pacing_advice: "Focus on maintaining a steady, comfortable pace when speaking.",
        overall_comment: "You made a good effort with your speech. Keep practicing to build confidence and improve your delivery.",
        original_transcription: transcription,
        positive_aspects: ["You made an effort to speak", "Your pronunciation was clear"],
        areas_to_improve: ["Try to develop your ideas more fully", "Consider organizing your thoughts before speaking"],
        suggested_phrases: [],
        corrected_speech: transcription
      };
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-speech function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze speech',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});