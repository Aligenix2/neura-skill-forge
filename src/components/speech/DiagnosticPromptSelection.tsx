import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Mic, MessageSquare, Target, Lightbulb, Users } from "lucide-react";

interface DiagnosticPromptSelectionProps {
  onPromptSelect: (prompt: string) => void;
}

const PROMPT_SETS = [
  [
    "Please introduce yourself and share what motivates you.",
    "Do you agree or disagree with the statement: 'Technology improves human relationships'? Explain why.",
    "Describe your favorite place and explain why it's meaningful to you.",
    "Imagine you have to plan a community event with a limited budget. How would you approach it?"
  ],
  [
    "Tell us about a challenge you've overcome and what you learned from it.",
    "Should social media platforms be held responsible for the content their users post? Why or why not?",
    "Describe a book, movie, or piece of art that has influenced you.",
    "You're organizing a team project with diverse opinions. How would you ensure everyone is heard?"
  ],
  [
    "Share a skill you'd like to learn and explain why it interests you.",
    "Do you think remote work is better than office work? Explain your reasoning.",
    "Describe someone who has inspired you and how they've influenced your life.",
    "If you could solve one global problem, what would it be and how would you approach it?"
  ]
];

export const DiagnosticPromptSelection = ({ onPromptSelect }: DiagnosticPromptSelectionProps) => {
  const [currentSet, setCurrentSet] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const refreshPrompts = () => {
    setCurrentSet((prev) => (prev + 1) % PROMPT_SETS.length);
    setSelectedPrompt(null);
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleContinue = () => {
    if (selectedPrompt) {
      onPromptSelect(selectedPrompt);
    }
  };

  const promptIcons = [MessageSquare, Target, Lightbulb, Users];
  const promptColors = [
    { border: "border-neura-purple/20 hover:border-neura-purple/40", bg: "bg-gradient-to-br from-neura-purple/10 to-neura-purple/5", icon: "bg-gradient-to-br from-neura-purple to-neura-purple/80", selected: "border-neura-purple shadow-neura-glow" },
    { border: "border-neura-cyan/20 hover:border-neura-cyan/40", bg: "bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5", icon: "bg-gradient-to-br from-neura-cyan to-neura-cyan/80", selected: "border-neura-cyan shadow-neura-glow" },
    { border: "border-neura-pink/20 hover:border-neura-pink/40", bg: "bg-gradient-to-br from-neura-pink/10 to-neura-pink/5", icon: "bg-gradient-to-br from-neura-pink to-neura-pink/80", selected: "border-neura-pink shadow-neura-glow" },
    { border: "border-purple-500/20 hover:border-purple-500/40", bg: "bg-gradient-to-br from-purple-500/10 to-purple-500/5", icon: "bg-gradient-to-br from-purple-500 to-purple-600", selected: "border-purple-500 shadow-neura-glow" }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-4 py-2 border border-neura-cyan/20 mb-6">
          <Target className="w-4 h-4 text-neura-cyan" />
          <span className="text-sm text-neura-cyan font-medium">Diagnostic Assessment</span>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
          Let's Start with a <span className="bg-gradient-neura bg-clip-text text-transparent">Quick Diagnostic</span>
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Pick a prompt below and speak for 30-45 seconds. This helps us understand your speaking style.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {PROMPT_SETS[currentSet].map((prompt, index) => {
          const Icon = promptIcons[index];
          const colors = promptColors[index];
          const isSelected = selectedPrompt === prompt;
          
          return (
            <Card
              key={index}
              className={`relative bg-card/80 backdrop-blur-sm border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${
                isSelected 
                  ? colors.selected 
                  : colors.border
              }`}
              onClick={() => handlePromptClick(prompt)}
            >
              <div className={`absolute inset-0 ${colors.bg}`}></div>
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-card-foreground leading-relaxed pt-2">{prompt}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={refreshPrompts}
          className="gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Different Prompts
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!selectedPrompt}
          className="gap-2 bg-gradient-neura hover:opacity-90 shadow-neura-glow"
          size="lg"
        >
          <Mic className="w-4 h-4" />
          Start Recording
        </Button>
      </div>
    </div>
  );
};
