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
  transcript?: string;
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
        return "bg-neura-cyan/20 text-neura-cyan border-neura-cyan/50";
      case "Intermediate":
        return "bg-neura-purple/20 text-neura-purple border-neura-purple/50";
      case "Advanced":
        return "bg-neura-pink/20 text-neura-pink border-neura-pink/50";
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
    if (score >= 8) return "bg-gradient-to-br from-neura-pink to-neura-pink/80 text-white";
    if (score >= 6) return "bg-gradient-to-br from-neura-purple to-neura-purple/80 text-white";
    return "bg-gradient-to-br from-neura-cyan to-neura-cyan/80 text-white";
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
        <div className="inline-flex items-center space-x-2 bg-neura-purple/10 rounded-full px-4 py-2 border border-neura-purple/20 mb-4">
          <Trophy className="w-4 h-4 text-neura-purple" />
          <span className="text-sm text-neura-purple font-medium">Diagnostic Assessment Complete</span>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Your <span className="bg-gradient-neura bg-clip-text text-transparent">Speaking Profile</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-4">
          Here's what we learned about your communication style
        </p>

        {/* Overall Score Badge */}
        <div className="inline-flex items-center space-x-3 bg-card/80 border-2 border-neura-cyan/20 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-neura">
          <div className={`w-20 h-20 rounded-full ${getScoreBadgeColor(averageScore)} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl font-bold">{averageScore}</span>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-card-foreground">{averageScore}/10</div>
            <Badge className={`${getRecommendationColor(result.overall_recommendation)} border`}>
              {result.overall_recommendation} Level
            </Badge>
          </div>
        </div>
      </div>

      {/* Scores Grid */}
      <Card className="bg-card/80 border-2 border-neura-cyan/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Target className="w-5 h-5 mr-2 text-neura-cyan" />
            Your Speaking Skills Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoreCategories.map((category, index) => {
              const score = result.scores[category.key as keyof typeof result.scores];
              const feedback = result.feedback[category.key as keyof typeof result.feedback];
              const Icon = category.icon;
              const colors = [
                { border: "border-neura-purple/20", bg: "bg-gradient-to-br from-neura-purple/10 to-neura-purple/5", icon: "bg-gradient-to-br from-neura-purple to-neura-purple/80" },
                { border: "border-neura-cyan/20", bg: "bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5", icon: "bg-gradient-to-br from-neura-cyan to-neura-cyan/80" },
                { border: "border-neura-pink/20", bg: "bg-gradient-to-br from-neura-pink/10 to-neura-pink/5", icon: "bg-gradient-to-br from-neura-pink to-neura-pink/80" },
                { border: "border-purple-500/20", bg: "bg-gradient-to-br from-purple-500/10 to-purple-500/5", icon: "bg-gradient-to-br from-purple-500 to-purple-600" },
                { border: "border-neura-cyan/20", bg: "bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5", icon: "bg-gradient-to-br from-neura-cyan to-neura-cyan/80" }
              ];
              const color = colors[index % colors.length];
              
              return (
                <div 
                  key={category.key}
                  className={`relative bg-card/80 border-2 ${color.border} rounded-lg p-4 hover:shadow-neura-glow transition-all duration-300 overflow-hidden group`}
                >
                  <div className={`absolute inset-0 ${color.bg}`}></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`${color.icon} rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-card-foreground">{category.label}</h4>
                      </div>
                      <Badge className={`${getScoreBadgeColor(score)} font-bold shadow-lg`}>
                        {score}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">{feedback}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transcription Card */}
      {result.transcript && (
        <Card className="relative bg-card/80 border-2 border-neura-cyan/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full p-3 shadow-lg">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-card-foreground mb-3">What You Said</h3>
                <div className="bg-background/60 rounded-lg p-4 border border-border/50">
                  <p className="text-muted-foreground leading-relaxed">{result.transcript}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivation Card */}
      <Card className="relative bg-card/80 border-2 border-neura-pink/20 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neura-pink/10 to-neura-pink/5"></div>
        <CardContent className="relative p-6 flex items-start gap-4">
          <div className="bg-gradient-to-br from-neura-pink to-neura-pink/80 rounded-full p-3 shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Your Path Forward</h3>
            <p className="text-muted-foreground leading-relaxed">{result.motivation}</p>
          </div>
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
