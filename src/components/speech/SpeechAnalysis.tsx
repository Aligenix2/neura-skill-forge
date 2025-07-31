import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, TrendingUp, AlertTriangle, CheckCircle, Trophy, Target, BookOpen, Mic, Edit3, Star, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";

interface SpeechAnalysisResult {
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

interface SpeechAnalysisProps {
  result: SpeechAnalysisResult;
  audioUrl?: string;
  topic: string;
  onRetry: () => void;
}

export const SpeechAnalysis = ({ result, audioUrl, topic, onRetry }: SpeechAnalysisProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCorrected, setShowCorrected] = useState(false);
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
    if (score >= 8) return "text-neura-cyan";
    if (score >= 6) return "text-neura-purple";
    return "text-neura-pink";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-neura-cyan text-white";
    if (score >= 6) return "bg-neura-purple text-white";
    return "bg-neura-pink text-white";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 9) return "Outstanding";
    if (score >= 8) return "Excellent";
    if (score >= 7) return "Very Good";
    if (score >= 6) return "Good";
    if (score >= 5) return "Fair";
    return "Needs Practice";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clarity': return <Mic className="w-5 h-5" />;
      case 'structure': return <Target className="w-5 h-5" />;
      case 'vocabulary': return <BookOpen className="w-5 h-5" />;
      case 'grammar': return <Edit3 className="w-5 h-5" />;
      case 'relevance': return <Star className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-neura-secondary py-8">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-4 py-2 border border-neura-cyan/20 mb-4">
            <Trophy className="w-4 h-4 text-neura-cyan" />
            <span className="text-sm text-neura-cyan font-medium">Speech Feedback & Evaluation</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Your <span className="bg-gradient-neura bg-clip-text text-transparent">Speech Analysis</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-2">Topic: "{topic}"</p>
          
          {/* Overall Score Badge */}
          <div className="inline-flex items-center space-x-3 bg-card rounded-full px-6 py-3 border border-border shadow-neura">
            <div className={`w-16 h-16 rounded-full ${getScoreBadgeColor(result.overall_score)} flex items-center justify-center`}>
              <span className="text-2xl font-bold">{result.overall_score}</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-foreground">{result.overall_score}/10</div>
              <div className="text-sm text-muted-foreground">{getScoreDescription(result.overall_score)}</div>
            </div>
          </div>
        </div>

        {/* Audio Playback Section */}
        {audioUrl && (
          <Card className="mb-6 border-neura-cyan/20 hover:border-neura-cyan/40 transition-all duration-300 shadow-neura">
            <CardHeader>
              <CardTitle className="flex items-center text-neura-navy">
                <Volume2 className="w-5 h-5 mr-2 text-neura-cyan" />
                Your Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={togglePlayback}
                  variant="neura"
                  size="lg"
                  className="rounded-full w-16 h-16 shadow-neura-glow hover:shadow-neura-glow"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <span className="text-muted-foreground font-medium">
                  {isPlaying ? "Playing your speech..." : "Click to replay your speech"}
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

        {/* User Transcription Card */}
        <Card className="mb-6 border-neura-cyan/20 hover:border-neura-cyan/40 transition-all duration-300 shadow-neura">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-neura-navy">
              <div className="flex items-center">
                <Mic className="w-5 h-5 mr-2 text-neura-cyan" />
                Your Speech Transcription
              </div>
              <Button
                variant="neura-outline"
                size="sm"
                onClick={() => setShowCorrected(!showCorrected)}
              >
                {showCorrected ? "Show Original" : "Show Corrected"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-neura-cyan/5 border border-neura-cyan/20 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">
                "{showCorrected ? result.corrected_speech : result.original_transcription}"
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {showCorrected ? "✨ AI-enhanced version with improved grammar and punctuation" : "📝 Your original speech as recorded"}
            </p>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="mb-6 border-neura-cyan/20 hover:border-neura-cyan/40 transition-all duration-300 shadow-neura">
          <CardHeader>
            <CardTitle className="flex items-center text-neura-navy">
              <TrendingUp className="w-5 h-5 mr-2 text-neura-cyan" />
              Detailed Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.category_scores).map(([category, data]) => (
                <div key={category} className="bg-neura-cyan/5 border border-neura-cyan/20 rounded-lg p-4 hover:bg-neura-cyan/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-neura-cyan">{getCategoryIcon(category)}</div>
                      <h4 className="font-semibold text-neura-navy capitalize">
                        {category.replace('_', ' & ')}
                      </h4>
                    </div>
                    <Badge className={`${getScoreBadgeColor(data.score * 5)} font-bold`}>
                      {data.score}/2
                    </Badge>
                  </div>
                  <Progress 
                    value={(data.score / 2) * 100} 
                    className="mb-2 h-2"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What You Did Well Section */}
        <Card className="mb-6 border-neura-cyan/20 hover:border-neura-cyan/40 transition-all duration-300 shadow-neura">
          <CardHeader>
            <CardTitle className="flex items-center text-neura-navy">
              <CheckCircle className="w-5 h-5 mr-2 text-neura-cyan" />
              What You Did Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {result.positive_aspects.map((aspect, index) => (
                <div key={index} className="flex items-start space-x-3 bg-neura-cyan/5 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-neura-cyan mt-0.5 flex-shrink-0" />
                  <p className="text-foreground font-medium">{aspect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions Section */}
        <Card className="mb-6 border-neura-purple/20 hover:border-neura-purple/40 transition-all duration-300 shadow-neura">
          <CardHeader>
            <CardTitle className="flex items-center text-neura-navy">
              <Target className="w-5 h-5 mr-2 text-neura-purple" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {result.areas_to_improve.map((area, index) => (
                <div key={index} className="flex items-start space-x-3 bg-neura-purple/5 rounded-lg p-3">
                  <Target className="w-5 h-5 text-neura-purple mt-0.5 flex-shrink-0" />
                  <p className="text-foreground font-medium">{area}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Phrases */}
        {result.suggested_phrases && result.suggested_phrases.length > 0 && (
          <Card className="mb-6 border-neura-purple/20 hover:border-neura-purple/40 transition-all duration-300 shadow-neura">
            <CardHeader>
              <CardTitle className="flex items-center text-neura-navy">
                <Edit3 className="w-5 h-5 mr-2 text-neura-purple" />
                Phrase Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.suggested_phrases.map((phrase, index) => (
                  <div key={index} className="bg-neura-purple/5 border border-neura-purple/20 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-neura-pink mb-2 flex items-center">
                          <span className="w-2 h-2 bg-neura-pink rounded-full mr-2"></span>
                          Original
                        </h4>
                        <p className="text-foreground bg-neura-pink/10 p-3 rounded border border-neura-pink/20">
                          "{phrase.original}"
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-neura-cyan mb-2 flex items-center">
                          <span className="w-2 h-2 bg-neura-cyan rounded-full mr-2"></span>
                          Suggested
                        </h4>
                        <p className="text-foreground bg-neura-cyan/10 p-3 rounded border border-neura-cyan/20">
                          "{phrase.suggested}"
                        </p>
                      </div>
                    </div>
                    <div className="bg-neura-purple/10 rounded-lg p-3 border border-neura-purple/20">
                      <h4 className="text-sm font-semibold text-neura-purple mb-1">Why this helps:</h4>
                      <p className="text-sm text-muted-foreground">{phrase.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Try Again CTA */}
        <div className="text-center">
          <Button 
            onClick={onRetry}
            variant="neura" 
            size="lg"
            className="shadow-neura-glow hover:shadow-neura-glow group"
          >
            <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Practice Again
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Ready to improve your score? Try the same topic again!
          </p>
        </div>
      </div>
    </div>
  );
};