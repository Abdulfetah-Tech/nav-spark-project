import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import { AIServiceRecommendations } from "@/components/AIServiceRecommendations";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <AIServiceRecommendations />
      <Features />
      <HowItWorks />
      <Contact />
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
