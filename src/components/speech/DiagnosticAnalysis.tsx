import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp } from "lucide-react";

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-black/40 border-neura-cyan/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-neura bg-clip-text text-transparent">
            Your Diagnostic Results
          </CardTitle>
          <div className="flex justify-center gap-4 mt-4">
            <Badge className={getRecommendationColor(result.overall_recommendation)}>
              {result.overall_recommendation} Level
            </Badge>
            <Badge className="bg-neura-cyan/20 text-neura-cyan border-neura-cyan/50">
              Average Score: {averageScore}/10
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scores Section */}
          <div className="space-y-4">
            {Object.entries(result.scores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium capitalize">
                    {key.replace("_", " & ")}
                  </span>
                  <span className="text-neura-cyan font-bold">{score}/10</span>
                </div>
                <Progress value={score * 10} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {result.feedback[key as keyof typeof result.feedback]}
                </p>
              </div>
            ))}
          </div>

          {/* Motivation */}
          <Card className="bg-gradient-neura/10 border-neura-cyan/30">
            <CardContent className="p-4 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-neura-cyan flex-shrink-0 mt-1" />
              <p className="text-white">{result.motivation}</p>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-black/20 border-neura-cyan/20">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Recommended Training Mode
              </h3>
              <div className="flex justify-center">
                <Badge className="bg-gradient-neura text-white px-6 py-2 text-lg">
                  {getModeName(result.recommended_mode)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Based on your diagnostic, we think {getModeName(result.recommended_mode)} would be a great fit for you. But feel free to explore all modes!
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={onContinue}
            className="w-full bg-gradient-neura hover:opacity-90 gap-2"
            size="lg"
          >
            Continue to Training Modes
            <ArrowRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
