import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface SpeechAnalysisResult {
  overall: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
  transcript: string;
  feedback: {
    strengths: string[];
    improvements: string[];
    errors: Array<{
      type: 'grammar' | 'filler' | 'repetition' | 'clarity' | 'vocabulary' | 'fluency';
      text: string;
      suggestion: string;
      position: [number, number];
    }>;
  };
}

let grammarChecker: any = null;
let sentimentAnalyzer: any = null;

async function initializeModels() {
  try {
    if (!grammarChecker) {
      grammarChecker = await pipeline(
        'text-classification',
        'textattack/roberta-base-CoLA',
        { device: 'webgpu' }
      );
    }
    if (!sentimentAnalyzer) {
      sentimentAnalyzer = await pipeline(
        'sentiment-analysis',
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        { device: 'webgpu' }
      );
    }
  } catch (error) {
    console.warn('Failed to initialize AI models, falling back to local analysis:', error);
  }
}

export async function analyzeTranscript(transcript: string, audioBlob: Blob): Promise<SpeechAnalysisResult> {
  await initializeModels();
  
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  // Analyze different aspects
  const vocabularyScore = analyzeVocabulary(words);
  const fluencyScore = await analyzeFluency(transcript, sentences);
  const confidenceScore = await analyzeConfidence(transcript);
  const clarityScore = analyzeClarity(transcript, words);
  const grammarScore = await analyzeGrammar(sentences);
  
  // Detect errors
  const errors = detectErrors(transcript, words);
  
  // Generate feedback
  const strengths = generateStrengths(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore);
  const improvements = generateImprovements(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore, errors);
  
  const overall = Math.round((vocabularyScore + fluencyScore + confidenceScore + clarityScore + grammarScore) / 5);
  
  return {
    overall,
    vocabulary: vocabularyScore,
    fluency: fluencyScore,
    confidence: confidenceScore,
    clarity: clarityScore,
    grammar: grammarScore,
    transcript,
    feedback: {
      strengths,
      improvements,
      errors
    }
  };
}

function analyzeVocabulary(words: string[]): number {
  const uniqueWords = new Set(words);
  const vocabularyDiversity = uniqueWords.size / words.length;
  
  // Count sophisticated words (more than 6 characters)
  const sophisticatedWords = words.filter(word => word.length > 6).length;
  const sophisticationRatio = sophisticatedWords / words.length;
  
  // Combine metrics
  const score = Math.min(10, (vocabularyDiversity * 7) + (sophisticationRatio * 3));
  return Math.round(score);
}

