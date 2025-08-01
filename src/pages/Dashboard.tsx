import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Code, Lightbulb, LogOut, Zap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.username) {
          setUsername(profile.username);
        } else {
          // Fallback to email username
          setUsername(user.email?.split('@')[0] || "User");
        }
      }
    };

    fetchProfile();
  }, [user]);

  const learningOptions = [
    {
      title: "Speech Development",
      icon: Mic,
      description: "AI-powered speech analysis with vocal range, tone, and confidence detection.",
      route: "/speech",
      iconColor: "bg-neura-cyan"
    },
    {
      title: "Coding Skills",
      icon: Code,
      description: "Interactive coding challenges and personalized learning paths.",
      route: "/coding",
      iconColor: "bg-neura-purple"
    },
    {
      title: "Entrepreneurship",
      icon: Lightbulb,
      description: "Business acumen development with real-world case studies.",
      route: "/entrepreneurship",
      iconColor: "bg-green-600"
    }
  ];

  const handleSignOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-neura rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-neura bg-clip-text text-transparent">NEURA</span>
          </Link>
          <Button variant="ghost" onClick={handleSignOut} className="group">
            <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8 flex-1 flex flex-col justify-center">
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
                onClick={() => navigate(option.route)}
                className="cursor-pointer transition-all duration-300 bg-card/50 border border-border hover:bg-card hover:shadow-neura-glow hover:border-primary/20 group h-full flex flex-col"
              >
                <CardContent className="p-8 text-center space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-16 h-16 rounded-full ${option.iconColor} mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{option.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{option.description}</p>
                  </div>
                  <Button variant="neura-outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 mt-4">
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