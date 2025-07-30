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
  topicRelevance: number;
  transcript: string;
  feedback: {
    strengths: string[];
    improvements: string[];
    errors: Array<{
      type: 'grammar' | 'filler' | 'repetition' | 'clarity' | 'vocabulary' | 'fluency' | 'topic';
      text: string;
      suggestion: string;
      position: [number, number];
    }>;
  };
}

let grammarChecker: any = null;
let sentimentAnalyzer: any = null;
let semanticModel: any = null;

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
    if (!semanticModel) {
      semanticModel = await pipeline(
        'feature-extraction',
        'sentence-transformers/all-MiniLM-L6-v2',
        { device: 'webgpu' }
      );
    }
  } catch (error) {
    console.warn('Failed to initialize AI models, falling back to local analysis:', error);
  }
}

export async function analyzeTranscript(
  transcript: string, 
  audioBlob: Blob, 
  topic?: string, 
  mode?: 'opinion' | 'storytelling'
): Promise<SpeechAnalysisResult> {
  await initializeModels();
  
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  // Analyze different aspects
  const vocabularyScore = analyzeVocabulary(words);
  const fluencyScore = await analyzeFluency(transcript, sentences);
  const confidenceScore = await analyzeConfidence(transcript);
  const clarityScore = analyzeClarity(transcript, words);
  const grammarScore = await analyzeGrammar(sentences);
  
  // Analyze topic relevance if topic is provided
  const topicRelevanceScore = topic ? await analyzeTopicRelevance(transcript, topic, mode) : 10;
  
  // Detect errors (including topic-related errors)
  const errors = detectErrors(transcript, words, topic, mode);
  
  // Calculate balanced overall score (Speech Mechanics: 70%, Topic Relevance: 30%)
  const mechanicsScore = (vocabularyScore + fluencyScore + confidenceScore + clarityScore + grammarScore) / 5;
  const weightedScore = topic ? (mechanicsScore * 0.7) + (topicRelevanceScore * 0.3) : mechanicsScore;
  
  // Apply topic penalty: Users who completely ignore the topic are capped at 4/10
  const overall = topic && topicRelevanceScore < 3 ? 
    Math.min(4, Math.round(weightedScore)) : 
    Math.round(weightedScore);
  
  // Generate feedback
  const strengths = generateStrengths(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore, topicRelevanceScore);
  const improvements = generateImprovements(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore, topicRelevanceScore, errors);
  
  return {
    overall,
    vocabulary: vocabularyScore,
    fluency: fluencyScore,
    confidence: confidenceScore,
    clarity: clarityScore,
    grammar: grammarScore,
    topicRelevance: topicRelevanceScore,
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

async function analyzeTopicRelevance(transcript: string, topic: string, mode?: 'opinion' | 'storytelling'): Promise<number> {
  const transcriptLower = transcript.toLowerCase();
  const topicLower = topic.toLowerCase();
  
  // Extract key terms from topic
  const topicKeywords = extractTopicKeywords(topicLower);
  
  // Basic keyword matching
  const keywordMatches = topicKeywords.filter(keyword => 
    transcriptLower.includes(keyword.toLowerCase())
  ).length;
  const keywordRatio = topicKeywords.length > 0 ? keywordMatches / topicKeywords.length : 0;
  
  // Content depth analysis
  const contentDepth = analyzeContentDepth(transcript, topic, mode);
  
  // Try semantic similarity if model is available
  let semanticScore = 0;
  try {
    if (semanticModel) {
      const topicEmbedding = await semanticModel(topic);
      const transcriptEmbedding = await semanticModel(transcript);
      semanticScore = calculateCosineSimilarity(topicEmbedding.data, transcriptEmbedding.data);
    }
  } catch (error) {
    console.warn('Semantic analysis failed, using keyword-based analysis');
  }
  
  // Calculate final topic relevance score
  let score = 1;
  
  // 9-10: Excellent topic engagement with semantic understanding
  if (keywordRatio > 0.7 && contentDepth > 0.8 && semanticScore > 0.7) {
    score = 9 + Math.min(1, keywordRatio + semanticScore);
  }
  // 7-8: Good topic engagement with most key points covered
  else if (keywordRatio > 0.5 && contentDepth > 0.6) {
    score = 7 + (keywordRatio * 2);
  }
  // 5-6: Moderate topic engagement, some relevant content
  else if (keywordRatio > 0.3 && contentDepth > 0.4) {
    score = 5 + keywordRatio;
  }
  // 3-4: Minimal topic engagement, barely relevant
  else if (keywordRatio > 0.1 || contentDepth > 0.2) {
    score = 3 + (keywordRatio * 2);
  }
  // 1-2: No clear topic engagement
  
  return Math.round(Math.min(10, Math.max(1, score)));
}

function extractTopicKeywords(topic: string): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'than', 'vs', 'versus'];
  const words = topic.split(/\s+/).filter(word => 
    word.length > 2 && !commonWords.includes(word.toLowerCase())
  );
  
  // Add variations and synonyms for better matching
  const keywords = [...words];
  
  // Add seasonal variations if topic contains seasons
  if (topic.includes('winter')) keywords.push('cold', 'snow', 'ice', 'freezing');
  if (topic.includes('summer')) keywords.push('hot', 'warm', 'heat', 'sun', 'vacation');
  if (topic.includes('better')) keywords.push('prefer', 'superior', 'advantage', 'benefit');
  
  return keywords;
}

