import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Mic } from "lucide-react";

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-black/40 border-neura-cyan/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-neura bg-clip-text text-transparent">
            Let's Start with a Quick Diagnostic
          </CardTitle>
          <p className="text-muted-foreground text-center mt-2">
            Pick a prompt below and speak for 30-45 seconds. This helps us understand your speaking style.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {PROMPT_SETS[currentSet].map((prompt, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPrompt === prompt
                    ? "bg-neura-cyan/20 border-neura-cyan"
                    : "bg-black/20 border-neura-cyan/20 hover:border-neura-cyan/50"
                }`}
                onClick={() => handlePromptClick(prompt)}
              >
                <CardContent className="p-4">
                  <p className="text-white">{prompt}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={refreshPrompts}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Different Prompts
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!selectedPrompt}
              className="gap-2 bg-gradient-neura hover:opacity-90"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
