import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw } from "lucide-react";
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

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
      setAnalysisState("recording");
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAnalysisState("processing");
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Simulate processing delay
      setTimeout(() => {
        analyzeTranscript(transcript);
      }, 2000);
    }
  }, [isRecording, transcript]);

  const analyzeTranscript = (text: string) => {
    // Custom analysis algorithm
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Vocabulary analysis
    const uniqueWords = new Set(words);
    const vocabularyScore = Math.min(10, Math.round((uniqueWords.size / words.length) * 20));
    
    // Fluency analysis (words per sentence)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const fluencyScore = Math.round(Math.min(10, avgWordsPerSentence / 2));
    
    // Grammar analysis (simple heuristics)
    const grammarIssues = findGrammarIssues(text);
    const grammarScore = Math.max(1, Math.round(10 - (grammarIssues.length * 2)));
    
    // Clarity analysis (sentence length variety)
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const clarityScore = Math.round(Math.min(10, 8 + (sentenceLengths.length > 1 ? 2 : -2)));
    
    // Confidence analysis (use of filler words)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically'];
    const fillerCount = words.filter(word => fillerWords.includes(word)).length;
    const confidenceScore = Math.max(1, Math.round(10 - (fillerCount * 1.5)));
    
    const overall = Math.round((vocabularyScore + fluencyScore + grammarScore + clarityScore + confidenceScore) / 5);
    
    const result: SpeechAnalysisResult = {
      vocabulary: vocabularyScore,
      fluency: fluencyScore,
      confidence: confidenceScore,
      clarity: clarityScore,
      grammar: grammarScore,
      overall,
      transcript: text,
      feedback: {
        errors: grammarIssues,
        strengths: generateStrengths(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore),
        improvements: generateImprovements(vocabularyScore, fluencyScore, confidenceScore, clarityScore, grammarScore)
      }
    };
    
    setAnalysisResult(result);
    setAnalysisState("complete");
  };

  const findGrammarIssues = (text: string) => {
    const issues = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        // Check for capitalization
        if (trimmed[0] !== trimmed[0].toUpperCase()) {
          issues.push({
            text: trimmed.substring(0, 10) + "...",
            type: "grammar" as const,
            suggestion: "Sentences should start with a capital letter",
            position: [0, 10] as [number, number]
          });
        }
        
        // Check for double spaces
        if (trimmed.includes('  ')) {
          issues.push({
            text: "double spaces",
            type: "clarity" as const,
            suggestion: "Use single spaces between words",
            position: [0, 5] as [number, number]
          });
        }
      }
    });
    
    return issues.slice(0, 5); // Limit to 5 issues
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
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-neura rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                NEURA
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="neura-outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
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