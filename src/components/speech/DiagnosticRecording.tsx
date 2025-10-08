import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, ArrowLeft, MessageCircle, Lightbulb, Clock, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DiagnosticRecordingProps {
  prompt: string;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onBack: () => void;
}

export const DiagnosticRecording = ({
  prompt,
  isRecording,
  onStartRecording,
  onStopRecording,
  onBack
}: DiagnosticRecordingProps) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const MAX_TIME = 45;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onStopRecordingRef = useRef(onStopRecording);

  // Keep the callback ref updated without causing re-renders
  useEffect(() => {
    onStopRecordingRef.current = onStopRecording;
  }, [onStopRecording]);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_TIME) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onStopRecordingRef.current();
            return MAX_TIME;
          }
          return newTime;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (recordingTime / MAX_TIME) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 hover:bg-neura-cyan/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Prompts
      </Button>

      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-neura-purple/10 rounded-full px-4 py-2 border border-neura-purple/20 mb-6">
          <Mic className="w-4 h-4 text-neura-purple" />
          <span className="text-sm text-neura-purple font-medium">Ready to Record</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
          Your <span className="bg-gradient-neura bg-clip-text text-transparent">Speaking Prompt</span>
        </h1>
      </div>

      {/* Prompt Card */}
      <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 mb-8 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/10 to-neura-purple/5"></div>
        <CardContent className="relative p-8">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full p-3 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-card-foreground text-lg leading-relaxed pt-2">{prompt}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recording Control */}
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-neura-purple/20 mb-6">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {!isRecording ? (
              <>
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    Speak naturally and express yourself clearly
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Aim for 30-45 seconds</span>
                  </div>
                </div>
                <Button
                  onClick={onStartRecording}
                  size="lg"
                  className="bg-gradient-neura hover:opacity-90 gap-2 shadow-neura-glow px-8"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center gap-4 bg-black/40 backdrop-blur-sm rounded-2xl px-8 py-6 border-2 border-red-500/30 shadow-lg shadow-red-500/20">
                    <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white tabular-nums animate-fade-in">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        of {formatTime(MAX_TIME)} seconds
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Recording will automatically stop at 45 seconds
                  </p>
                </div>

                <Button
                  onClick={onStopRecording}
                  size="lg"
                  variant="destructive"
                  className="gap-2 shadow-lg"
                >
                  <MicOff className="w-5 h-5" />
                  Stop Recording
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-pink/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neura-pink/5 to-transparent"></div>
        <CardContent className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-neura-pink to-neura-pink/80 rounded-full p-2.5 flex-shrink-0 shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-card-foreground font-semibold mb-3">Tips for a Great Recording</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-neura-pink mt-0.5">•</span>
                  <span>Speak clearly and at a comfortable pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neura-pink mt-0.5">•</span>
                  <span>Be yourself - there are no wrong answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neura-pink mt-0.5">•</span>
                  <span>Take a breath if you need to pause</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neura-pink mt-0.5">•</span>
                  <span>Relax and let your personality shine through</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