function analyzeContentDepth(transcript: string, topic: string, mode?: 'opinion' | 'storytelling'): number {
  const transcriptLength = transcript.split(/\s+/).length;
  
  // Check for mode-specific requirements
  let modeScore = 0.5; // Default neutral score
  
  if (mode === 'opinion') {
    // Look for opinion indicators
    const opinionMarkers = transcript.toLowerCase().match(/\b(i think|i believe|in my opinion|personally|i feel|i prefer|better|worse|should|would|agree|disagree)\b/g) || [];
    const argumentMarkers = transcript.toLowerCase().match(/\b(because|since|therefore|however|although|for example|such as|this shows|this proves)\b/g) || [];
    
    if (opinionMarkers.length > 0 && argumentMarkers.length > 0) modeScore = 1;
    else if (opinionMarkers.length > 0) modeScore = 0.7;
  } else if (mode === 'storytelling') {
    // Look for narrative elements
    const narrativeMarkers = transcript.toLowerCase().match(/\b(once|when|then|after|before|during|while|remember|happened|experience|story|time)\b/g) || [];
    const personalMarkers = transcript.toLowerCase().match(/\b(i|me|my|myself|we|us|our)\b/g) || [];
    
    if (narrativeMarkers.length > 2 && personalMarkers.length > 3) modeScore = 1;
    else if (narrativeMarkers.length > 0) modeScore = 0.7;
  }
  
  // Content length factor
  const lengthFactor = Math.min(1, transcriptLength / 100); // Expect at least 100 words for full credit
  
  return modeScore * lengthFactor;
}

function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function detectErrors(transcript: string, words: string[], topic?: string, mode?: 'opinion' | 'storytelling'): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // 1. ENHANCED GRAMMAR ERROR DETECTION
  errors.push(...detectGrammarErrors(transcript, sentences));
  
  // 2. ADVANCED VOCABULARY ANALYSIS  
  errors.push(...detectVocabularyErrors(transcript, words));
  
  // 3. SPEECH-SPECIFIC ERROR DETECTION
  errors.push(...detectSpeechErrors(transcript, words));
  
  // 4. FLUENCY AND CLARITY ERRORS
  errors.push(...detectFluencyErrors(transcript, words));
  
  // 5. TOPIC-SPECIFIC CONTENT ANALYSIS
  if (topic) {
    errors.push(...detectTopicErrors(transcript, topic, mode));
  }
  
  return errors;
}

