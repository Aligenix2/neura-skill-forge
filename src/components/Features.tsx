import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Brain, Target, Users, Clock, Award } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Mic,
      title: "Speech Enhancement",
      description: "Advanced AI-powered speech coaching to improve your communication skills, pronunciation, and public speaking confidence.",
      color: "text-neura-cyan"
    },
    {
      icon: Brain,
      title: "Personalized AI Coaching",
      description: "Our AI adapts to your learning style and pace, providing customized feedback and exercises tailored just for you.",
      color: "text-neura-purple"
    },
    {
      icon: Target,
      title: "Goal-Oriented Learning",
      description: "Set specific skill targets and track your progress with detailed analytics and milestone achievements.",
      color: "text-neura-cyan"
    },
    {
      icon: Users,
      title: "Peer Interaction",
      description: "Connect with other learners, practice together, and participate in safe, supportive learning environments.",
      color: "text-neura-purple"
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Learn at your own pace with 24/7 access to AI coaching sessions that fit your busy schedule.",
      color: "text-neura-cyan"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Earn badges, certificates, and unlock new challenges as you progress through your skill development journey.",
      color: "text-neura-purple"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-neura bg-clip-text text-transparent">NEURA</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform offers cutting-edge features designed specifically for young learners to excel in their skill development journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:border-neura-cyan/50 transition-all duration-300 group hover:shadow-neura">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-neura-secondary flex items-center justify-center mb-4 group-hover:shadow-neura-glow transition-all duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;