async function analyzeFluency(transcript: string, sentences: string[]): Promise<number> {
  // Detect filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
  const fillerCount = fillerWords.reduce((count, filler) => {
    return count + (transcript.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length;
  }, 0);
  
  // Calculate speech rate (assume average speaking time)
  const wordCount = transcript.split(/\s+/).length;
  const estimatedDuration = wordCount / 2.5; // Average words per second
  const fillerRatio = fillerCount / wordCount;
  
  // Score based on fluency metrics
  const fluencyScore = Math.max(1, 10 - (fillerRatio * 30) - (sentences.length > 0 ? 0 : 2));
  return Math.round(Math.min(10, fluencyScore));
}

async function analyzeConfidence(transcript: string): Promise<number> {
  try {
    if (sentimentAnalyzer) {
      const sentiment = await sentimentAnalyzer(transcript);
      // Convert sentiment to confidence score
      const confidenceScore = sentiment[0].label === 'LABEL_2' ? 8 + (sentiment[0].score * 2) : 
                            sentiment[0].label === 'LABEL_1' ? 5 + (sentiment[0].score * 3) : 
                            2 + (sentiment[0].score * 3);
      return Math.round(Math.min(10, confidenceScore));
    }
  } catch (error) {
    console.warn('Sentiment analysis failed, using fallback');
  }
  
  // Fallback: analyze text patterns
  const confidenceIndicators = transcript.toLowerCase().match(/\b(i think|maybe|perhaps|possibly|i guess)\b/g) || [];
  const assertiveIndicators = transcript.toLowerCase().match(/\b(definitely|certainly|absolutely|clearly|obviously)\b/g) || [];
  
  const confidenceScore = 6 - (confidenceIndicators.length * 0.5) + (assertiveIndicators.length * 0.5);
  return Math.round(Math.max(1, Math.min(10, confidenceScore)));
}

function analyzeClarity(transcript: string, words: string[]): number {
  // Check for clear pronunciation indicators
  const unclearPatterns = transcript.match(/(.)\1{2,}/g) || []; // Repeated characters
  const wordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  const clarityScore = 8 - (unclearPatterns.length * 0.5) + (wordLength > 4 ? 1 : 0);
  return Math.round(Math.max(1, Math.min(10, clarityScore)));
}

async function analyzeGrammar(sentences: string[]): Promise<number> {
  try {
    if (grammarChecker && sentences.length > 0) {
      let totalScore = 0;
      let validSentences = 0;
      
      for (const sentence of sentences.slice(0, 5)) { // Limit to avoid quota issues
        if (sentence.trim().length > 5) {
          const result = await grammarChecker(sentence.trim());
          if (result && result[0]) {
            totalScore += result[0].label === 'ACCEPTABLE' ? 10 : 4;
            validSentences++;
          }
        }
      }
      
      if (validSentences > 0) {
        return Math.round(totalScore / validSentences);
      }
    }
  } catch (error) {
    console.warn('Grammar analysis failed, using fallback');
  }
  
  // Fallback: basic grammar checking
  const grammarIssues = sentences.reduce((issues, sentence) => {
    const sent = sentence.trim().toLowerCase();
    if (sent.length > 5) {
      // Basic checks
      if (!sent.match(/^[a-z]/)) issues += 0.5; // Should start with letter
      if (sent.split(' ').length < 3) issues += 0.5; // Too short
    }
    return issues;
  }, 0);
  
  const grammarScore = Math.max(1, 8 - (grammarIssues / sentences.length * 2));
  return Math.round(grammarScore);
}

function detectErrors(transcript: string, words: string[]): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  // Detect filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    let match;
    while ((match = regex.exec(transcript)) !== null) {
      errors.push({
        type: 'filler',
        text: match[0],
        suggestion: 'Consider pausing instead of using filler words',
        position: [match.index, match.index + match[0].length]
      });
    }
  });
  
  // Detect repetitions
  const repetitions = findRepetitions(words);
  repetitions.forEach(rep => {
    const index = transcript.toLowerCase().indexOf(rep.word);
    if (index !== -1) {
      errors.push({
        type: 'repetition',
        text: rep.word,
        suggestion: `Avoid repeating "${rep.word}" ${rep.count} times`,
        position: [index, index + rep.word.length]
      });
    }
  });
  
  return errors;
}

function findRepetitions(words: string[]): Array<{word: string, count: number}> {
  const wordCount: {[key: string]: number} = {};
  words.forEach(word => {
    if (word.length > 3) { // Only check significant words
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .filter(([_, count]) => count > 2)
    .map(([word, count]) => ({word, count}));
}

function generateStrengths(vocab: number, fluency: number, confidence: number, clarity: number, grammar: number): string[] {
  const strengths: string[] = [];
  
  if (vocab >= 8) strengths.push("Excellent vocabulary diversity and word choice");
  if (fluency >= 8) strengths.push("Very smooth and natural speech flow");
  if (confidence >= 8) strengths.push("Strong, confident delivery");
  if (clarity >= 8) strengths.push("Clear and articulate pronunciation");
  if (grammar >= 8) strengths.push("Proper grammar and sentence structure");
  
  if (strengths.length === 0) {
    if (Math.max(vocab, fluency, confidence, clarity, grammar) >= 6) {
      strengths.push("Good overall communication skills");
    } else {
      strengths.push("Shows potential for improvement");
    }
  }
  
  return strengths;
}

function generateImprovements(vocab: number, fluency: number, confidence: number, clarity: number, grammar: number, errors: any[]): string[] {
  const improvements: string[] = [];
  
  if (vocab < 6) improvements.push("Expand vocabulary with more varied word choices");
  if (fluency < 6) improvements.push("Reduce filler words and practice smoother delivery");
  if (confidence < 6) improvements.push("Use more assertive language and confident tone");
  if (clarity < 6) improvements.push("Focus on clearer pronunciation and articulation");
  if (grammar < 6) improvements.push("Review grammar rules and sentence construction");
  
  const fillerCount = errors.filter(e => e.type === 'filler').length;
  if (fillerCount > 3) improvements.push("Practice eliminating filler words like 'um' and 'uh'");
  
  const repetitionCount = errors.filter(e => e.type === 'repetition').length;
  if (repetitionCount > 2) improvements.push("Avoid unnecessary word repetition");
  
  if (improvements.length === 0) {
    improvements.push("Continue practicing to maintain your strong speaking skills");
  }
  
  return improvements;
}