// Enhanced Grammar Error Detection
function detectGrammarErrors(transcript: string, sentences: string[]): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  sentences.forEach((sentence, index) => {
    const sent = sentence.trim();
    if (sent.length < 5) return;
    
    const words = sent.split(/\s+/);
    const sentenceStart = transcript.indexOf(sent);
    
    // Subject-verb disagreement patterns
    const svDisagreements = [
      { pattern: /\b(I|you|we|they)\s+is\b/gi, suggestion: "Use 'are' with plural subjects (I/you/we/they)" },
      { pattern: /\b(he|she|it)\s+are\b/gi, suggestion: "Use 'is' with singular subjects (he/she/it)" },
      { pattern: /\b(they|we)\s+was\b/gi, suggestion: "Use 'were' with plural subjects" },
      { pattern: /\b(I|you)\s+was\b/gi, suggestion: "Use 'were' with 'you' and 'I' in past tense" }
    ];
    
    svDisagreements.forEach(({pattern, suggestion}) => {
      const matches = [...sent.matchAll(pattern)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          errors.push({
            type: 'grammar',
            text: match[0],
            suggestion: suggestion,
            position: [sentenceStart + match.index, sentenceStart + match.index + match[0].length]
          });
        }
      });
    });
    
    // Tense consistency issues
    const pastPresentMix = /\b(yesterday|last week|ago)\b.*\b(go|come|see|do|have)\b(?!\s+(to|been|done))/gi;
    if (pastPresentMix.test(sent)) {
      const match = pastPresentMix.exec(sent);
      if (match && match.index !== undefined) {
        errors.push({
          type: 'grammar',
          text: match[0],
          suggestion: "Use past tense verbs when referring to past events (went, came, saw, did, had)",
          position: [sentenceStart + match.index, sentenceStart + match.index + match[0].length]
        });
      }
    }
    
    // Article misuse
    const articleErrors = [
      { pattern: /\ba\s+[aeiou]/gi, suggestion: "Use 'an' before vowel sounds" },
      { pattern: /\ban\s+[bcdfghjklmnpqrstvwxyz]/gi, suggestion: "Use 'a' before consonant sounds" }
    ];
    
    articleErrors.forEach(({pattern, suggestion}) => {
      const matches = [...sent.matchAll(pattern)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          errors.push({
            type: 'grammar',
            text: match[0],
            suggestion: suggestion,
            position: [sentenceStart + match.index, sentenceStart + match.index + match[0].length]
          });
        }
      });
    });
    
    // Sentence fragments
    if (words.length < 3 && !sent.match(/^(yes|no|okay|right|sure|exactly)$/i)) {
      errors.push({
        type: 'grammar',
        text: sent,
        suggestion: "This appears to be a sentence fragment. Consider making it a complete sentence with subject and verb.",
        position: [sentenceStart, sentenceStart + sent.length]
      });
    }
    
    // Run-on sentences (extremely long)
    if (words.length > 40) {
      errors.push({
        type: 'grammar',
        text: sent.substring(0, 50) + "...",
        suggestion: "This sentence is very long. Consider breaking it into shorter, clearer sentences.",
        position: [sentenceStart, sentenceStart + sent.length]
      });
    }
  });
  
  return errors;
}

// Advanced Vocabulary Error Detection
function detectVocabularyErrors(transcript: string, words: string[]): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  // Weak vocabulary patterns
  const weakWords = [
    { word: 'good', alternatives: ['excellent', 'outstanding', 'remarkable', 'exceptional'] },
    { word: 'bad', alternatives: ['terrible', 'awful', 'disappointing', 'problematic'] },
    { word: 'nice', alternatives: ['pleasant', 'delightful', 'wonderful', 'appealing'] },
    { word: 'big', alternatives: ['enormous', 'massive', 'substantial', 'significant'] },
    { word: 'small', alternatives: ['tiny', 'minimal', 'compact', 'modest'] },
    { word: 'thing', alternatives: ['aspect', 'element', 'factor', 'component'] },
    { word: 'stuff', alternatives: ['items', 'materials', 'elements', 'matters'] },
    { word: 'a lot', alternatives: ['many', 'numerous', 'considerable', 'substantial'] }
  ];
  
  weakWords.forEach(({word, alternatives}) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = [...transcript.matchAll(regex)];
    if (matches.length > 2) { // Only flag if used multiple times
      matches.forEach((match, index) => {
        if (match.index !== undefined && index < 3) { // Limit to first 3 occurrences
          errors.push({
            type: 'vocabulary',
            text: match[0],
            suggestion: `Consider using more specific words like: ${alternatives.join(', ')}`,
            position: [match.index, match.index + match[0].length]
          });
        }
      });
    }
  });
  
  // Repetitive vocabulary
  const wordCounts: {[key: string]: number} = {};
  const wordPositions: {[key: string]: number[]} = {};
  
  words.forEach((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length > 3) { // Only check meaningful words
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      if (!wordPositions[cleanWord]) wordPositions[cleanWord] = [];
      wordPositions[cleanWord].push(index);
    }
  });
  
  Object.entries(wordCounts).forEach(([word, count]) => {
    if (count > 4 && word.length > 4) { // Significant repetition of meaningful words
      const firstPosition = transcript.toLowerCase().indexOf(word);
      if (firstPosition !== -1) {
        errors.push({
          type: 'vocabulary',
          text: word,
          suggestion: `You used "${word}" ${count} times. Try using synonyms to show vocabulary variety.`,
          position: [firstPosition, firstPosition + word.length]
        });
      }
    }
  });
  
  return errors;
}

