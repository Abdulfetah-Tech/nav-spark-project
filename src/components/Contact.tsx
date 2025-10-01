import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Loader2, Sparkles, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  message: z.string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters")
    .trim(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIHelping, setIsAIHelping] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const messageValue = watch('message');

  const getAIHelp = async () => {
    if (!messageValue || messageValue.length < 10) {
      toast.error("Please write a brief description of what you need help with (at least 10 characters).");
      return;
    }

    setIsAIHelping(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-form-helper', {
        body: { 
          prompt: `Help me write a professional contact form message. Here's what I want to say: ${messageValue}`,
          context: 'contact_form'
        }
      });

      if (error) throw error;

      setValue('message', data.suggestion);
      toast.success("AI suggestion ready! Review and edit the message as needed before submitting.");
    } catch (error) {
      console.error('AI helper error:', error);
      toast.error("Failed to get AI assistance. Please try again.");
    } finally {
      setIsAIHelping(false);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: responseData, error } = await supabase.functions.invoke('submit-contact', {
        body: data,
      });

      if (error) throw error;

      if (responseData?.error) {
        toast.error(responseData.error);
        return;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isSubmitting}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  disabled={isSubmitting}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <div className="space-y-2">
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    {...register("message")}
                    disabled={isSubmitting}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getAIHelp}
                    disabled={isAIHelping || isSubmitting}
                    className="w-full"
                  >
                    {isAIHelping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting AI Help...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Improve with AI
                      </>
                    )}
                  </Button>
                </div>
                {errors.message && (
                  <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={20} />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
