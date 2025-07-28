import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings, Mic, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Sign up and tell us about your current skill level, goals, and learning preferences. Our AI will create a personalized learning path just for you."
    },
    {
      step: 2,
      icon: Settings,
      title: "AI Assessment",
      description: "Take a quick, fun assessment where our AI evaluates your speech patterns, confidence level, and areas for improvement."
    },
    {
      step: 3,
      icon: Mic,
      title: "Interactive Practice",
      description: "Engage in real-time speech exercises, receive instant feedback, and practice with AI-powered scenarios tailored to your age and interests."
    },
    {
      step: 4,
      icon: TrendingUp,
      title: "Track Progress",
      description: "Watch your skills improve with detailed analytics, earn achievements, and unlock new challenges as you advance."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How NEURA Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started with AI-powered skill development is easy. Follow these simple steps to begin your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-neura-cyan to-neura-purple z-0 transform -translate-x-1/2"></div>
              )}
              <Card className="bg-card border-border hover:border-neura-cyan/50 transition-all duration-300 relative z-10">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-neura flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 mx-auto rounded-full bg-neura-cyan text-white flex items-center justify-center text-sm font-bold mb-2">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="neura" size="lg">
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;