import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Activity, Brain, UtensilsCrossed, Users, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fitness.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                AI-powered workout plans, nutrition tracking, and a supportive community
                to help you reach your fitness goals faster.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="gap-2">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="glass" size="lg" className="gap-2">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Fitness Hero"
                className="relative rounded-2xl shadow-2xl border border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Crush Your Goals
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to keep you motivated and on track
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all hover:scale-105 group"
              >
                <div className="mb-4 p-3 bg-gradient-primary rounded-lg w-fit group-hover:shadow-glow transition-shadow">
                  <feature.icon className="h-6 w-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-background">
                Ready to Start Your Journey?
              </h2>
              <p className="text-background/80 text-lg max-w-2xl mx-auto">
                Join thousands of users transforming their lives with AI-powered fitness
              </p>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="bg-background text-primary hover:bg-background/90 border-none">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="font-semibold">FitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FitFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Brain,
    title: "AI Workout Plans",
    description: "Personalized workout routines generated by AI based on your goals and fitness level"
  },
  {
    icon: Activity,
    title: "Progress Tracking",
    description: "Detailed analytics and charts to visualize your fitness journey over time"
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrition Guide",
    description: "Smart meal planning and calorie tracking to fuel your workouts properly"
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with others, share progress, and stay motivated together"
  }
];

export default Landing;
