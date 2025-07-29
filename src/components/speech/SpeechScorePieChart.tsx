import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpeechScorePieChartProps {
  vocabulary: number;
  fluency: number;
  confidence: number;
  clarity: number;
  grammar: number;
  overall: number;
}

export const SpeechScorePieChart = ({ vocabulary, fluency, confidence, clarity, grammar, overall }: SpeechScorePieChartProps) => {
  const data = [
    { name: "Vocabulary", value: vocabulary, color: "#8B5CF6" },
    { name: "Fluency", value: fluency, color: "#06B6D4" },
    { name: "Confidence", value: confidence, color: "#EC4899" },
    { name: "Clarity", value: clarity, color: "#3B82F6" },
    { name: "Grammar", value: grammar, color: "#10B981" }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 45; // radius = 45

  let cumulativePercentage = 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Overall Score Display */}
      <Card className="bg-black/40 border-neura-cyan/30 text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (overall / 10) * circumference}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                  {overall}
                </div>
                <div className="text-sm text-muted-foreground">out of 10</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Chart */}
      <Card className="bg-black/40 border-neura-cyan/30">
        <CardHeader>
          <CardTitle className="text-xl text-white">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${(item.value / 10) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-6">
                      {item.value}
                    </span>
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