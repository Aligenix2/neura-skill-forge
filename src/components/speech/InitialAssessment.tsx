import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Loader2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SpeechAnalysis } from "./SpeechAnalysis";

interface InitialAssessmentProps {
  open: boolean;
  onComplete: () => void;
}

export const InitialAssessment = ({ open, onComplete }: InitialAssessmentProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const MAX_TIME = 60;

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_TIME) {
            handleStopRecording();
            return MAX_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('analyze-diagnostic', {
          body: { 
            audio: base64Audio,
            prompt: "Why I want to improve my public speaking"
          }
        });

        if (error) throw error;

        // Update profile to mark assessment complete
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ has_completed_initial_assessment: true })
            .eq('user_id', user.id);
        }

        setAnalysisData(data);
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error('Error analyzing speech:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze your speech. Please try again.",
      });
      setIsAnalyzing(false);
    }
  };

  if (analysisData) {
    // Transform diagnostic data to match SpeechAnalysis expected structure
    const transformedResult = {
      mode: "diagnostic",
      content_score: analysisData.vocabulary_score || 7,
      clarity_score: analysisData.clarity_score || 7,
      delivery_score: analysisData.confidence_score || 7,
      pacing_score: analysisData.pacing_score || 7,
      pacing_category: "Moderate",
      pacing_evidence: analysisData.feedback?.pacing || "Your pacing was measured and appropriate.",
      pacing_advice: analysisData.feedback?.pacing || "Continue maintaining this pace.",
      overall_comment: analysisData.overall_recommendation || "",
      original_transcription: analysisData.transcription || "",
      positive_aspects: [
        analysisData.feedback?.clarity || "Your speech was clear and understandable.",
        analysisData.feedback?.tone_expression || "You showed good expression.",
        analysisData.feedback?.confidence || "You demonstrated confidence."
      ].filter(Boolean),
      areas_to_improve: [
        analysisData.feedback?.vocabulary || "Consider expanding your vocabulary range.",
        analysisData.recommended_mode ? `Try ${analysisData.recommended_mode} mode to continue improving.` : ""
      ].filter(Boolean),
      suggested_phrases: [],
      corrected_speech: analysisData.transcription || ""
    };

    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Initial Assessment Results</DialogTitle>
          </DialogHeader>
          <SpeechAnalysis 
            result={transformedResult}
            topic="Why I want to improve my public speaking"
            onRetry={() => {}}
          />
          <div className="flex justify-end mt-4">
            <Button onClick={onComplete} variant="neura" size="lg">
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lock className="w-5 h-5 text-neura-cyan" />
            Your Initial Skill Assessment
          </DialogTitle>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-neura-cyan" />
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold">Analyzing Core Metrics...</p>
              <p className="text-muted-foreground">This will take 15-20 seconds</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-neura-cyan/20">
              <CardHeader>
                <CardTitle className="text-lg">Recording Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-center py-4 bg-muted/50 rounded-lg">
                  "Why I want to improve my public speaking"
                </p>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-neura-cyan mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Privacy Note:</strong> Your recording is private and secure. 
                  It will only be used to assess your current speaking skills and provide personalized recommendations.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {!isRecording && !audioBlob && (
                <Button
                  onClick={handleStartRecording}
                  className="w-full h-16 text-lg"
                  variant="neura"
                  size="lg"
                >
                  <Mic className="w-6 h-6 mr-2" />
                  Start Recording (60 seconds)
                </Button>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-neura flex items-center justify-center animate-pulse">
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recording...</span>
                      <span className="font-mono">{formatTime(recordingTime)} / {formatTime(MAX_TIME)}</span>
                    </div>
                    <Progress value={(recordingTime / MAX_TIME) * 100} className="h-2" />
                  </div>

                  <Button
                    onClick={handleStopRecording}
                    className="w-full h-16 text-lg"
                    variant="destructive"
                    size="lg"
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}

              {!isRecording && audioBlob && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Recording complete!</p>
                    <p className="font-medium">Duration: {formatTime(recordingTime)}</p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        setAudioBlob(null);
                        setRecordingTime(0);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Re-record
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      variant="neura"
                      className="flex-1"
                      size="lg"
                    >
                      Analyze My Speech
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Card className="border-neura-cyan/20 bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base">Tips for Your Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Speak naturally and authentically</li>
                  <li>• Share your genuine motivations and goals</li>
                  <li>• Try to speak for the full 60 seconds</li>
                  <li>• Find a quiet environment for best results</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

import { RotateCcw } from "lucide-react";
