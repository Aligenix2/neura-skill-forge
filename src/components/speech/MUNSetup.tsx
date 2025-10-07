import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface MUNSetupProps {
  onSetupComplete: (topic: string) => void;
  onBack: () => void;
}

export const MUNSetup = ({ onSetupComplete, onBack }: MUNSetupProps) => {
  const [committee, setCommittee] = useState("");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (committee.trim() && country.trim() && topic.trim()) {
      const formattedTopic = `Committee: ${committee} | Country: ${country} | Topic: ${topic}`;
      onSetupComplete(formattedTopic);
    }
  };

  const isValid = committee.trim() && country.trim() && topic.trim();

  return (
    <section className="pt-16 pb-16 min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <Button variant="neura-outline" onClick={onBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mode Selection
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Setup Your <span className="bg-gradient-neura bg-clip-text text-transparent">
              MUN Assignment
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Prepare for a 1-minute General Speaker's List (GSL) speech by providing your committee details
          </p>
        </div>

        <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 hover:shadow-neura-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/5 to-transparent rounded-lg"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl">MUN Configuration</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="space-y-2">
              <Label htmlFor="committee" className="text-base">Committee</Label>
              <Input
                id="committee"
                placeholder="e.g., UNEP, UNHRC, DISEC, WHO, UNSC"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="bg-background/50 border-neura-cyan/20 focus:border-neura-cyan/40 text-base py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-base">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Brazil, Canada, Japan, India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-background/50 border-neura-cyan/20 focus:border-neura-cyan/40 text-base py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base">Topic Under Debate</Label>
              <Input
                id="topic"
                placeholder="e.g., Climate change, AI regulation, Refugee crisis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50 border-neura-cyan/20 focus:border-neura-cyan/40 text-base py-6"
              />
            </div>

            <div className="pt-4">
              <Button 
                variant="neura" 
                size="lg"
                className="w-full text-lg"
                onClick={handleSubmit}
                disabled={!isValid}
              >
                Continue to Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
