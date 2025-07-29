import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { SpeechAnalysisResult } from "@/pages/Speech";
import { SpeechMetricsChart } from "./SpeechMetricsChart";
import { SpeechScorePieChart } from "./SpeechScorePieChart";

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Overall Score with Performance Indicator */}
      <Card className="bg-gradient-to-br from-black/60 to-black/40 border-2 border-neura-cyan/40 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-neura-cyan" />
            Analysis Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-neura flex items-center justify-center shadow-neura-glow">
                <div className="text-center">
                  <span className="text-5xl font-bold text-white">{result.overall}</span>
                  <div className="text-white/80 text-sm">out of 10</div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                {result.overall >= 8 ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : result.overall >= 6 ? (
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-semibold ${getScoreColor(result.overall)}`}>
                {getScoreDescription(result.overall)}
              </p>
              <p className="text-muted-foreground mt-2">Speech Performance Level</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Score Visualization */}
      <SpeechScorePieChart 
        vocabulary={result.vocabulary}
        fluency={result.fluency}
        confidence={result.confidence}
        clarity={result.clarity}
        grammar={result.grammar}
        overall={result.overall}
      />

      {/* Audio Playback */}
      {audioUrl && (
        <Card className="bg-black/40 border-neura-cyan/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-neura-cyan" />
              Your Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={togglePlayback}
                variant="neura"
                size="lg"
                className="rounded-full w-16 h-16 hover:scale-105 transition-transform"
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

      {/* Detailed Metrics */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Detailed Performance Metrics</h3>
        <SpeechMetricsChart 
          vocabulary={result.vocabulary}
          fluency={result.fluency}
          confidence={result.confidence}
          clarity={result.clarity}
          grammar={result.grammar}
        />
      </div>

      {/* Enhanced Transcript with Error Highlighting */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-neura-cyan" />
            Speech Transcript & Error Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-black/50 to-black/30 rounded-xl p-6 border border-neura-cyan/20">
            <p 
              className="text-white leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ 
                __html: highlightErrors(result.transcript, result.feedback.errors) 
              }}
            />
          </div>
          {result.feedback.errors.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-lg border border-yellow-500/30">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Error Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/30 border-b-2 border-red-500 rounded"></div>
                  <span className="text-white">Grammar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/30 border-b-2 border-blue-500 rounded"></div>
                  <span className="text-white">Vocabulary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/30 border-b-2 border-yellow-500 rounded"></div>
                  <span className="text-white">Fluency</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500/30 border-b-2 border-purple-500 rounded"></div>
                  <span className="text-white">Clarity</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Feedback Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Strengths */}
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-3 text-xl">
              <CheckCircle className="w-6 h-6" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-2 border-yellow-500/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-3 text-xl">
              <TrendingUp className="w-6 h-6" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.feedback.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white font-medium">{improvement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Error Analysis */}
      {result.feedback.errors.length > 0 && (
        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-3 text-xl">
              <AlertTriangle className="w-6 h-6" />
              Specific Issues & Suggestions ({result.feedback.errors.length} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {result.feedback.errors.map((error, index) => (
                <div key={index} className="bg-gradient-to-r from-black/50 to-black/30 rounded-xl p-4 border-l-4 border-red-500/70">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wide">
                        {error.type} Error
                      </span>
                      <span className="text-xs text-muted-foreground">Issue #{index + 1}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Problematic Text:</span>
                      <div className="mt-1 p-2 bg-red-500/10 rounded border border-red-500/30">
                        <span className="text-white font-mono">"{error.text}"</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Professional Suggestion:</span>
                      <p className="mt-1 text-white bg-green-500/10 p-3 rounded border border-green-500/30">
                        {error.suggestion}
                      </p>
                    </div>
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