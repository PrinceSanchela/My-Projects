import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Home, TrendingUp } from "lucide-react";

const About = () => {

  useEffect(() => {
    // ✅ Scroll to top whenever this page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality service and results",
    },
    {
      icon: Users,
      title: "Client-Focused",
      description: "Your satisfaction and success are our top priorities",
    },
    {
      icon: Home,
      title: "Integrity",
      description: "Honest, transparent, and ethical in all our dealings",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Using cutting-edge technology to enhance your experience",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About EstateHub
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Your trusted partner in finding the perfect property. We're dedicated to making
                real estate simple, transparent, and accessible for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2024, EstateHub was born from a simple vision: to revolutionize the
                  way people buy, sell, and rent properties. We recognized that the traditional
                  real estate process was often complicated, time-consuming, and stressful.
                </p>
                <p>
                  Our platform combines cutting-edge technology with personalized service to create
                  a seamless experience. Whether you're a first-time buyer, seasoned investor, or
                  looking for your next rental, we're here to guide you every step of the way.
                </p>
                <p>
                  Today, we're proud to serve thousands of clients across 50+ cities, helping them
                  find their dream properties and achieve their real estate goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-accent/10 rounded-full">
                          <Icon className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: "Sarah Johnson", role: "CEO & Founder", initial: "SJ" },
                { name: "Michael Chen", role: "Head of Operations", initial: "MC" },
                { name: "Emily Rodriguez", role: "Lead Agent", initial: "ER" },
              ].map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        {member.initial}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-muted-foreground">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
