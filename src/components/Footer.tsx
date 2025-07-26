import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neura-navy text-white border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-neura rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-neura bg-clip-text text-transparent">
                NEURA
              </span>
            </div>
            <p className="text-gray-300">
              Empowering young minds with AI-powered skill development for the future.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Speech Training</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Coming Soon: Coding</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Coming Soon: Entrepreneurship</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">AI Assessment</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-neura-cyan transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-neura-cyan transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 NEURA. All rights reserved. Designed for young learners aged 10-18.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;