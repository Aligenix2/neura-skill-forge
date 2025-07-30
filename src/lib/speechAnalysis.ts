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
  if (words.length < 10) return 1; // Too short to evaluate properly
  
  const uniqueWords = new Set(words);
  const vocabularyDiversity = uniqueWords.size / words.length;
  
  // Count sophisticated words (more than 6 characters)
  const sophisticatedWords = words.filter(word => word.length > 6).length;
  const sophisticationRatio = sophisticatedWords / words.length;
  
  // Count repeated words (indicator of limited vocabulary)
  const wordCounts: {[key: string]: number} = {};
  words.forEach(word => wordCounts[word] = (wordCounts[word] || 0) + 1);
  const repetitionRatio = Object.values(wordCounts).filter(count => count > 3).length / uniqueWords.size;
  
  // Stricter scoring based on marking scheme
  let score = 1;
  
  // 9-10: Rich vocabulary, excellent diversity
  if (vocabularyDiversity > 0.7 && sophisticationRatio > 0.3 && repetitionRatio < 0.1) {
    score = 9 + (vocabularyDiversity * sophisticationRatio);
  }
  // 7-8: Good vocabulary, moderate variety
  else if (vocabularyDiversity > 0.6 && sophisticationRatio > 0.2 && repetitionRatio < 0.2) {
    score = 7 + (vocabularyDiversity * 2);
  }
  // 5-6: Average vocabulary, some variety
  else if (vocabularyDiversity > 0.4 && sophisticationRatio > 0.1 && repetitionRatio < 0.3) {
    score = 5 + (vocabularyDiversity * 2);
  }
  // 3-4: Limited vocabulary, noticeable repetition
  else if (vocabularyDiversity > 0.25 && repetitionRatio < 0.5) {
    score = 3 + vocabularyDiversity;
  }
  // 1-2: Very poor vocabulary
  
  return Math.round(Math.min(10, Math.max(1, score)));
}

