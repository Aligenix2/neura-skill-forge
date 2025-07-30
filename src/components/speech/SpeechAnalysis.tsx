import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { SpeechAnalysisResult } from "@/lib/speechAnalysis";
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
    <section className="pt-16 pb-16 min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Your <span className="bg-gradient-neura bg-clip-text text-transparent">Speech Analysis</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Here's your detailed performance analysis with personalized feedback to help you improve your communication skills
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Overall Score */}
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5"></div>
            <CardHeader className="relative text-center pb-8">
              <CardTitle className="text-3xl font-bold text-card-foreground mb-6 flex items-center justify-center gap-3">
                <TrendingUp className="w-8 h-8 text-neura-cyan" />
                Analysis Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col items-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-neura rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative w-48 h-48 rounded-full bg-gradient-neura flex items-center justify-center shadow-neura-glow">
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{result.overall}</span>
                      <div className="text-white/80 text-lg">out of 10</div>
                    </div>
                  </div>
                  <div className="absolute -top-3 -right-3 bg-background rounded-full p-2">
                    {result.overall >= 8 ? (
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    ) : result.overall >= 6 ? (
                      <AlertTriangle className="w-10 h-10 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className={`text-3xl font-bold ${getScoreColor(result.overall)}`}>
                    {getScoreDescription(result.overall)}
                  </p>
                  <p className="text-muted-foreground text-lg">Speech Performance Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Playback */}
          {audioUrl && (
            <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-pink/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-neura-pink/5 to-transparent"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
                  <Volume2 className="w-6 h-6 mr-3 text-neura-pink" />
                  Audio Playback
                </CardTitle>
                <p className="text-muted-foreground">Listen to your recorded speech and review your performance</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-center space-x-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-neura rounded-full blur-lg opacity-20"></div>
                    <Button 
                      onClick={togglePlayback}
                      variant="neura"
                      size="lg"
                      className="relative rounded-full w-20 h-20 hover:scale-105 transition-all shadow-neura-glow"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-card-foreground font-semibold text-xl">
                      {isPlaying ? "Now Playing..." : "Review Your Speech"}
                    </p>
                    <p className="text-muted-foreground">
                      Click play to listen and identify areas for improvement
                    </p>
                  </div>
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


          {/* Transcript with Highlighted Errors */}
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/5 to-transparent"></div>
            <CardHeader className="relative">
              <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
                <Volume2 className="w-6 h-6 mr-3 text-neura-cyan" />
                Transcript Analysis
              </CardTitle>
              <p className="text-muted-foreground">Your speech with highlighted areas for improvement and suggestions</p>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-background/50 rounded-xl p-6 mb-8 border border-border/50 backdrop-blur-sm">
                <div 
                  className="text-card-foreground leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightErrors(result.transcript, result.feedback.errors) 
                  }}
                />
              </div>
              
              {result.feedback.errors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-card-foreground">Error Type Legend</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-card-foreground">Grammar</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-card-foreground">Vocabulary</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-card-foreground">Fluency</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-card-foreground">Clarity</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-green-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
                  Key Strengths
                </CardTitle>
                <p className="text-muted-foreground">Areas where you performed exceptionally well</p>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4">
                  {result.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-4 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span className="text-card-foreground leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Growth Opportunities */}
            <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-yellow-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-yellow-500" />
                  Growth Opportunities
                </CardTitle>
                <p className="text-muted-foreground">Areas for improvement and development</p>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4">
                  {result.feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-4 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span className="text-card-foreground leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Error Analysis */}
          {result.feedback.errors.length > 0 && (
            <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-red-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                  Detailed Error Analysis ({result.feedback.errors.length} found)
                </CardTitle>
                <p className="text-muted-foreground">Specific errors found with actionable suggestions for improvement</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-6">
                  {result.feedback.errors.map((error, index) => (
                    <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center bg-red-500/20 text-red-400 font-medium text-sm uppercase tracking-wide rounded-full px-3 py-1 border border-red-500/30">
                          {error.type} Error #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-background/30 rounded-lg p-4 border border-red-500/20">
                          <p className="text-card-foreground">
                            <span className="text-red-400 font-semibold">Error Found:</span> "{error.text}"
                          </p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                          <p className="text-card-foreground">
                            <span className="text-green-400 font-semibold">Suggested Improvement:</span> {error.suggestion}
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
      </div>
    </section>
  );
};