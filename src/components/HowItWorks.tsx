import { Search, UserCheck, Calendar, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowItWorks = () => {
  const customerSteps = [
    {
      icon: Search,
      title: "Search Services",
      description: "Browse through verified service providers based on your location and service needs",
    },
    {
      icon: UserCheck,
      title: "Select Provider",
      description: "Review profiles, ratings, and past work to choose the right professional",
    },
    {
      icon: Calendar,
      title: "Book & Schedule",
      description: "Submit service requests and schedule appointments at your convenience",
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "Share your experience to help others make informed decisions",
    },
  ];

  const providerSteps = [
    {
      icon: UserCheck,
      title: "Create Profile",
      description: "Register and showcase your skills, certifications, and experience",
    },
    {
      icon: Search,
      title: "Get Discovered",
      description: "Be visible to thousands of property owners looking for your services",
    },
    {
      icon: Calendar,
      title: "Receive Requests",
      description: "Get notified of service requests matching your expertise",
    },
    {
      icon: Star,
      title: "Build Reputation",
      description: "Earn ratings and reviews to grow your business",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Simple steps to connect homeowners with trusted service providers
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* For Customers */}
          <div className="space-y-8">
            <div className="inline-block px-6 py-2 bg-primary/10 text-primary rounded-full font-semibold">
              For Homeowners
            </div>
            
            {customerSteps.map((step, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-medium transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-primary-foreground">
                      <step.icon size={32} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-primary">{index + 1}</span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* For Service Providers */}
          <div className="space-y-8">
            <div className="inline-block px-6 py-2 bg-accent/10 text-accent rounded-full font-semibold">
              For Service Providers
            </div>
            
            {providerSteps.map((step, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-medium transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center text-accent-foreground">
                      <step.icon size={32} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-accent">{index + 1}</span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
