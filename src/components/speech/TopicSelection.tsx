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

const debateMotions = [
  "This House Believes That social media does more harm than good",
  "This House Would ban single-use plastics",
  "This House Believes That artificial intelligence will benefit humanity",
  "This House Would make voting mandatory",
  "This House Believes That homework should be abolished",
  "This House Would implement a universal basic income",
  "This House Believes That space exploration is worth the cost",
  "This House Would lower the voting age to 16",
  "This House Believes That zoos should be closed",
  "This House Would ban junk food advertising to children"
];

const interviewQuestions = [
  "University Admission: Why do you want to attend this university?",
  "Scholarship: How will this scholarship help you achieve your goals?",
  "Startup Pitch: What problem does your idea solve?",
  "Job Interview: Tell me about your greatest strength and weakness",
  "College Essay: Describe a challenge you've overcome",
  "Leadership Role: What makes you a good leader?",
  "Internship: Why are you interested in this field?",
  "Graduate School: What are your research interests?",
  "Volunteer Position: How do you handle working with diverse groups?",
  "Career Fair: Where do you see yourself in five years?"
];

const munTopics = [
  "Committee: UNEP | Country: Brazil | Topic: Amazon rainforest deforestation",
  "Committee: UNHRC | Country: Canada | Topic: Refugee crisis and asylum policies",
  "Committee: DISEC | Country: Japan | Topic: Nuclear non-proliferation",
  "Committee: WHO | Country: India | Topic: Global pandemic preparedness",
  "Committee: UNSC | Country: France | Topic: Climate change as a security threat",
  "Committee: ECOSOC | Country: Germany | Topic: Sustainable development goals",
  "Committee: UNESCO | Country: Egypt | Topic: Cultural heritage preservation",
  "Committee: UNICEF | Country: Sweden | Topic: Child rights in conflict zones",
  "Committee: UNDP | Country: Kenya | Topic: Technology access in developing nations",
  "Committee: UNCSTD | Country: Singapore | Topic: AI regulation and ethics"
];

export const TopicSelection = ({ mode, onTopicSelect, onBack }: TopicSelectionProps) => {
  const [topics, setTopics] = useState<string[]>([]);

  const generateRandomTopics = () => {
    let sourceTopics: string[];
    if (mode === "debate") sourceTopics = debateMotions;
    else if (mode === "interview") sourceTopics = interviewQuestions;
    else sourceTopics = munTopics;
    
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
    if (index === 0) return "text-green-500";
    if (index === 1 || index === 2) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <section className="pt-16 pb-16 min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <Button variant="neura-outline" onClick={onBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mode Selection
          </Button>
          <Button variant="ghost" onClick={generateRandomTopics} className="text-neura-cyan hover:text-neura-cyan/80 hover:bg-neura-cyan/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Topics
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Choose Your <span className="bg-gradient-neura bg-clip-text text-transparent">
              {mode === "debate" ? "Debate Motion" : mode === "interview" ? "Interview Question" : "MUN Assignment"}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {mode === "debate" 
              ? "Select a parliamentary debate motion and prepare your opening argument"
              : mode === "interview"
              ? "Choose an interview scenario and practice your response"
              : "Pick your committee, country, and topic to prepare your opening statement"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {topics.map((topic, index) => (
            <Card 
              key={index}
              className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group h-full overflow-hidden"
              onClick={() => onTopicSelect(topic)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/5 to-transparent"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-3 py-1 border border-neura-cyan/20">
                    <span className="text-sm font-medium text-neura-cyan">
                      Topic {index + 1}
                    </span>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-background/50 rounded-full px-3 py-1 border">
                    <span className={`text-xs font-medium ${getDifficultyColor(index)}`}>
                      {getDifficultyLabel(index)}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg text-card-foreground leading-relaxed">
                  {topic}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-0">
                <Button variant="neura-outline" className="w-full group-hover:bg-neura-cyan group-hover:text-white group-hover:border-neura-cyan transition-all">
                  Select This Topic
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};