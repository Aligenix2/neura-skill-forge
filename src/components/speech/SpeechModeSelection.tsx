import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";
import { SpeechMode } from "@/pages/Speech";

interface SpeechModeSelectionProps {
  onModeSelect: (mode: SpeechMode) => void;
}

export const SpeechModeSelection = ({ onModeSelect }: SpeechModeSelectionProps) => {
  return (
    <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="grid md:grid-cols-2 gap-12 w-full max-w-4xl">
        <Card className="bg-gradient-to-br from-neura-purple/20 to-neura-purple/5 border-2 border-neura-purple/40 hover:border-neura-purple/70 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group backdrop-blur-sm"
              onClick={() => onModeSelect("storytelling")}>
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-neura-purple to-neura-purple/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">Story Telling</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-black mb-8 leading-relaxed font-medium">
              Share personal experiences and stories about common life situations. 
              Practice narrative skills and creative expression.
            </p>
            <Button variant="neura" className="w-full py-3 text-lg font-semibold">
              Choose Story Telling
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neura-cyan/20 to-neura-cyan/5 border-2 border-neura-cyan/40 hover:border-neura-cyan/70 hover:shadow-neura-glow transition-all duration-300 cursor-pointer group backdrop-blur-sm"
              onClick={() => onModeSelect("opinion")}>
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-neura-cyan to-neura-cyan/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">Opinion Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-black mb-8 leading-relaxed font-medium">
              Express your thoughts and opinions on various topics. 
              Develop persuasive speaking and critical thinking skills.
            </p>
            <Button variant="neura" className="w-full py-3 text-lg font-semibold">
              Choose Opinion Sharing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};