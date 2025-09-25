import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, Play, Square } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";
import { useState, useEffect } from "react";

interface SpeechRecordingProps {
  topic: string;
  mode: SpeechMode;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onBack: () => void;
}

export const SpeechRecording = ({ 
  topic, 
  mode, 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onBack 
}: SpeechRecordingProps) => {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <section className="pt-16 pb-16 min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <Button variant="neura-outline" onClick={onBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topics
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/5 to-transparent"></div>
            <CardHeader className="relative text-center pb-6">
              <CardTitle className="text-3xl font-bold text-card-foreground mb-6">
                {mode === "storytelling" ? "Tell Your Story" : "Share Your Opinion"}
              </CardTitle>
              <div className="bg-neura-cyan/10 rounded-xl p-6 border border-neura-cyan/20 backdrop-blur-sm">
                <p className="text-xl text-card-foreground font-medium leading-relaxed">
                  {mode === "opinion" && "\""}
                  {topic}
                  {mode === "opinion" && "\""}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="relative text-center space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-card-foreground">Instructions:</h3>
                <div className="text-left bg-background/50 rounded-xl p-6 space-y-3 border border-border/50">
                  {mode === "storytelling" ? (
                    <>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Share your personal experience about this topic
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Include details like when, where, and how you felt
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Speak for 1-3 minutes
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Be natural and authentic in your storytelling
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Express your opinion clearly about this statement
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Provide reasons and examples to support your view
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Speak for 1-3 minutes
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <span className="w-2 h-2 bg-neura-cyan rounded-full mr-3"></span>
                        Consider different perspectives
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-8 py-8">
                {!isRecording ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-neura rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <Button 
                      onClick={onStartRecording}
                      variant="neura"
                      size="lg"
                      className="relative w-24 h-24 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-neura-glow"
                    >
                      <Mic className="w-8 h-8" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg">
                        <MicOff className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-2xl font-mono font-bold text-red-400 bg-red-500/10 rounded-lg px-4 py-2 border border-red-500/20">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="flex items-center space-x-3 text-red-400 bg-red-500/10 rounded-full px-4 py-2 border border-red-500/20">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="font-medium text-sm">Recording...</span>
                      </div>
                    </div>
                  </div>
                )}

                {!isRecording ? (
                  <p className="text-muted-foreground text-lg">Click the microphone to start recording</p>
                ) : (
                  <Button 
                    onClick={onStopRecording}
                    variant="destructive"
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-lg px-8 py-4"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm leading-relaxed">
                  <strong className="text-yellow-700 dark:text-yellow-300">Tips for best results:</strong><br/>
                  <span className="space-y-1 block mt-2">
                    • Speak clearly and at a normal pace<br/>
                    • Make sure your microphone is unmuted and working<br/>
                    • Speak for at least 30 seconds for better analysis<br/>
                    • Find a quiet environment to reduce background noise
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};