// Speech-Specific Error Detection
function detectSpeechErrors(transcript: string, words: string[]): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  // Enhanced filler word detection with categories
  const fillerCategories = {
    hesitation: ['um', 'uh', 'er', 'ah', 'hmm'],
    verbal_crutches: ['like', 'you know', 'i mean', 'sort of', 'kind of'],
    discourse_markers: ['so', 'well', 'actually', 'basically', 'obviously', 'literally'],
    time_fillers: ['then', 'and then', 'after that', 'next thing']
  };
  
  Object.entries(fillerCategories).forEach(([category, fillers]) => {
    fillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = [...transcript.matchAll(regex)];
      
      if (matches.length > 3) { // Only flag excessive use
        matches.slice(0, 3).forEach(match => { // Limit to first 3 occurrences
          if (match.index !== undefined) {
            errors.push({
              type: 'fluency',
              text: match[0],
              suggestion: `Reduce ${category.replace('_', ' ')} words. Used "${filler}" ${matches.length} times. Practice pausing instead.`,
              position: [match.index, match.index + match[0].length]
            });
          }
        });
      }
    });
  });
  
  // Pronunciation issues (repeated characters)
  const pronunciationIssues = transcript.match(/\b\w*(.)\1{2,}\w*\b/g) || [];
  pronunciationIssues.forEach(issue => {
    const position = transcript.indexOf(issue);
    if (position !== -1) {
      errors.push({
        type: 'clarity',
        text: issue,
        suggestion: "This may indicate unclear pronunciation. Practice speaking clearly and at a steady pace.",
        position: [position, position + issue.length]
      });
    }
  });
  
  // Incomplete thoughts (trailing sentences)
  const incompletePatterns = [
    /\b(and|but|so|because)\s*\.{3,}$/gi,
    /\b(i was gonna|i wanted to|i think that)\s*\.{2,}$/gi
  ];
  
  incompletePatterns.forEach(pattern => {
    const matches = [...transcript.matchAll(pattern)];
    matches.forEach(match => {
      if (match.index !== undefined) {
        errors.push({
          type: 'fluency',
          text: match[0],
          suggestion: "Complete your thoughts. Avoid trailing off mid-sentence.",
          position: [match.index, match.index + match[0].length]
        });
      }
    });
  });
  
  return errors;
}

// Fluency and Clarity Error Detection
function detectFluencyErrors(transcript: string, words: string[]): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  // Excessive pauses (multiple spaces or repeated punctuation)
  const pausePatterns = transcript.match(/\s{3,}|\.{3,}|,{2,}/g) || [];
  pausePatterns.forEach(pattern => {
    const position = transcript.indexOf(pattern);
    if (position !== -1) {
      errors.push({
        type: 'fluency',
        text: pattern,
        suggestion: "Excessive pauses detected. Practice speaking with more natural rhythm and flow.",
        position: [position, position + pattern.length]
      });
    }
  });
  
  // False starts and self-corrections
  const falsestarts = transcript.match(/\b\w+\s+no\s+\w+|\b\w+\s+sorry\s+\w+|\b\w+\s+i mean\s+\w+/gi) || [];
  falsestarts.forEach(falsestart => {
    const position = transcript.indexOf(falsestart);
    if (position !== -1) {
      errors.push({
        type: 'fluency',
        text: falsestart,
        suggestion: "Self-corrections interrupt flow. Practice organizing thoughts before speaking.",
        position: [position, position + falsestart.length]
      });
    }
  });
  
  // Word fragments (very short "words")
  const fragments = words.filter(word => word.length === 1 && word.match(/[a-z]/i));
  if (fragments.length > 3) {
    errors.push({
      type: 'clarity',
      text: fragments.join(', '),
      suggestion: `Multiple word fragments detected (${fragments.length}). This may indicate unclear speech or poor audio quality.`,
      position: [0, transcript.length]
    });
  }
  
  return errors;
}

