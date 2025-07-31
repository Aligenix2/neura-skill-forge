import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";

interface SpeechAnalysisResult {
  score: number;
  feedback: string;
  suggested_phrases: Array<{
    original: string;
    suggested: string;
    reason: string;
  }>;
  corrected_speech: string;
}

interface SpeechAnalysisProps {
  result: SpeechAnalysisResult;
  audioUrl: string;
}

export const SpeechAnalysis = ({ result, audioUrl }: SpeechAnalysisProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Fair";
    if (score >= 5) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overall Score Section */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-white text-center">Speech Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
              {result.score}/10
            </div>
            <div className="text-xl text-muted-foreground">
              {getScoreDescription(result.score)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Playback */}
      {audioUrl && (
        <Card className="bg-black/40 border-neura-cyan/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Your Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={togglePlayback}
                variant="neura"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <span className="text-muted-foreground">
                {isPlaying ? "Playing..." : "Click to play your recording"}
              </span>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Overall Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {result.feedback}
          </p>
        </CardContent>
      </Card>

      {/* Suggested Phrases */}
      {result.suggested_phrases && result.suggested_phrases.length > 0 && (
        <Card className="bg-black/40 border-neura-cyan/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Suggested Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.suggested_phrases.map((phrase, index) => (
                <div key={index} className="border border-neura-cyan/20 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">Original:</h4>
                      <p className="text-muted-foreground bg-red-500/10 p-2 rounded">
                        "{phrase.original}"
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">Suggested:</h4>
                      <p className="text-muted-foreground bg-green-500/10 p-2 rounded">
                        "{phrase.suggested}"
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-neura-cyan mb-1">Why this is better:</h4>
                    <p className="text-sm text-muted-foreground">{phrase.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corrected Speech */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Improved Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-muted-foreground leading-relaxed">
              {result.corrected_speech}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};