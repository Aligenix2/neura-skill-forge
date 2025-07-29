import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Code, Lightbulb, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "User";

  const learningOptions = [
    {
      title: "Speech",
      icon: Mic,
      description: "Improve your communication skills",
      color: "hover:bg-neura-cyan/10 hover:border-neura-cyan"
    },
    {
      title: "Coding",
      icon: Code,
      description: "Master programming languages",
      color: "hover:bg-neura-purple/10 hover:border-neura-purple"
    },
    {
      title: "Entrepreneurship",
      icon: Lightbulb,
      description: "Develop business acumen",
      color: "hover:bg-neura-pink/10 hover:border-neura-pink"
    }
  ];

  const handleSignOut = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-neura bg-clip-text text-transparent">NEURA</span>
          </h1>
          <Button variant="ghost" onClick={handleSignOut} className="group">
            <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome, {username}!
          </h1>
          <p className="text-xl text-muted-foreground">
            What would you like to learn today?
          </p>
        </div>

        {/* Learning Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {learningOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.title}
                className={`cursor-pointer transition-all duration-300 border-2 ${option.color} hover:shadow-lg`}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-neura mx-auto flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{option.title}</h3>
                  <p className="text-muted-foreground text-sm">{option.description}</p>
                  <Button variant="neura-outline" className="w-full">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;