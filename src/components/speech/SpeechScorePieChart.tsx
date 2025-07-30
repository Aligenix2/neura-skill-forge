import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpeechScorePieChartProps {
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
  topicRelevance: number;
  overall: number;
}

export const SpeechScorePieChart = ({ vocabulary, fluency, confidence, clarity, grammar, topicRelevance, overall }: SpeechScorePieChartProps) => {
  const data = [
    { name: "Vocabulary", value: vocabulary, color: "#8B5CF6" },
    { name: "Fluency", value: fluency, color: "#06B6D4" },
    { name: "Confidence", value: confidence, color: "#EC4899" },
    { name: "Clarity", value: clarity, color: "#3B82F6" },
    { name: "Grammar", value: grammar, color: "#10B981" },
    { name: "Topic Relevance", value: topicRelevance, color: "#F97316" }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 45; // radius = 45

  let cumulativePercentage = 0;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Overall Score Display */}
      <Card className="bg-background/80 backdrop-blur-sm border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura transition-all duration-300 text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="relative w-52 h-52 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#overallGradient)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (overall / 10) * circumference}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out drop-shadow-lg"
                style={{
                  filter: "drop-shadow(0 0 8px hsl(var(--neura-cyan) / 0.3))"
                }}
              />
              <defs>
                <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--neura-purple))" />
                  <stop offset="50%" stopColor="hsl(var(--neura-cyan))" />
                  <stop offset="100%" stopColor="hsl(var(--neura-pink))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                  {overall}
                </div>
                <div className="text-sm font-medium text-muted-foreground">out of 10</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Chart */}
      <Card className="bg-background/80 backdrop-blur-sm border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-foreground text-sm font-bold">
                      {item.value}/10
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${(item.value / 10) * 100}%`,
                        boxShadow: `0 0 8px ${item.color}30`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};