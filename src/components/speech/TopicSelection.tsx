import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";

interface TopicSelectionProps {
  mode: SpeechMode;
  onTopicSelect: (topic: string) => void;
  onBack: () => void;
}

const storytellingTopics = [
  "Tell us about your most memorable birthday celebration",
  "Describe a time when you helped someone in need",
  "Share about your first day at school or a new job",
  "Talk about a family tradition that means a lot to you",
  "Describe your favorite childhood memory",
  "Tell us about a time you overcame a fear",
  "Share about a meal that holds special significance",
  "Describe a moment when you felt proud of yourself",
  "Talk about a friendship that changed your life",
  "Tell us about your most exciting travel experience"
];

const opinionStatements = [
  "Winter is better than summer",
  "Social media has more positive than negative effects",
  "Reading books is more valuable than watching movies",
  "Working from home is better than working in an office",
  "Cooking at home is better than eating at restaurants",
  "Morning people are more productive than night owls",
  "Video games can be educational and beneficial",
  "Learning a musical instrument should be mandatory in schools",
  "Pets make people happier and healthier",
  "Technology makes life easier but also more complicated",
  "Public transportation is better than owning a car",
  "Online learning is as effective as traditional classroom learning"
];

export const TopicSelection = ({ mode, onTopicSelect, onBack }: TopicSelectionProps) => {
  const [topics, setTopics] = useState<string[]>([]);

  const generateRandomTopics = () => {
    const sourceTopics = mode === "storytelling" ? storytellingTopics : opinionStatements;
    const shuffled = [...sourceTopics].sort(() => 0.5 - Math.random());
    setTopics(shuffled.slice(0, 4));
  };

  useEffect(() => {
    generateRandomTopics();
  }, [mode]);

  const getDifficultyLabel = (index: number) => {
    if (index === 0) return "Easy";
    if (index === 1) return "Medium";
    if (index === 2) return "Medium";
    return "Challenging";
  };

  const getDifficultyColor = (index: number) => {
    if (index === 0) return "text-green-400";
    if (index === 1 || index === 2) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button variant="neura-outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mode Selection
        </Button>
        <Button variant="ghost" onClick={generateRandomTopics} className="text-neura-cyan hover:text-neura-cyan/80">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Topics
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-neura bg-clip-text text-transparent mb-2">
          Choose Your {mode === "storytelling" ? "Story Topic" : "Opinion Topic"}
        </h2>
        <p className="text-muted-foreground">
          {mode === "storytelling" 
            ? "Select a personal experience to share"
            : "Pick a statement to express your opinion about"
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {topics.map((topic, index) => (
          <Card 
            key={index}
            className="bg-black/40 border-neura-cyan/30 hover:border-neura-cyan/60 transition-all duration-300 cursor-pointer group h-full"
            onClick={() => onTopicSelect(topic)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neura-cyan">
                  Topic {index + 1}
                </span>
                <span className={`text-xs font-medium ${getDifficultyColor(index)}`}>
                  {getDifficultyLabel(index)}
                </span>
              </div>
              <CardTitle className="text-lg text-white leading-relaxed">
                {mode === "opinion" && "\""}
                {topic}
                {mode === "opinion" && "\""}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="neura-outline" className="w-full group-hover:bg-neura-cyan group-hover:text-white transition-all">
                Select This Topic
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};