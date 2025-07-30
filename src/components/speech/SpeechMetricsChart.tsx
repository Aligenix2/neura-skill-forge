import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SpeechMetricsChartProps {
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
  topicRelevance: number;
}

export const SpeechMetricsChart = ({ vocabulary, fluency, confidence, clarity, grammar, topicRelevance }: SpeechMetricsChartProps) => {
  const metrics = [
    { label: "Vocabulary", score: vocabulary, icon: "📚", color: "from-neura-purple to-neura-purple/80" },
    { label: "Fluency", score: fluency, icon: "🗣️", color: "from-neura-cyan to-neura-cyan/80" },
    { label: "Confidence", score: confidence, icon: "💪", color: "from-neura-pink to-neura-pink/80" },
    { label: "Clarity", score: clarity, icon: "🔍", color: "from-neura-cyan to-neura-cyan-light" },
    { label: "Grammar", score: grammar, icon: "📝", color: "from-neura-purple to-neura-pink" },
    { label: "Topic Relevance", score: topicRelevance, icon: "🎯", color: "from-neura-pink to-neura-purple" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-neura-cyan";
    if (score >= 6) return "text-neura-cyan-light";
    return "text-neura-pink";
  };

  const getProgressValue = (score: number) => score * 10;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-background/80 backdrop-blur-sm border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-neura-glow group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-xl">{metric.icon}</span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-foreground">{metric.label}</div>
                <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}/10
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-neura rounded-full transition-all duration-1000 ease-out shadow-neura-glow"
                    style={{ width: `${getProgressValue(metric.score)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
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