import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Briefcase, Globe, Sparkles } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";

interface SpeechModeSelectionProps {
  onModeSelect: (mode: SpeechMode) => void;
}

export const SpeechModeSelection = ({ onModeSelect }: SpeechModeSelectionProps) => {
  return (
    <section className="pt-24 pb-16 min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-4 py-2 border border-neura-cyan/20 mb-6">
            <Sparkles className="w-4 h-4 text-neura-cyan" />
            <span className="text-sm text-neura-cyan font-medium">Choose Your Speech Training Mode</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Select Your <span className="bg-gradient-neura bg-clip-text text-transparent">Training Mode</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Master debate, interviews, or Model UN with AI-powered guidance, evaluation, and actionable feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-purple/20 hover:border-neura-purple/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onModeSelect("debate")}>
            <div className="absolute inset-0 bg-gradient-to-br from-neura-purple/10 to-neura-purple/5"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-neura-purple to-neura-purple/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-card-foreground">Debate</CardTitle>
            </CardHeader>
            <CardContent className="relative text-center">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Master parliamentary debate with structured arguments, logic evaluation, and persuasive delivery feedback.
              </p>
              <Button variant="neura" size="sm">
                Next
              </Button>
            </CardContent>
          </Card>

          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onModeSelect("interview")}>
            <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-card-foreground">Interview</CardTitle>
            </CardHeader>
            <CardContent className="relative text-center">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Ace university admissions, scholarships, and career interviews with personalized question practice and feedback.
              </p>
              <Button variant="neura" className="w-full py-3 text-lg font-semibold">
                Choose Interview
              </Button>
            </CardContent>
          </Card>

          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-purple-500/20 hover:border-purple-500/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onModeSelect("mun")}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-card-foreground">Model UN</CardTitle>
            </CardHeader>
            <CardContent className="relative text-center">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Perfect your diplomatic speech, policy understanding, and opening statements for Model UN conferences.
              </p>
              <Button variant="neura" className="w-full py-3 text-lg font-semibold">
                Choose Model UN
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