// Topic-Specific Error Detection
function detectTopicErrors(transcript: string, topic: string, mode?: 'opinion' | 'storytelling'): SpeechAnalysisResult['feedback']['errors'] {
  const errors: SpeechAnalysisResult['feedback']['errors'] = [];
  
  const topicKeywords = extractTopicKeywords(topic);
  const transcriptLower = transcript.toLowerCase();
  const mentionedKeywords = topicKeywords.filter(keyword => 
    transcriptLower.includes(keyword.toLowerCase())
  );
  
  // Insufficient topic coverage
  if (mentionedKeywords.length < topicKeywords.length * 0.3) {
    errors.push({
      type: 'topic',
      text: 'Insufficient topic coverage',
      suggestion: `Address more aspects of "${topic}". Key points to cover: ${topicKeywords.slice(0, 4).join(', ')}`,
      position: [0, transcript.length]
    });
  }
  
  // Mode-specific requirements
  if (mode === 'opinion') {
    const opinionMarkers = ['i think', 'i believe', 'in my opinion', 'i feel', 'personally', 'i prefer'];
    const hasOpinion = opinionMarkers.some(marker => transcriptLower.includes(marker));
    
    if (!hasOpinion) {
      errors.push({
        type: 'topic',
        text: 'Missing personal stance',
        suggestion: "For opinion topics, clearly state your personal viewpoint using phrases like 'I think', 'I believe', or 'In my opinion'",
        position: [0, transcript.length]
      });
    }
    
    // Check for supporting arguments
    const argumentMarkers = ['because', 'since', 'therefore', 'for example', 'first', 'second', 'finally'];
    const hasArguments = argumentMarkers.some(marker => transcriptLower.includes(marker));
    
    if (!hasArguments) {
      errors.push({
        type: 'topic',
        text: 'Lack of supporting arguments',
        suggestion: "Support your opinion with reasons or examples. Use words like 'because', 'for example', or 'first/second' to structure your arguments.",
        position: [0, transcript.length]
      });
    }
  }
  
  if (mode === 'storytelling') {
    const storyElements = ['when', 'where', 'then', 'after', 'before', 'suddenly', 'finally'];
    const hasNarrative = storyElements.some(element => transcriptLower.includes(element));
    
    if (!hasNarrative) {
      errors.push({
        type: 'topic',
        text: 'Missing narrative structure',
        suggestion: "For storytelling, include narrative elements like time indicators (when, then, after) and sequence words to create a clear story flow.",
        position: [0, transcript.length]
      });
    }
  }
  
  // Check for depth - very short responses
  const wordCount = transcript.split(/\s+/).length;
  if (wordCount < 50) {
    errors.push({
      type: 'topic',
      text: 'Response too brief',
      suggestion: `Your response is only ${wordCount} words. Provide more detail and explanation to fully address the topic.`,
      position: [0, transcript.length]
    });
  }
  
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

function generateStrengths(vocab: number, fluency: number, confidence: number, clarity: number, grammar: number, topicRelevance: number = 10): string[] {
  const strengths: string[] = [];
  
  if (vocab >= 8) strengths.push("Excellent vocabulary diversity and word choice");
  if (fluency >= 8) strengths.push("Very smooth and natural speech flow");
  if (confidence >= 8) strengths.push("Strong, confident delivery");
  if (clarity >= 8) strengths.push("Clear and articulate pronunciation");
  if (grammar >= 8) strengths.push("Proper grammar and sentence structure");
  if (topicRelevance >= 8) strengths.push("Excellent topic engagement and content relevance");
  
  if (strengths.length === 0) {
    if (Math.max(vocab, fluency, confidence, clarity, grammar) >= 6) {
      strengths.push("Good overall communication skills");
    } else {
      strengths.push("Shows potential for improvement");
    }
  }
  
  return strengths;
}

function generateImprovements(vocab: number, fluency: number, confidence: number, clarity: number, grammar: number, topicRelevance: number = 10, errors: any[]): string[] {
  const improvements: string[] = [];
  
  if (vocab < 6) improvements.push("Expand vocabulary with more varied word choices");
  if (fluency < 6) improvements.push("Reduce filler words and practice smoother delivery");
  if (confidence < 6) improvements.push("Use more assertive language and confident tone");
  if (clarity < 6) improvements.push("Focus on clearer pronunciation and articulation");
  if (grammar < 6) improvements.push("Review grammar rules and sentence construction");
  if (topicRelevance < 6) improvements.push("Stay more focused on the given topic and provide relevant examples");
  
  const fillerCount = errors.filter(e => e.type === 'filler').length;
  if (fillerCount > 3) improvements.push("Practice eliminating filler words like 'um' and 'uh'");
  
  const repetitionCount = errors.filter(e => e.type === 'repetition').length;
  if (repetitionCount > 2) improvements.push("Avoid unnecessary word repetition");
  
  const topicErrors = errors.filter(e => e.type === 'topic').length;
  if (topicErrors > 0) improvements.push("Address the given topic more directly with relevant content and examples");
  
  if (improvements.length === 0) {
    improvements.push("Continue practicing to maintain your strong speaking skills");
  }
  
  return improvements;
}