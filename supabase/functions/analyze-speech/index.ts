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

    const prompt = `You are an encouraging speech coach analyzing a student's speech performance. Your goal is to provide constructive, balanced feedback that motivates students while helping them improve.

STUDENT'S SPEECH TRANSCRIPT:
"${transcription}"

TOPIC ASSIGNED: "${topic}"

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

✅ 3. MARKING SCHEME (10 POINTS TOTAL - 2 POINTS PER CATEGORY)

Score each category from 0-2 points:

A) CLARITY (2 points max)
- 2 points: Speech is clear and easy to understand
- 1 point: Mostly understandable with some unclear moments  
- 0 points: Difficult to understand throughout

B) STRUCTURE & ORGANIZATION (2 points max)
- 2 points: Well-organized with logical flow of ideas
- 1 point: Some structure present but could be improved
- 0 points: Lacks clear organization or structure

C) VOCABULARY & EXPRESSION (2 points max)
- 2 points: Uses appropriate and varied vocabulary effectively
- 1 point: Basic vocabulary that conveys the message adequately
- 0 points: Limited vocabulary that hinders communication

D) GRAMMAR & SENTENCE CONSTRUCTION (2 points max)
- 2 points: Generally correct grammar and well-formed sentences
- 1 point: Some grammar issues but meaning remains clear
- 0 points: Frequent errors that affect comprehension

E) RELEVANCE & CONTENT (2 points max)
- 2 points: Directly addresses the topic with relevant content
- 1 point: Somewhat relevant but could be more developed
- 0 points: Off-topic or extremely minimal content

💬 4. BALANCED FEEDBACK TONE
- Use encouraging language: "Nice job with...", "Well expressed when you said...", "I liked how you..."
- Provide specific, actionable improvement suggestions
- Be constructive, not critical
- Maintain a supportive, coach-like tone

🚨 5. EDGE CASE HANDLING
For very short, unclear, or off-topic responses:
- Assign appropriate low scores with clear reasoning
- Gently explain why the speech didn't contain enough analyzable content
- Encourage the student to try again with more detail
- Remain supportive and motivating

CRITICAL REQUIREMENT: The overall_score MUST equal the sum of all category scores.

Please respond with this EXACT JSON structure:

{
  "original_transcription": "${transcription}",
  "overall_score": [sum of all category scores],
  "category_scores": {
    "clarity": {
      "score": [0-2],
      "explanation": "[encouraging explanation of the score]"
    },
    "structure": {
      "score": [0-2], 
      "explanation": "[constructive explanation of the score]"
    },
    "vocabulary": {
      "score": [0-2],
      "explanation": "[supportive explanation of the score]"
    },
    "grammar": {
      "score": [0-2],
      "explanation": "[helpful explanation of the score]"
    },
    "relevance": {
      "score": [0-2],
      "explanation": "[encouraging explanation of topic coverage]"
    }
  },
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
      
      // Verify that overall_score equals sum of category scores
      const categorySum = 
        analysisResult.category_scores.clarity.score +
        analysisResult.category_scores.structure.score +
        analysisResult.category_scores.vocabulary.score +
        analysisResult.category_scores.grammar.score +
        analysisResult.category_scores.relevance.score;
      
      if (analysisResult.overall_score !== categorySum) {
        console.log('Correcting overall score to match category sum');
        analysisResult.overall_score = categorySum;
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response was:', analysisText);
      // Fallback response if JSON parsing fails
      analysisResult = {
        original_transcription: transcription,
        overall_score: 4,
        category_scores: {
          clarity: { score: 1, explanation: "The speech was mostly understandable." },
          structure: { score: 1, explanation: "Some organization was present in your speech." },
          vocabulary: { score: 1, explanation: "You used appropriate basic vocabulary." },
          grammar: { score: 1, explanation: "Grammar was generally acceptable with minor issues." },
          relevance: { score: 0, explanation: "The response could have addressed the topic more directly." }
        },
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
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});