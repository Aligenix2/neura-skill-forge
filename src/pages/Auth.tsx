import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, Lightbulb, Code, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // Clean up existing state
        cleanupAuthState();
        try {
          await supabase.auth.signOut({
            scope: 'global'
          });
        } catch (err) {
          // Continue even if this fails
        }
        const redirectUrl = `${window.location.origin}/welcome`;
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: formData.username
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          // Create profile entry
          const {
            error: profileError
          } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            username: formData.username
          });
          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here as the user is still created
          }
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account."
          });

          // Clear form
          setFormData({
            username: "",
            email: "",
            password: ""
          });
        }
      } else {
        // Sign in
        cleanupAuthState();
        try {
          await supabase.auth.signOut({
            scope: 'global'
          });
        } catch (err) {
          // Continue even if this fails
        }
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        if (data.user) {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background flex">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              {isSignUp ? "Join" : "Welcome to"} <span className="bg-gradient-neura bg-clip-text text-transparent">NEURA</span>
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Start your AI-powered learning journey" : "Sign in to continue your learning"}
            </p>
            <p className="text-sm text-slate-800">Powered by Skillabs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Choose a username" className="h-12" value={formData.username} onChange={handleInputChange} required />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email address" className="h-12" value={formData.email} onChange={handleInputChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" className="h-12" value={formData.password} onChange={handleInputChange} required />
            </div>
            
            <Button type="submit" variant="neura" className="w-full h-12" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <button className="text-neura-cyan hover:underline font-medium" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          {isSignUp && <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>
                By signing up, you agree to our{" "}
                <a href="#" className="text-neura-cyan hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-neura-cyan hover:underline">Privacy Policy</a>.
              </p>
            </div>}

          <Link to="/">
            <Button variant="ghost" size="sm" className="group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-neura items-center justify-center p-8">
        <div className="relative">
          {/* Three Main Icons in Triangle Formation */}
          <div className="relative w-80 h-80 flex flex-col items-center justify-center space-y-8">
            {/* Speech/Microphone - Top */}
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Mic className="w-10 h-10 text-neura-cyan" />
            </div>
            
            {/* Coding - Middle */}
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Code className="w-10 h-10 text-neura-cyan" />
            </div>
            
            {/* Entrepreneurship - Bottom */}
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Lightbulb className="w-10 h-10 text-neura-cyan" />
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;