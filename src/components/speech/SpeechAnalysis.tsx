import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import { SpeechAnalysisResult } from "@/pages/Speech";

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

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const highlightErrors = (text: string, errors: SpeechAnalysisResult['feedback']['errors']) => {
    let highlightedText = text;
    
    errors.forEach((error, index) => {
      const errorClass = error.type === 'grammar' ? 'bg-red-500/30 border-b-2 border-red-500' :
                        error.type === 'vocabulary' ? 'bg-blue-500/30 border-b-2 border-blue-500' :
                        error.type === 'fluency' ? 'bg-yellow-500/30 border-b-2 border-yellow-500' :
                        'bg-purple-500/30 border-b-2 border-purple-500';
      
      highlightedText = highlightedText.replace(
        error.text,
        `<span class="${errorClass}" title="${error.suggestion}">${error.text}</span>`
      );
    });
    
    return highlightedText;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Overall Score */}
      <Card className="bg-black/40 border-neura-cyan/30 text-center">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Analysis Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gradient-neura flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{result.overall}/10</span>
            </div>
            <p className="text-xl text-muted-foreground">Overall Speech Score</p>
          </div>
        </CardContent>
      </Card>

      {/* Audio Playback */}
      {audioUrl && (
        <Card className="bg-black/40 border-neura-cyan/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
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

      {/* Detailed Scores */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Vocabulary", score: result.vocabulary, icon: "📚" },
          { label: "Fluency", score: result.fluency, icon: "🗣️" },
          { label: "Confidence", score: result.confidence, icon: "💪" },
          { label: "Clarity", score: result.clarity, icon: "🔍" },
          { label: "Grammar", score: result.grammar, icon: "📝" }
        ].map((metric) => (
          <Card key={metric.label} className="bg-black/40 border-neura-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">{metric.icon}</span>
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}/10
                  </span>
                </div>
                <Progress 
                  value={metric.score * 10} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transcript with Errors */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-white">Speech Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/30 rounded-lg p-4">
            <p 
              className="text-white leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: highlightErrors(result.transcript, result.feedback.errors) 
              }}
            />
          </div>
          {result.feedback.errors.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Color Legend:</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500/30 border-b-2 border-red-500"></div>
                  Grammar
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500/30 border-b-2 border-blue-500"></div>
                  Vocabulary
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500/30 border-b-2 border-yellow-500"></div>
                  Fluency
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500/30 border-b-2 border-purple-500"></div>
                  Clarity
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              ✅ Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.feedback.strengths.map((strength, index) => (
                <li key={index} className="text-white flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-black/40 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              💡 Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.feedback.improvements.map((improvement, index) => (
                <li key={index} className="text-white flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Specific Errors */}
      {result.feedback.errors.length > 0 && (
        <Card className="bg-black/40 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              🔍 Specific Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.feedback.errors.map((error, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border-l-4 border-red-500/50">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-red-400 font-medium capitalize">{error.type} Issue</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white">
                      <span className="text-muted-foreground">Found: </span>
                      <span className="bg-red-500/20 px-2 py-1 rounded">"{error.text}"</span>
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Suggestion: </span>
                      {error.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};