async function analyzeFluency(transcript: string, sentences: string[]): Promise<number> {
  if (transcript.length < 50) return 1; // Too short to evaluate
  
  // Detect filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically', 'sort of', 'kind of'];
  const fillerCount = fillerWords.reduce((count, filler) => {
    return count + (transcript.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length;
  }, 0);
  
  const wordCount = transcript.split(/\s+/).length;
  const fillerRatio = fillerCount / wordCount;
  
  // Detect excessive pauses (multiple spaces or repeated punctuation)
  const pausePatterns = transcript.match(/\s{3,}|\.{2,}|,{2,}/g) || [];
  const pauseRatio = pausePatterns.length / sentences.length;
  
  // Detect incomplete sentences or fragments
  const incompleteCount = sentences.filter(s => s.trim().split(' ').length < 3).length;
  const incompleteRatio = incompleteCount / sentences.length;
  
  let score = 1;
  
  // 9-10: Excellent fluency, minimal fillers, smooth delivery
  if (fillerRatio < 0.02 && pauseRatio < 0.1 && incompleteRatio < 0.1) {
    score = 9 + (1 - fillerRatio * 10);
  }
  // 7-8: Good fluency, minor issues
  else if (fillerRatio < 0.05 && pauseRatio < 0.2 && incompleteRatio < 0.2) {
    score = 7 + (1 - fillerRatio * 5);
  }
  // 5-6: Average fluency, some pauses and fillers
  else if (fillerRatio < 0.1 && pauseRatio < 0.3 && incompleteRatio < 0.3) {
    score = 5 + (1 - fillerRatio * 3);
  }
  // 3-4: Below average, noticeable issues
  else if (fillerRatio < 0.2 && pauseRatio < 0.5) {
    score = 3 + (1 - fillerRatio * 2);
  }
  // 1-2: Poor fluency
  
  return Math.round(Math.min(10, Math.max(1, score)));
}

async function analyzeConfidence(transcript: string): Promise<number> {
  if (transcript.length < 50) return 1;
  
  const words = transcript.split(/\s+/);
  
  // Detect uncertainty markers
  const uncertaintyMarkers = transcript.toLowerCase().match(/\b(i think|maybe|perhaps|possibly|i guess|i suppose|i believe|sort of|kind of|i'm not sure)\b/g) || [];
  const uncertaintyRatio = uncertaintyMarkers.length / words.length;
  
  // Detect confidence markers  
  const confidenceMarkers = transcript.toLowerCase().match(/\b(definitely|certainly|absolutely|clearly|obviously|without doubt|i'm confident|i know|surely)\b/g) || [];
  const confidenceRatio = confidenceMarkers.length / words.length;
  
  // Detect hesitation patterns
  const hesitationPatterns = transcript.toLowerCase().match(/\b(well|um|uh|er|ah|hmm)\b/g) || [];
  const hesitationRatio = hesitationPatterns.length / words.length;
  
  // Detect question tags (indicating uncertainty)
  const questionTags = transcript.match(/,?\s*(right|ok|you know)\?/gi) || [];
  const questionTagRatio = questionTags.length / words.length;
  
  let score = 1;
  
  try {
    if (sentimentAnalyzer) {
      const sentiment = await sentimentAnalyzer(transcript);
      const sentimentScore = sentiment[0].label === 'LABEL_2' ? sentiment[0].score : 
                           sentiment[0].label === 'LABEL_1' ? 0.5 : 
                           0.2;
      
      // 9-10: Very confident, assertive delivery
      if (confidenceRatio > 0.02 && uncertaintyRatio < 0.01 && hesitationRatio < 0.01 && sentimentScore > 0.8) {
        score = 9 + sentimentScore;
      }
      // 7-8: Confident, minor hesitation
      else if (confidenceRatio > 0.01 && uncertaintyRatio < 0.03 && hesitationRatio < 0.03 && sentimentScore > 0.6) {
        score = 7 + (sentimentScore * 2);
      }
      // 5-6: Moderate confidence
      else if (uncertaintyRatio < 0.05 && hesitationRatio < 0.05 && sentimentScore > 0.4) {
        score = 5 + sentimentScore;
      }
      // 3-4: Low confidence, noticeable uncertainty
      else if (uncertaintyRatio < 0.1 && hesitationRatio < 0.1) {
        score = 3 + (sentimentScore * 2);
      }
      // 1-2: Very low confidence
      
      return Math.round(Math.min(10, Math.max(1, score)));
    }
  } catch (error) {
    console.warn('Sentiment analysis failed, using fallback');
  }
  
  // Fallback without AI
  // 9-10: Strong confidence indicators, minimal uncertainty
  if (confidenceRatio > 0.02 && uncertaintyRatio < 0.01 && hesitationRatio < 0.01) {
    score = 9;
  }
  // 7-8: Good confidence, minor uncertainty
  else if (confidenceRatio > 0.01 && uncertaintyRatio < 0.03 && hesitationRatio < 0.03) {
    score = 7;
  }
  // 5-6: Moderate confidence
  else if (uncertaintyRatio < 0.05 && hesitationRatio < 0.05 && questionTagRatio < 0.02) {
    score = 5;
  }
  // 3-4: Low confidence
  else if (uncertaintyRatio < 0.1 && hesitationRatio < 0.1) {
    score = 3;
  }
  // 1-2: Very low confidence
  
  return Math.round(Math.min(10, Math.max(1, score)));
}

function analyzeClarity(transcript: string, words: string[]): number {
  if (transcript.length < 50) return 1;
  
  // Check for unclear pronunciation indicators
  const unclearPatterns = transcript.match(/(.)\1{2,}/g) || []; // Repeated characters
  const wordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Detect unclear speech patterns
  const fragmentedWords = words.filter(word => word.length < 2).length;
  const fragmentRatio = fragmentedWords / words.length;
  
  // Detect inconsistent capitalization or punctuation (sign of unclear transcription)
  const inconsistentCapitalization = transcript.match(/[a-z]\s+[A-Z][a-z]/g) || [];
  const capitalizationRatio = inconsistentCapitalization.length / words.length;
  
  let score = 1;
  
  // 9-10: Excellent clarity, no unclear patterns
  if (unclearPatterns.length === 0 && fragmentRatio < 0.02 && capitalizationRatio < 0.01 && wordLength > 4.5) {
    score = 9 + (wordLength / 10);
  }
  // 7-8: Good clarity, minor issues
  else if (unclearPatterns.length < 2 && fragmentRatio < 0.05 && capitalizationRatio < 0.03 && wordLength > 4) {
    score = 7 + (wordLength / 5);
  }
  // 5-6: Average clarity, some unclear patterns
  else if (unclearPatterns.length < 5 && fragmentRatio < 0.1 && capitalizationRatio < 0.05 && wordLength > 3.5) {
    score = 5 + (wordLength / 3);
  }
  // 3-4: Below average clarity
  else if (unclearPatterns.length < 8 && fragmentRatio < 0.2 && wordLength > 3) {
    score = 3 + (wordLength / 2);
  }
  // 1-2: Poor clarity
  
  return Math.round(Math.max(1, Math.min(10, score)));
}

async function analyzeGrammar(sentences: string[]): Promise<number> {
  if (sentences.length === 0) return 1;
  
  let score = 1;
  
  try {
    if (grammarChecker && sentences.length > 0) {
      let acceptableCount = 0;
      let totalChecked = 0;
      
      for (const sentence of sentences.slice(0, 5)) { // Limit to avoid quota issues
        if (sentence.trim().length > 5) {
          const result = await grammarChecker(sentence.trim());
          if (result && result[0]) {
            if (result[0].label === 'ACCEPTABLE') acceptableCount++;
            totalChecked++;
          }
        }
      }
      
      if (totalChecked > 0) {
        const acceptableRatio = acceptableCount / totalChecked;
        
        // 9-10: Excellent grammar, all or most sentences acceptable
        if (acceptableRatio >= 0.9) {
          score = 9 + acceptableRatio;
        }
        // 7-8: Good grammar, most sentences acceptable
        else if (acceptableRatio >= 0.7) {
          score = 7 + (acceptableRatio * 2);
        }
        // 5-6: Average grammar, some issues
        else if (acceptableRatio >= 0.5) {
          score = 5 + acceptableRatio;
        }
        // 3-4: Below average grammar, many issues
        else if (acceptableRatio >= 0.3) {
          score = 3 + acceptableRatio;
        }
        // 1-2: Poor grammar
        
        return Math.round(Math.min(10, Math.max(1, score)));
      }
    }
  } catch (error) {
    console.warn('Grammar analysis failed, using fallback');
  }
  
  // Fallback: stricter basic grammar checking
  const grammarIssues = sentences.reduce((issues, sentence) => {
    const sent = sentence.trim();
    if (sent.length > 5) {
      const words = sent.split(' ');
      
      // Check for basic structure issues
      if (!sent.match(/^[A-Z]/)) issues += 1; // Should start with capital
      if (!sent.match(/[.!?]$/)) issues += 0.5; // Should end with punctuation
      if (words.length < 3) issues += 1; // Too short to be a proper sentence
      if (sent.includes('  ')) issues += 0.5; // Double spaces indicate unclear speech
      
      // Check for common grammar patterns
      const grammarPatterns = [
        /\bi is\b/, // Subject-verb disagreement
        /\bthey is\b/,
        /\bwe was\b/,
        /\bgood\s+\w+ly\b/, // Adverb misuse
      ];
      
      grammarPatterns.forEach(pattern => {
        if (pattern.test(sent.toLowerCase())) issues += 1;
      });
    }
    return issues;
  }, 0);
  
  const issueRatio = grammarIssues / sentences.length;
  
  // 9-10: Minimal grammar issues
  if (issueRatio < 0.1) {
    score = 9;
  }
  // 7-8: Few grammar issues
  else if (issueRatio < 0.3) {
    score = 7;
  }
  // 5-6: Some grammar issues
  else if (issueRatio < 0.6) {
    score = 5;
  }
  // 3-4: Many grammar issues
  else if (issueRatio < 1) {
    score = 3;
  }
  // 1-2: Severe grammar issues
  
  return Math.round(Math.min(10, Math.max(1, score)));
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