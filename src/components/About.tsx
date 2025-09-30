import { Card } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";

export const About = () => {
  const team = [
    { name: "Abdulfetah Sultan", id: "UGR/22542/13" },
    { name: "Nigat Geletu", id: "UGR/22519/13" },
    { name: "Edom Gurmecha", id: "UGR/23444/13" },
    { name: "Mahilet Dinku", id: "UGR/23087/13" },
    { name: "Imamudin Johar", id: "UGR/22666/13" },
  ];

  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">About Fetan</h2>
          <p className="text-lg text-muted-foreground">
            Transforming the home renovation and maintenance service industry in Ethiopia
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center hover:shadow-medium transition-all duration-300 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={32} className="text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground">
              To create an integrated digital platform that streamlines connections between home renovation 
              experts and property owners, enhancing efficiency and service quality.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-medium transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Award size={32} className="text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground">
              To be the leading platform for home services in Ethiopia, fostering transparency, 
              reliability, and customer satisfaction across the service industry.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-medium transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-success-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
            <p className="text-muted-foreground">
              Quality, trust, and innovation drive everything we do. We're committed to connecting 
              homeowners with the best professionals in the industry.
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12 animate-fade-in">
            <h3 className="text-3xl font-bold mb-6 text-center">Our Story</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Fetan was born from recognizing a critical gap in Ethiopia's home service delivery sector. 
                Property owners struggled to locate qualified service providers through conventional, 
                time-consuming methods involving numerous contacts and channels.
              </p>
              <p>
                Developed by a dedicated team of students from Adama Science and Technology University's 
                Department of Computer Science and Engineering, Fetan serves as a centralized digital 
                solution that simplifies the connection between homeowners and certified professionals.
              </p>
              <p>
                Our platform features advanced search capabilities, verified provider profiles, real-time 
                messaging, secure payment processing, and a comprehensive rating system – all designed to 
                enhance transparency and efficiency in the home services market.
              </p>
            </div>

            <div className="mt-12">
              <h4 className="text-xl font-bold mb-6 text-center">Development Team</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary rounded-lg text-center hover:shadow-soft transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 text-primary-foreground font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.id}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 text-muted-foreground">
                <p className="font-semibold">Advisor: Mr. Megersa Dereje</p>
                <p className="text-sm">Adama Science and Technology University</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
