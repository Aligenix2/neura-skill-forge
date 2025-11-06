import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InitialAssessment } from "@/components/speech/InitialAssessment";
import { useAuth } from "@/hooks/useAuth";

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiContent, setAiContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    async function checkAssessmentStatus() {
      if (!user) return;

      try {
        // Check if profile exists, if not create one (for Google OAuth users)
        let { data: profile, error: profileFetchError } = await supabase
          .from('profiles')
          .select('has_completed_initial_assessment, username')
          .eq('user_id', user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileFetchError && profileFetchError.code === 'PGRST116') {
          const username = user.email?.split('@')[0] || 'user';
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              username: username,
              has_completed_initial_assessment: false
            });

          if (createError) {
            console.error("Error creating profile:", createError);
          } else {
            profile = { has_completed_initial_assessment: false, username };
          }
        } else if (profileFetchError) {
          throw profileFetchError;
        }

        const completed = profile?.has_completed_initial_assessment || false;
        setHasCompletedAssessment(completed);

        if (completed) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking assessment status:", error);
      }
    }

    checkAssessmentStatus();
  }, [user, navigate]);

  useEffect(() => {
    async function fetchWelcomeMessage() {
      try {
        const { data, error } = await supabase.functions.invoke("welcome-message");
        
        if (error) throw error;
        
        setAiContent(data.content);
      } catch (error) {
        console.error("Error fetching welcome message:", error);
        setAiContent("Welcome to Neura! Get ready to transform your public speaking skills with personalized AI-powered coaching.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWelcomeMessage();
  }, []);

  const handleStartAssessment = () => {
    setShowAssessment(true);
  };

  const handleAssessmentComplete = () => {
    navigate("/dashboard");
  };

  if (hasCompletedAssessment) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-neura-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-neura">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-neura flex items-center justify-center shadow-neura-glow">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neura-navy">
                Welcome to <span className="bg-gradient-neura bg-clip-text text-transparent">Neura</span> 🎉
              </h1>
              <p className="text-muted-foreground text-lg">
                Your account has been verified successfully.
              </p>
            </div>

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

            <div className="pt-4">
              <Button 
                onClick={handleStartAssessment}
                className="w-full h-12 bg-gradient-neura hover:opacity-90 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                Begin Initial Assessment
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              <p>Powered by Skillabs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <InitialAssessment 
        open={showAssessment} 
        onComplete={handleAssessmentComplete}
      />
    </>
  );
};

export default Welcome;