import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import rocketImage from "@/assets/rocket-3d.png";
const Hero = () => {
  return <section className="pt-24 pb-16 min-h-screen flex items-center bg-gradient-neura-secondary">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-neura-cyan/10 rounded-full px-4 py-2 border border-neura-cyan/20">
              <Sparkles className="w-4 h-4 text-neura-cyan" />
              <span className="text-sm text-neura-cyan font-medium">AI-Powered Skill Development</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Unlock Your <span className="bg-gradient-neura bg-clip-text text-transparent">Potential</span> with AI-Powered Learning
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              NEURA helps young minds aged 10-18 master essential skills through personalized AI coaching. 
              Start with speech enhancement and discover the power of AI-driven skill development.
            </p>
            
            <p className="text-sm text-slate-800">Powered by Skillabs</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button variant="neura" size="lg" className="group">
                  Start Your Speech Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://youtu.be/c9tLB0IU518" target="_blank" rel="noopener noreferrer">
                <Button variant="neura-outline" size="lg">
                  Watch Demo
                </Button>
              </a>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div>
                <span className="text-2xl font-bold text-neura-cyan">5K+</span>
                <br />
                Students Trained
              </div>
              <div>
                <span className="text-2xl font-bold text-neura-cyan">95%</span>
                <br />
                Improvement Rate
              </div>
              <div>
                <span className="text-2xl font-bold text-neura-cyan">24/7</span>
                <br />
                AI Coaching
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-neura rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            <img src={rocketImage} alt="3D Rocket - Launch Your Learning Journey" className="relative rounded-3xl shadow-neura border border-neura-cyan/20 w-full h-auto" />
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;