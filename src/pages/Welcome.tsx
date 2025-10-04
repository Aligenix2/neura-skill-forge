import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Mic, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Welcome = () => {
  const navigate = useNavigate();
  const [aiContent, setAiContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWelcomeMessage() {
      try {
        const { data, error } = await supabase.functions.invoke("welcome-message");
        
        if (error) throw error;
        
        setAiContent(data.content);
      } catch (error) {
        console.error("Error fetching welcome message:", error);
        // Fallback content
        setAiContent("Welcome to Neura! Get ready to transform your public speaking skills with personalized AI-powered coaching.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWelcomeMessage();
  }, []);

  const handleStartExercise = () => {
    navigate("/speech");
  };

  return (
    <div className="min-h-screen bg-gradient-neura-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-neura">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-neura flex items-center justify-center shadow-neura-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neura-navy">
              Welcome to <span className="bg-gradient-neura bg-clip-text text-transparent">Neura</span> 🎉
            </h1>
            <p className="text-muted-foreground text-lg">
              Your account has been verified successfully.
            </p>
          </div>

          {/* AI-Generated Content */}
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-neura-cyan" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {aiContent}
              </p>
            )}
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <Button 
              onClick={handleStartExercise}
              className="w-full h-12 bg-gradient-neura hover:opacity-90 text-white font-semibold transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start My First Exercise
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground pt-2">
            <p>Powered by Skillabs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;