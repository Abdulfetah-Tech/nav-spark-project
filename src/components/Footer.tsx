import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold">Fetan</span>
            </div>
            <p className="text-background/80 text-sm">
              Connecting homeowners with trusted home renovation and maintenance professionals across Ethiopia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="text-background/80 hover:text-background transition-colors">Services</a></li>
              <li><a href="#how-it-works" className="text-background/80 hover:text-background transition-colors">How It Works</a></li>
              <li><a href="#about" className="text-background/80 hover:text-background transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-background/80 hover:text-background transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="font-bold mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Find Services</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Book Appointment</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Help Center</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Safety</a></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="font-bold mb-4">For Providers</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Become a Provider</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Provider Resources</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/80">
            © {currentYear} Fetan. A project by ASTU Computer Science Students. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
