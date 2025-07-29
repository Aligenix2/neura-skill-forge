import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SpeechModeSelection } from "@/components/speech/SpeechModeSelection";
import { TopicSelection } from "@/components/speech/TopicSelection";
import { SpeechRecording } from "@/components/speech/SpeechRecording";
import { SpeechAnalysis } from "@/components/speech/SpeechAnalysis";
import { useToast } from "@/hooks/use-toast";

export type SpeechMode = "storytelling" | "opinion" | null;
export type AnalysisState = "idle" | "recording" | "processing" | "complete";

export interface SpeechAnalysisResult {
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
  overall: number;
  transcript: string;
  feedback: {
    errors: Array<{
      text: string;
      type: "grammar" | "vocabulary" | "fluency" | "clarity";
      suggestion: string;
      position: [number, number];
    }>;
    strengths: string[];
    improvements: string[];
  };
}

const Speech = () => {
  const [mode, setMode] = useState<SpeechMode>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      // Initialize speech recognition with better browser support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onstart = () => {
          console.log("Speech recognition started");
        };

        recognition.onresult = (event: any) => {
          console.log("Speech recognition result:", event);
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log("Transcript piece:", transcript, "isFinal:", event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update transcript state with both final and interim results
          setTranscript(finalTranscript + interimTranscript);
          console.log("Current transcript:", finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          console.log("Final transcript:", finalTranscript);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn("Speech recognition not supported");
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
          variant: "destructive",
        });
      }

      mediaRecorder.start();
      setIsRecording(true);
      setAnalysisState("recording");
      setTranscript(""); // Clear previous transcript
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");
    console.log("Current transcript before stop:", transcript);
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAnalysisState("processing");
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Give a small delay to ensure final transcript is captured
      setTimeout(() => {
        const finalTranscript = transcript.trim();
        console.log("Final transcript for analysis:", finalTranscript);
        
        if (finalTranscript.length === 0) {
          toast({
            title: "No speech detected",
            description: "Please try recording again and speak more clearly. Make sure your microphone is working.",
            variant: "destructive",
          });
          setAnalysisState("idle");
          return;
        }
        
        analyzeTranscript(finalTranscript);
      }, 1000);
    }
  }, [isRecording, transcript, toast]);

  const analyzeTranscript = (text: string) => {
    console.log("Analyzing transcript:", text);
    console.log("Transcript length:", text.length);
    
    if (!text || text.trim().length === 0) {
      console.log("Empty transcript detected");
      toast({
        title: "No speech detected",
        description: "We couldn't detect any speech. Please ensure your microphone is working and try speaking more clearly.",
        variant: "destructive",
      });
      setAnalysisState("idle");
      return;
    }

    if (text.trim().length < 10) {
      toast({
        title: "Speech too short",
        description: "Please speak for at least a few sentences to get meaningful analysis.",
        variant: "destructive",
      });
      setAnalysisState("idle");
      return;
    }

    // Enhanced analysis algorithm
    const cleanText = text.trim();
    const words = cleanText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Vocabulary Analysis (0-10)
    const vocabularyScore = analyzeVocabulary(words);
    
    // Fluency Analysis (0-10)
    const fluencyScore = analyzeFluency(words, sentences, cleanText);
    
    // Confidence Analysis (0-10)
    const confidenceScore = analyzeConfidence(words, cleanText);
    
    // Clarity Analysis (0-10)
    const clarityScore = analyzeClarity(cleanText, sentences);
    
    // Grammar Analysis (0-10)
    const { grammarScore, grammarErrors } = analyzeGrammar(cleanText);
    
    const overall = Math.round((vocabularyScore + fluencyScore + confidenceScore + clarityScore + grammarScore) / 5);
    
    const result: SpeechAnalysisResult = {
      vocabulary: vocabularyScore,
      fluency: fluencyScore,
      confidence: confidenceScore,
      clarity: clarityScore,
      grammar: grammarScore,
      overall,
      transcript: cleanText,
      feedback: {
        errors: grammarErrors,
        strengths: generateStrengths(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore),
        improvements: generateImprovements(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore)
      }
    };
    
    setAnalysisResult(result);
    setAnalysisState("complete");
  };

  const analyzeVocabulary = (words: string[]) => {
    const uniqueWords = new Set(words);
    const totalWords = words.length;
    
    // Advanced vocabulary metrics
    const complexWords = words.filter(word => word.length > 6).length;
    const commonWords = words.filter(word => ['the', 'and', 'but', 'or', 'so', 'yet', 'for', 'nor', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'is', 'are', 'was', 'were'].includes(word)).length;
    
    const lexicalDiversity = uniqueWords.size / totalWords;
    const complexityRatio = complexWords / totalWords;
    const simplicityPenalty = commonWords / totalWords;
    
    let score = 0;
    score += lexicalDiversity * 40; // 40% weight for diversity
    score += complexityRatio * 35; // 35% weight for complexity
    score += Math.max(0, (1 - simplicityPenalty)) * 25; // 25% weight for avoiding too many simple words
    
    return Math.round(Math.min(10, Math.max(1, score * 10)));
  };

  const analyzeFluency = (words: string[], sentences: string[], text: string) => {
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const pauseWords = words.filter(word => ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'literally'].includes(word)).length;
    const repetitions = findRepetitions(words);
    
    let score = 0;
    
    // Optimal words per sentence (12-18 is ideal)
    if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
      score += 4;
    } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
      score += 2;
    }
    
    // Penalize excessive pauses
    const pauseRatio = pauseWords / words.length;
    score += Math.max(0, 3 - (pauseRatio * 30));
    
    // Penalize repetitions
    score += Math.max(0, 3 - repetitions);
    
    return Math.round(Math.min(10, Math.max(1, score)));
  };

  const analyzeConfidence = (words: string[], text: string) => {
    const uncertaintyWords = words.filter(word => ['maybe', 'perhaps', 'probably', 'might', 'could', 'possibly', 'uncertain', 'unsure', 'think', 'guess'].includes(word)).length;
    const fillerWords = words.filter(word => ['um', 'uh', 'er', 'ah', 'like', 'you know'].includes(word)).length;
    const hedgingPhrases = (text.match(/I think|I guess|I suppose|kind of|sort of/gi) || []).length;
    
    let score = 10;
    
    // Penalize uncertainty markers
    score -= (uncertaintyWords / words.length) * 20;
    score -= (fillerWords / words.length) * 25;
    score -= hedgingPhrases * 0.5;
    
    // Reward confident language patterns
    const assertiveWords = words.filter(word => ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'undoubtedly'].includes(word)).length;
    score += (assertiveWords / words.length) * 15;
    
    return Math.round(Math.min(10, Math.max(1, score)));
  };

  const analyzeClarity = (text: string, sentences: string[]) => {
    let score = 10;
    
    // Check for run-on sentences (over 30 words)
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 30).length;
    score -= longSentences * 1.5;
    
    // Check for very short sentences (under 5 words)
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 5).length;
    score -= shortSentences * 0.5;
    
    // Check for unclear transitions
    const transitionWords = (text.match(/however|therefore|furthermore|moreover|consequently|meanwhile|nevertheless/gi) || []).length;
    score += Math.min(2, transitionWords * 0.5);
    
    // Penalize excessive comma splices
    const commaSplices = (text.match(/,\s*[a-z]/g) || []).length;
    score -= commaSplices * 0.2;
    
    return Math.round(Math.min(10, Math.max(1, score)));
  };

  const analyzeGrammar = (text: string) => {
    const errors = [];
    let score = 10;
    
    // Check capitalization at sentence start
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
        errors.push({
          text: trimmed.substring(0, Math.min(15, trimmed.length)) + "...",
          type: "grammar" as const,
          suggestion: "Sentences should start with a capital letter",
          position: [0, 15] as [number, number]
        });
        score -= 0.5;
      }
    });
    
    // Check subject-verb disagreement patterns
    const disagreementPatterns = [
      /\b(they|we|you)\s+(was)\b/gi,
      /\b(he|she|it)\s+(were)\b/gi,
      /\b(I)\s+(are|is)\b/gi
    ];
    
    disagreementPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          errors.push({
            text: match,
            type: "grammar" as const,
            suggestion: "Check subject-verb agreement",
            position: [0, match.length] as [number, number]
          });
          score -= 1;
        });
      }
    });
    
    // Check for double negatives
    const doubleNegatives = text.match(/\b(don't|doesn't|didn't|won't|can't|isn't|aren't|wasn't|weren't)\s+\w*\s+(no|nothing|nobody|never|none)\b/gi);
    if (doubleNegatives) {
      doubleNegatives.forEach(match => {
        errors.push({
          text: match,
          type: "grammar" as const,
          suggestion: "Avoid double negatives for clearer meaning",
          position: [0, match.length] as [number, number]
        });
        score -= 1;
      });
    }
    
    // Check for incomplete sentences
    const incompletePatterns = /\b(because|since|although|though|while|if)\s+[^.!?]*$/gi;
    const incompletes = text.match(incompletePatterns);
    if (incompletes) {
      incompletes.forEach(match => {
        errors.push({
          text: match.substring(0, 20) + "...",
          type: "grammar" as const,
          suggestion: "Complete the sentence with a main clause",
          position: [0, 20] as [number, number]
        });
        score -= 1.5;
      });
    }
    
    return {
      grammarScore: Math.round(Math.min(10, Math.max(1, score))),
      grammarErrors: errors.slice(0, 8) // Limit to most critical errors
    };
  };

  const findRepetitions = (words: string[]) => {
    const wordCounts = {};
    words.forEach(word => {
      if (word.length > 3) { // Only count significant words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    return Object.values(wordCounts).filter((count: number) => count > 2).length;
  };

  const generateStrengths = (vocab: number, fluency: number, confidence: number, clarity: number, grammar: number) => {
    const strengths = [];
    if (vocab >= 7) strengths.push("Rich vocabulary usage");
    if (fluency >= 7) strengths.push("Good speech fluency");
    if (confidence >= 7) strengths.push("Confident delivery");
    if (clarity >= 7) strengths.push("Clear articulation");
    if (grammar >= 7) strengths.push("Proper grammar usage");
    return strengths.length > 0 ? strengths : ["Keep practicing to improve your skills"];
  };

  const generateImprovements = (vocab: number, fluency: number, confidence: number, clarity: number, grammar: number) => {
    const improvements = [];
    if (vocab < 7) improvements.push("Try using more varied vocabulary");
    if (fluency < 7) improvements.push("Practice speaking in longer, complete sentences");
    if (confidence < 7) improvements.push("Reduce filler words like 'um' and 'uh'");
    if (clarity < 7) improvements.push("Speak more slowly and clearly");
    if (grammar < 7) improvements.push("Review basic grammar rules");
    return improvements;
  };

  const resetAnalysis = () => {
    setMode(null);
    setSelectedTopic("");
    setAnalysisState("idle");
    setAnalysisResult(null);
    setIsRecording(false);
    setAudioUrl("");
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-gradient-neura-secondary">
      {/* Header */}
      <div className="bg-gradient-to-r from-black/90 to-black/70 backdrop-blur-lg border-b border-neura-cyan/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-neura rounded-xl flex items-center justify-center shadow-neura-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                NEURA
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="neura-outline" size="lg" className="hover:shadow-neura-glow transition-all">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-neura bg-clip-text text-transparent mb-4">
            Speech Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Improve your speaking skills with AI-powered analysis and feedback
          </p>
        </div>

        {analysisState === "idle" && !mode && (
          <SpeechModeSelection onModeSelect={setMode} />
        )}

        {mode && !selectedTopic && analysisState === "idle" && (
          <TopicSelection mode={mode} onTopicSelect={setSelectedTopic} onBack={() => setMode(null)} />
        )}

        {selectedTopic && (analysisState === "idle" || analysisState === "recording") && (
          <SpeechRecording
            topic={selectedTopic}
            mode={mode!}
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onBack={() => setSelectedTopic("")}
          />
        )}

        {analysisState === "processing" && (
          <Card className="max-w-2xl mx-auto bg-black/40 border-neura-cyan/30">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-neura-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Speech</h3>
              <p className="text-muted-foreground">Our AI is processing your recording...</p>
            </CardContent>
          </Card>
        )}

        {analysisState === "complete" && analysisResult && (
          <>
            <SpeechAnalysis result={analysisResult} audioUrl={audioUrl} />
            <div className="text-center mt-8">
              <Button onClick={resetAnalysis} variant="neura" size="lg">
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Speech;