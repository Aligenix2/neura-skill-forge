import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";

interface SpeechModeSelectionProps {
  onModeSelect: (mode: SpeechMode) => void;
}

export const SpeechModeSelection = ({ onModeSelect }: SpeechModeSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-black/40 border-neura-purple/30 hover:border-neura-purple/60 transition-all duration-300 cursor-pointer group"
              onClick={() => onModeSelect("storytelling")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-neura-purple to-neura-purple/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Story Telling</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Share personal experiences and stories about common life situations. 
              Practice narrative skills and creative expression.
            </p>
            <Button variant="neura" className="w-full">
              Choose Story Telling
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-neura-cyan/30 hover:border-neura-cyan/60 transition-all duration-300 cursor-pointer group"
              onClick={() => onModeSelect("opinion")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Opinion Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Express your thoughts and opinions on various topics. 
              Develop persuasive speaking and critical thinking skills.
            </p>
            <Button variant="neura" className="w-full">
              Choose Opinion Sharing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};