import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, Lightbulb, Code, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Try <span className="bg-gradient-neura bg-clip-text text-transparent">NEURA</span> for free
            </h1>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 text-left justify-start">
              <div className="w-5 h-5 bg-red-500 rounded mr-3"></div>
              Continue with Google
            </Button>
            
            <Button variant="outline" className="w-full h-12 text-left justify-start">
              <div className="w-5 h-5 bg-blue-500 rounded mr-3"></div>
              Continue with Microsoft
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Sign up with work email
          </div>

          <div className="space-y-4">
            <Input 
              type="email" 
              placeholder="Enter your work email"
              className="h-12"
            />
            <Button variant="secondary" className="w-full h-12">
              Next
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <button 
              className="text-neura-cyan hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>
              By signing up, you agree to our{" "}
              <a href="#" className="text-neura-cyan hover:underline">Terms of Service</a>,{" "}
              <a href="#" className="text-neura-cyan hover:underline">Copyright Policy</a>,{" "}
              <a href="#" className="text-neura-cyan hover:underline">Cookie Preferences</a>,
            </p>
            <p>
              and acknowledge you've read our{" "}
              <a href="#" className="text-neura-cyan hover:underline">Privacy Policy</a>.
            </p>
          </div>

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
          {/* Central Circle with Microphone */}
          <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center relative">
            <div className="w-32 h-32 rounded-full bg-neura-cyan/10 flex items-center justify-center">
              <Mic className="w-16 h-16 text-neura-cyan" />
            </div>
          </div>

          {/* Floating Icons */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-neura-cyan" />
          </div>
          
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Code className="w-8 h-8 text-neura-cyan" />
          </div>
          
          <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neura-cyan"></div>
          </div>
          
          <div className="absolute top-1/4 -right-8 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neura-cyan"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;