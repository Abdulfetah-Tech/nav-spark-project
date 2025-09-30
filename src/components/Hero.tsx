import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero -z-10" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Trusted by 10,000+ Homeowners
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Find Expert Home
              <span className="block text-primary mt-2">Renovation Services</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Connect with verified professionals for all your home maintenance needs. 
              From plumbing to electrical work, painting to carpentry – we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
                />
              </div>
              <Button variant="hero" size="lg" className="sm:w-auto w-full">
                Search Services
                <ArrowRight size={20} />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Expert Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:block hidden animate-slide-in-right">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="Professional home renovation service" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute bottom-8 left-8 bg-card p-6 rounded-xl shadow-strong animate-float">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                  <span className="text-success-foreground font-bold text-xl">✓</span>
                </div>
                <div>
                  <div className="font-semibold">100% Verified</div>
                  <div className="text-sm text-muted-foreground">All Professionals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
