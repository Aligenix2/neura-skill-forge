import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, Play, Square } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";

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
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="neura-outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
      </div>

      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white mb-4">
            {mode === "storytelling" ? "Tell Your Story" : "Share Your Opinion"}
          </CardTitle>
          <div className="bg-neura-cyan/10 rounded-lg p-4 border border-neura-cyan/30">
            <p className="text-lg text-white font-medium">
              {mode === "opinion" && "\""}
              {topic}
              {mode === "opinion" && "\""}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Instructions:</h3>
            <div className="text-left bg-black/30 rounded-lg p-4 space-y-2">
              {mode === "storytelling" ? (
                <>
                  <p className="text-muted-foreground">• Share your personal experience about this topic</p>
                  <p className="text-muted-foreground">• Include details like when, where, and how you felt</p>
                  <p className="text-muted-foreground">• Speak for 1-3 minutes</p>
                  <p className="text-muted-foreground">• Be natural and authentic in your storytelling</p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">• Express your opinion clearly about this statement</p>
                  <p className="text-muted-foreground">• Provide reasons and examples to support your view</p>
                  <p className="text-muted-foreground">• Speak for 1-3 minutes</p>
                  <p className="text-muted-foreground">• Consider different perspectives</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {!isRecording ? (
              <Button 
                onClick={onStartRecording}
                variant="neura"
                size="lg"
                className="w-32 h-32 rounded-full text-lg font-semibold hover:scale-105 transition-transform"
              >
                <Mic className="w-12 h-12" />
              </Button>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <MicOff className="w-12 h-12 text-white" />
                </div>
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Recording in progress...</span>
                </div>
              </div>
            )}

            {!isRecording ? (
              <p className="text-muted-foreground">Click the microphone to start recording</p>
            ) : (
              <Button 
                onClick={onStopRecording}
                variant="destructive"
                size="lg"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Tips for best results:</strong><br/>
              • Speak clearly and at a normal pace<br/>
              • Make sure your microphone is unmuted and working<br/>
              • Speak for at least 30 seconds for better analysis<br/>
              • Find a quiet environment to reduce background noise
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};