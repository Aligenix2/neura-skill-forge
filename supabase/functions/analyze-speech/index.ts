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
    const { transcription, topic, wordCount, durationSeconds, pauseStats, mode } = await req.json();

    if (!transcription || !topic) {
      return new Response(JSON.stringify({ error: 'Transcription and topic are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const trainingMode = mode || "debate"; // Default to debate if not specified

    // Calculate WPM if duration is provided
    const wordsPerMinute = wordCount && durationSeconds ? Math.round((wordCount / durationSeconds) * 60) : null;

    console.log('Analyzing speech for topic:', topic);
    console.log('Training mode:', trainingMode);
    console.log('Transcription length:', transcription.length);
    console.log('Calculated WPM:', wordsPerMinute);

    // Create mode-specific prompt
    let modeInstructions = '';
    
    if (trainingMode === 'debate') {
      modeInstructions = `
🧠 MODE: DEBATE (Parliamentary Style)

You are analyzing a parliamentary debate opening argument. The motion is: "${topic}"

Evaluate the student on:
1. **Argument Structure (1-10)**: Clear introduction, main points, logical flow, strong conclusion
2. **Logic & Coherence (1-10)**: Sound reasoning, evidence quality, argument connections
3. **Persuasiveness (1-10)**: Compelling delivery, emotional appeal, convincing points
4. **Pacing & Tone (1-10)**: Speaking speed, pauses, vocal variety, confidence

Provide:
- **Strengths**: 2-3 specific strong points from the speech
- **Improvements**: 2-3 actionable suggestions
- **Final Comment**: 1-2 encouraging sentences

Use simple, student-friendly language (ages 12-18). End positively.
`;
    } else if (trainingMode === 'interview') {
      modeInstructions = `
💼 MODE: INTERVIEW

You are analyzing an interview response. The question was: "${topic}"

Evaluate the student on:
1. **Content Depth (1-10)**: Thorough answer, relevant examples, clear reasoning
2. **Confidence & Delivery (1-10)**: Self-assured tone, minimal hesitation, strong presence
3. **Structure & Clarity (1-10)**: Organized response, clear communication, easy to follow
4. **Pacing & Tone (1-10)**: Speaking speed, pauses, warmth, professionalism

Provide:
- **Highlights**: Key strong points in their answer
- **Improvements**: Specific phrasing suggestions, body language tips, emotional tone advice
- **Encouragement**: Short motivational note ending positively

Guide them to sound more natural - remind them to smile, think before answering, humanize responses.
Use simple language (ages 12-18).
`;
    } else { // mun
      modeInstructions = `
🏛️ MODE: MODEL UN

You are analyzing a Model UN opening statement. The assignment is: "${topic}"

Extract the committee, country, and topic from the assignment format "Committee: X | Country: Y | Topic: Z"

Evaluate the student on:
1. **Diplomatic Tone (1-10)**: Formal language, respectful, representative of country
2. **Stance Alignment (1-10)**: Does the speech align with the country's actual diplomatic position on this issue? Research the country's real stance and evaluate accuracy
3. **Clarity of Stance (1-10)**: Clear position, specific policies mentioned, unambiguous
4. **Policy Understanding (1-10)**: Knowledge of issue, realistic solutions, country alignment
5. **Pacing & Delivery (1-10)**: Speaking speed, pauses, authority, professionalism

**CRITICAL FOR STANCE EVALUATION:**
- Research the country's actual position on the topic
- Score 8-10: Speech accurately reflects country's real diplomatic stance with specific policies
- Score 5-7: Generally aligned but missing key country-specific positions
- Score 1-4: Contradicts or doesn't reflect country's actual stance

Provide:
- **stance_feedback**: Detailed explanation of how well they represented their country's actual position
- **Strengths**: Effective diplomatic language and representation
- **Improvements**: Clarity and persuasiveness suggestions
- **Suggested Lines/Phrases**: Realistic MUN-style policy examples that align with the country's actual stance

Use simple language (ages 12-18). End with encouragement.
`;

    const prompt = `You are an encouraging speech coach analyzing a student's public speaking performance (ages 12-18).

${modeInstructions}

STUDENT'S SPEECH TRANSCRIPT:
"${transcription}"

SPEECH METRICS:
- Word count: ${wordCount || 'Not provided'}
- Duration: ${durationSeconds || 'Not provided'} seconds
- Calculated WPM: ${wordsPerMinute || 'Not calculated'}

PACING ANALYSIS:
- Classify pace: Very Slow (<100 WPM), Slightly Slow (100-120), Ideal (120-160), Slightly Fast (160-180), Very Fast (>180)
- DO NOT show raw WPM to students
- Use encouraging, simple language
- Provide specific tips based on their pace category

TRANSCRIPTION CORRECTION:
- Auto-correct obvious speech recognition errors
- Fix grammar, add punctuation
- Preserve student's voice and meaning
- Do NOT rewrite entire phrases

Respond with this EXACT JSON structure (ALL fields required):

{
  "mode": "${trainingMode}",
  "content_score": [1-10],
  "clarity_score": [1-10],
  "delivery_score": [1-10],
  "pacing_score": [1-10],
  "stance_score": [1-10 for MUN mode, null for debate/interview],
  "stance_feedback": "[REQUIRED for MUN: Detailed country stance alignment analysis. null for debate/interview]",
  "pacing_category": "[Very Slow/Slightly Slow/Ideal/Slightly Fast/Very Fast]",
  "pacing_evidence": "[Student-friendly pacing explanation, NO raw WPM]",
  "pacing_advice": "[Specific tips based on pace]",
  "overall_comment": "[Encouraging 1-2 sentence summary]",
  "original_transcription": "${transcription}",
  "positive_aspects": [
    "[Specific strength 1]",
    "[Specific strength 2]",
    "[Specific strength 3]"
  ],
  "areas_to_improve": [
    "[Actionable improvement 1]",
    "[Actionable improvement 2]",
    "[Actionable improvement 3]"
  ],
  "suggested_phrases": [
    {
      "original": "[phrase from transcript]",
      "suggested": "[improved version]",
      "reason": "[why it's better]"
    }
  ],
  "corrected_speech": "[corrected version preserving voice]",
  "recommendationLevel": "[Beginner/Intermediate/Advanced]"
}

CRITICAL: 
- For MUN mode: stance_score and stance_feedback are MANDATORY and must contain real analysis
- For debate/interview modes: Set stance_score to null and stance_feedback to null

Be encouraging, specific, constructive. Ages 12-18. End with motivation.`;

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