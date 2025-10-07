import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_TIME) {
            onStopRecording();
            return MAX_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (recordingTime / MAX_TIME) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Prompts
      </Button>

      <Card className="bg-black/40 border-neura-cyan/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-center bg-gradient-neura bg-clip-text text-transparent">
            Diagnostic Speech Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-neura-cyan/10 border-neura-cyan/30">
            <CardContent className="p-6">
              <p className="text-white text-lg text-center">{prompt}</p>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            {!isRecording ? (
              <>
                <p className="text-muted-foreground">
                  Speak for 30-45 seconds. Be natural and express yourself clearly.
                </p>
                <Button
                  onClick={onStartRecording}
                  size="lg"
                  className="bg-gradient-neura hover:opacity-90 gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-2xl font-bold text-white">
                      {formatTime(recordingTime)}
                    </span>
                    <span className="text-muted-foreground">/ {formatTime(MAX_TIME)}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>

                <p className="text-sm text-muted-foreground">
                  Recording will automatically stop at 45 seconds
                </p>

                <Button
                  onClick={onStopRecording}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  <MicOff className="w-5 h-5" />
                  Stop Recording
                </Button>
              </>
            )}
          </div>

          <div className="bg-black/20 border border-neura-cyan/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Tips for a Great Recording:</h4>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Speak clearly and at a comfortable pace</li>
              <li>• Be yourself - there are no wrong answers</li>
              <li>• Take a breath if you need to pause</li>
              <li>• Aim for 30-45 seconds</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
