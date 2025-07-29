import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Sparkles } from "lucide-react";
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
            Select Your <span className="bg-gradient-neura bg-clip-text text-transparent">Learning Path</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Choose between storytelling to enhance narrative skills or opinion sharing to develop critical thinking and persuasive communication.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-purple/20 hover:border-neura-purple/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onModeSelect("storytelling")}>
            <div className="absolute inset-0 bg-gradient-to-br from-neura-purple/10 to-neura-purple/5"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-neura-purple to-neura-purple/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-card-foreground">Story Telling</CardTitle>
            </CardHeader>
            <CardContent className="relative text-center">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Share personal experiences and stories about common life situations. 
                Practice narrative skills and creative expression through engaging storytelling.
              </p>
              <Button variant="neura" className="w-full py-3 text-lg font-semibold">
                Choose Story Telling
              </Button>
            </CardContent>
          </Card>

          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-neura-cyan/20 hover:border-neura-cyan/40 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onModeSelect("opinion")}>
            <div className="absolute inset-0 bg-gradient-to-br from-neura-cyan/10 to-neura-cyan/5"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-card-foreground">Opinion Sharing</CardTitle>
            </CardHeader>
            <CardContent className="relative text-center">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Express your thoughts and opinions on various topics. 
                Develop persuasive speaking and critical thinking skills through structured debates.
              </p>
              <Button variant="neura" className="w-full py-3 text-lg font-semibold">
                Choose Opinion Sharing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};