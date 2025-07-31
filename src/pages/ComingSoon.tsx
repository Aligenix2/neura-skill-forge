import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-neura-secondary flex items-center justify-center py-16">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-neura bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              We're working hard to bring you an amazing demo experience. 
              Stay tuned for exciting updates!
            </p>
          </div>
          
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-neura flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/40"></div>
            </div>
          </div>
          
          <Link to="/">
            <Button variant="neura-outline" size="lg" className="group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;