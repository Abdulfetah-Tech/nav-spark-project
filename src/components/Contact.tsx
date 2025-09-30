import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <Card className="p-6 hover:shadow-medium transition-all duration-300 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm">contact@fetan.com</p>
                  <p className="text-muted-foreground text-sm">support@fetan.com</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={24} className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-sm">+251 11 123 4567</p>
                  <p className="text-muted-foreground text-sm">Mon-Fri: 8AM - 6PM</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-success-foreground" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Visit Us</h3>
                  <p className="text-muted-foreground text-sm">Adama Science and Technology University</p>
                  <p className="text-muted-foreground text-sm">Adama, Ethiopia</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full">
                Send Message
                <Send size={20} />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
