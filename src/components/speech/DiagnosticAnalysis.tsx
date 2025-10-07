import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Volume2, Clock, Sparkles, Heart, BookOpen, Target, Trophy } from "lucide-react";

interface DiagnosticResult {
  scores: {
    clarity: number;
    pacing: number;
    tone_expression: number;
    confidence: number;
    vocabulary: number;
  };
  feedback: {
    clarity: string;
    pacing: string;
    tone_expression: string;
    confidence: string;
    vocabulary: string;
  };
  overall_recommendation: string;
  recommended_mode: string;
  motivation: string;
}

interface DiagnosticAnalysisProps {
  result: DiagnosticResult;
  onContinue: () => void;
}

export const DiagnosticAnalysis = ({ result, onContinue }: DiagnosticAnalysisProps) => {
  const averageScore = Math.round(
    (result.scores.clarity +
      result.scores.pacing +
      result.scores.tone_expression +
      result.scores.confidence +
      result.scores.vocabulary) / 5
  );

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Advanced":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  const getModeName = (mode: string) => {
    switch (mode) {
      case "debate":
        return "Debate Training";
      case "interview":
        return "Interview Preparation";
      case "mun":
        return "Model UN Practice";
      default:
        return mode;
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-neura-cyan text-white";
    if (score >= 6) return "bg-neura-purple text-white";
    return "bg-neura-pink text-white";
  };

  const scoreCategories = [
    { key: 'clarity', label: 'Clarity', icon: Volume2, description: 'How clear and understandable your speech was' },
    { key: 'pacing', label: 'Pacing', icon: Clock, description: 'Your speaking speed and rhythm' },
    { key: 'tone_expression', label: 'Tone & Expression', icon: Sparkles, description: 'How engaging and expressive you sounded' },
    { key: 'confidence', label: 'Confidence', icon: Heart, description: 'Your self-assurance and presence' },
    { key: 'vocabulary', label: 'Vocabulary', icon: BookOpen, description: 'Word choice and variety' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-4 py-2 border border-neura-cyan/20 mb-4">
          <Trophy className="w-4 h-4 text-neura-cyan" />
          <span className="text-sm text-neura-cyan font-medium">Diagnostic Assessment Complete</span>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Your <span className="bg-gradient-neura bg-clip-text text-transparent">Speaking Profile</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-4">
          Here's what we learned about your communication style
        </p>

        {/* Overall Score Badge */}
        <div className="inline-flex items-center space-x-3 bg-black/40 border border-neura-cyan/30 backdrop-blur-sm rounded-full px-6 py-3 shadow-neura">
          <div className={`w-16 h-16 rounded-full ${getScoreBadgeColor(averageScore)} flex items-center justify-center`}>
            <span className="text-2xl font-bold">{averageScore}</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-white">{averageScore}/10</div>
            <Badge className={getRecommendationColor(result.overall_recommendation)}>
              {result.overall_recommendation} Level
            </Badge>
          </div>
        </div>
      </div>

      {/* Scores Grid */}
      <Card className="bg-black/40 border-neura-cyan/30 backdrop-blur-sm shadow-neura">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Target className="w-5 h-5 mr-2 text-neura-cyan" />
            Your Speaking Skills Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoreCategories.map((category) => {
              const score = result.scores[category.key as keyof typeof result.scores];
              const feedback = result.feedback[category.key as keyof typeof result.feedback];
              const Icon = category.icon;
              
              return (
                <div 
                  key={category.key}
                  className="bg-neura-cyan/5 border border-neura-cyan/20 rounded-lg p-4 hover:bg-neura-cyan/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-neura-cyan">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-white">{category.label}</h4>
                    </div>
                    <Badge className={`${getScoreBadgeColor(score)} font-bold`}>
                      {score}/10
                    </Badge>
                  </div>
                  <Progress 
                    value={(score / 10) * 100} 
                    className="mb-3 h-2"
                  />
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <div className="bg-black/20 rounded p-2 border border-neura-cyan/10">
                    <p className="text-xs text-muted-foreground">{feedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Motivation Card */}
      <Card className="bg-gradient-neura/10 border-neura-cyan/30 backdrop-blur-sm shadow-neura">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="bg-neura-cyan/20 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-neura-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Your Path Forward</h3>
            <p className="text-white leading-relaxed">{result.motivation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Card */}
      <Card className="bg-black/40 border-neura-purple/30 backdrop-blur-sm shadow-neura">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-neura mb-2">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Recommended Training Mode
          </h3>
          <div className="flex justify-center">
            <Badge className="bg-gradient-neura text-white px-8 py-3 text-lg shadow-neura-glow">
              {getModeName(result.recommended_mode)}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on your diagnostic assessment, we think {getModeName(result.recommended_mode)} would be a great fit for your current skill level. However, feel free to explore all training modes!
          </p>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onContinue}
          className="bg-gradient-neura hover:opacity-90 gap-2 shadow-neura-glow"
          size="lg"
        >
          Continue to Training Modes
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
