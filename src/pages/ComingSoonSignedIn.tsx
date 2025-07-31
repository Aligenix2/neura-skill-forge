import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Rocket, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoonSignedIn = () => {
  return (
    <div className="min-h-screen bg-gradient-neura-secondary">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-neura flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-neura bg-clip-text text-transparent">
              COMING SOON!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              We're working hard to bring you this amazing feature. Stay tuned for updates!
            </p>
            <p className="text-sm text-muted-foreground/70">
              Powered by Skillabs
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="neura" size="lg" className="group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="neura-outline" size="lg">
              Notify Me When Ready
            </Button>
          </div>

          {/* What's Coming Next Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold bg-gradient-neura bg-clip-text text-transparent mb-12">
              What's Coming Next?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Coding Skills */}
              <div className="text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neura-purple rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neura-purple">Coding Skills</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Interactive coding challenges</li>
                  <li>• AI-powered code review</li>
                  <li>• Project-based learning</li>
                </ul>
              </div>

              {/* Entrepreneurship */}
              <div className="text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neura-pink rounded-lg flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neura-pink">Entrepreneurship</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Business plan creator</li>
                  <li>• Market analysis tools</li>
                  <li>• Pitch practice sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonSignedIn;