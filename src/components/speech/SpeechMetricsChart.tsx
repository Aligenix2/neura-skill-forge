import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SpeechMetricsChartProps {
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
}

export const SpeechMetricsChart = ({ vocabulary, fluency, confidence, clarity, grammar }: SpeechMetricsChartProps) => {
  const metrics = [
    { label: "Vocabulary", score: vocabulary, icon: "📚", color: "from-neura-purple to-neura-purple/80" },
    { label: "Fluency", score: fluency, icon: "🗣️", color: "from-neura-cyan to-neura-cyan/80" },
    { label: "Confidence", score: confidence, icon: "💪", color: "from-neura-pink to-neura-pink/80" },
    { label: "Clarity", score: clarity, icon: "🔍", color: "from-blue-500 to-blue-600" },
    { label: "Grammar", score: grammar, icon: "📝", color: "from-green-500 to-green-600" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressValue = (score: number) => score * 10;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-black/40 border-neura-cyan/30 hover:border-neura-cyan/60 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                <span className="text-xl">{metric.icon}</span>
              </div>
              <div>
                <div className="text-lg">{metric.label}</div>
                <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}/10
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={getProgressValue(metric.score)} 
                className="h-3 bg-black/30"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Needs Work</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};