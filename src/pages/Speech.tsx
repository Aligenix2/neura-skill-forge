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
import { transcribeAudio, RealTimeTranscriber } from "@/lib/whisperTranscription";
import { supabase } from "@/integrations/supabase/client";

export interface SpeechAnalysisResult {
  original_transcription: string;
  overall_score: number;
  category_scores: {
    clarity: { score: number; explanation: string };
    structure: { score: number; explanation: string };
    vocabulary: { score: number; explanation: string };
    grammar: { score: number; explanation: string };
    relevance: { score: number; explanation: string };
  };
  positive_aspects: string[];
  areas_to_improve: string[];
  suggested_phrases: Array<{
    original: string;
    suggested: string;
    reason: string;
  }>;
  corrected_speech: string;
}
export type SpeechMode = "storytelling" | "opinion" | null;
export type AnalysisState = "idle" | "recording" | "processing" | "complete";
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
  const {
    toast
  } = useToast();
  const startRecording = useCallback(async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav'
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      // Initialize enhanced real-time speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Enhanced configuration for better accuracy and continuity
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
        
        let finalTranscript = '';
        let restartAttempts = 0;
        const maxRestartAttempts = 10;
        
        recognition.onstart = () => {
          console.log("Enhanced speech recognition started");
          restartAttempts = 0; // Reset on successful start
        };
        
        recognition.onresult = (event: any) => {
          console.log("Speech recognition result received");
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            
            // Use the most confident alternative
            let bestTranscript = result[0].transcript;
            let bestConfidence = result[0].confidence || 0;
            
            // Check alternative transcriptions for higher confidence
            for (let j = 1; j < result.length; j++) {
              if (result[j].confidence > bestConfidence) {
                bestTranscript = result[j].transcript;
                bestConfidence = result[j].confidence;
              }
            }
            
            if (result.isFinal) {
              finalTranscript += bestTranscript + ' ';
              console.log("Final transcript piece:", bestTranscript);
            } else {
              interimTranscript += bestTranscript;
            }
          }

          // Update transcript state with both final and interim results
          const currentTranscript = finalTranscript + interimTranscript;
          setTranscript(currentTranscript);
          console.log("Updated transcript:", currentTranscript);
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          
          // Handle different types of errors
          if (event.error === 'not-allowed') {
            toast({
              title: "Microphone Permission Denied",
              description: "Please allow microphone access and try again.",
              variant: "destructive"
            });
            return;
          }
          
          // Only show critical errors to user
          if (!['network', 'no-speech', 'aborted', 'audio-capture'].includes(event.error)) {
            toast({
              title: "Speech Recognition Error",
              description: `Error: ${event.error}. Attempting to continue...`,
              variant: "destructive"
            });
          }
          
          // Auto-restart for recoverable errors
          if (isRecording && restartAttempts < maxRestartAttempts) {
            const restartDelay = Math.min(1000 * Math.pow(2, restartAttempts), 5000); // Exponential backoff
            console.log(`Restarting speech recognition in ${restartDelay}ms (attempt ${restartAttempts + 1})`);
            
            setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                try {
                  restartAttempts++;
                  recognitionRef.current.start();
                } catch (restartError) {
                  console.log("Could not restart recognition:", restartError);
                }
              }
            }, restartDelay);
          }
        };
        
        recognition.onend = () => {
          console.log("Speech recognition ended");
          
          // Auto-restart if still recording
          if (isRecording && restartAttempts < maxRestartAttempts) {
            console.log("Auto-restarting speech recognition for continuity...");
            setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                try {
                  recognitionRef.current.start();
                } catch (restartError) {
                  console.log("Could not restart recognition:", restartError);
                }
              }
            }, 250); // Minimal delay for seamless continuation
          } else if (!isRecording) {
            console.log("Recording stopped, final transcript:", finalTranscript);
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn("Speech recognition not supported");
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
          variant: "destructive"
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
        variant: "destructive"
      });
    }
  }, [toast, isRecording]);
  const stopRecording = useCallback(async () => {
    console.log("Stopping recording...");
    if (mediaRecorderRef.current && isRecording) {
      // First stop the speech recognition to prevent auto-restart
      setIsRecording(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null; // Clear reference to prevent restart
      }
      
      // Then stop the media recorder
      mediaRecorderRef.current.stop();
      setAnalysisState("processing");

      // Wait for audio processing and enhanced transcription
      setTimeout(async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Use enhanced transcription with Whisper.js
          let finalTranscript = transcript.trim();
          if (finalTranscript.length < 10) {
            console.log("Using Whisper.js for better transcription...");
            finalTranscript = await transcribeAudio(audioBlob);
          }
          
          console.log("Final transcript for analysis:", finalTranscript);
          if (finalTranscript.length < 10) {
            toast({
              title: "No speech detected",
              description: "Please try recording again and speak more clearly. Make sure your microphone is working.",
              variant: "destructive"
            });
            setAnalysisState("idle");
            return;
          }
          
          // Use Supabase Edge Function for AI-powered analysis
          const { data: result, error } = await supabase.functions.invoke('analyze-speech', {
            body: { 
              transcription: finalTranscript, 
              topic: selectedTopic 
            }
          });
          
          if (error) {
            console.error("Edge function error:", error);
            throw new Error(error.message || "Failed to analyze speech");
          }
          
          setAnalysisResult(result);
          setAnalysisState("complete");
          
        } catch (error) {
          console.error("Analysis failed:", error);
          toast({
            title: "Analysis Error",
            description: "Failed to analyze speech. Please try again.",
            variant: "destructive"
          });
          setAnalysisState("idle");
        }
      }, 1000);
    }
  }, [isRecording, transcript, toast]);
  const resetAnalysis = () => {
    setMode(null);
    setSelectedTopic("");
    setAnalysisState("idle");
    setAnalysisResult(null);
    setIsRecording(false);
    setAudioUrl("");
    setTranscript("");
  };
  return <div className="min-h-screen bg-gradient-neura-secondary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-neura rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                NEURA
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 pt-24">
        

        {analysisState === "idle" && !mode && <SpeechModeSelection onModeSelect={setMode} />}

        {mode && !selectedTopic && analysisState === "idle" && <TopicSelection mode={mode} onTopicSelect={setSelectedTopic} onBack={() => setMode(null)} />}

        {selectedTopic && (analysisState === "idle" || analysisState === "recording") && <SpeechRecording topic={selectedTopic} mode={mode!} isRecording={isRecording} onStartRecording={startRecording} onStopRecording={stopRecording} onBack={() => setSelectedTopic("")} />}

        {analysisState === "processing" && <Card className="max-w-2xl mx-auto bg-black/40 border-neura-cyan/30">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-neura-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Speech</h3>
              <p className="text-muted-foreground">Our AI is processing your recording...</p>
            </CardContent>
          </Card>}

        {analysisState === "complete" && analysisResult && <>
            <SpeechAnalysis result={analysisResult} audioUrl={audioUrl} />
            <div className="text-center mt-8">
              <Button onClick={resetAnalysis} variant="neura" size="lg">
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </>}
      </div>
    </div>;
};
export default Speech;