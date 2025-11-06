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
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/welcome`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message || "An unexpected error occurred"
      });
      setLoading(false);
    }
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

          <div className="space-y-4">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>

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