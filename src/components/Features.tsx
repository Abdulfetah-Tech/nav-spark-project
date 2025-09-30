import { Shield, MessageCircle, CreditCard, Star, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All service providers are thoroughly vetted and verified for quality assurance",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Star,
      title: "Rating & Reviews",
      description: "Transparent feedback system helps you make informed decisions",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      icon: MessageCircle,
      title: "Real-time Communication",
      description: "Chat directly with service providers for quick responses",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Safe and secure payment processing through trusted gateways",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: MapPin,
      title: "Location-based Search",
      description: "Find service providers near you with ease",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book services at times that work best for you",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Why Choose Fetan?</h2>
          <p className="text-lg text-muted-foreground">
            Experience the most reliable and efficient way to connect with home service professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon size={28} className={feature.color} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
