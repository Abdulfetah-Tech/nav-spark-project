import { Card } from "@/components/ui/card";
import { Wrench, Zap, Paintbrush, Hammer, Droplets, Cable } from "lucide-react";
import plumbingImg from "@/assets/service-plumbing.jpg";
import electricalImg from "@/assets/service-electrical.jpg";
import paintingImg from "@/assets/service-painting.jpg";

export const Services = () => {
  const services = [
    {
      icon: Droplets,
      title: "Plumbing Services",
      description: "Expert plumbers for repairs, installations, and maintenance",
      image: plumbingImg,
      color: "text-blue-500",
    },
    {
      icon: Zap,
      title: "Electrical Work",
      description: "Licensed electricians for safe and reliable electrical solutions",
      image: electricalImg,
      color: "text-yellow-500",
    },
    {
      icon: Paintbrush,
      title: "Painting & Finishing",
      description: "Professional painters for interior and exterior projects",
      image: paintingImg,
      color: "text-purple-500",
    },
    {
      icon: Hammer,
      title: "Carpentry",
      description: "Skilled carpenters for custom woodwork and repairs",
      color: "text-amber-600",
    },
    {
      icon: Wrench,
      title: "General Maintenance",
      description: "All-round handymen for various home repair needs",
      color: "text-gray-600",
    },
    {
      icon: Cable,
      title: "Satellite & TV Installation",
      description: "Professional installation and setup services",
      color: "text-teal-500",
    },
  ];

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-lg text-muted-foreground">
            Browse through our wide range of home renovation and maintenance services. 
            All our service providers are verified and rated by real customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group cursor-pointer hover:shadow-medium transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                    <service.icon size={64} className={service.color} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={`absolute bottom-4 left-4 w-12 h-12 bg-background rounded-full flex items-center justify-center ${service.color}`}>
                  <service.icon size={24} />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
                <button className="mt-4 text-primary font-semibold hover:underline inline-flex items-center gap-2 group">
                  View Providers
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
