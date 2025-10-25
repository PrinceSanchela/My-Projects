import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, User, Menu, LogOut, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { role } = useUserRole();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-bold text-primary cursor-pointer"
          >
            <img src="/Black and Gold Aesthetic Modern Real Estate Logo.png" alt="logo" style={{ height: "3rem", marginBottom: "16px" }} />
            EstateHub
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="text-foreground hover:text-accent transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/properties")}
              className="text-foreground hover:text-accent transition-colors"
            >
              Properties
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-foreground hover:text-accent transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigate("/community")}
              className="text-foreground hover:text-accent transition-colors"
            >
              Community
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-foreground hover:text-accent transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/wishlist")}>
              <Heart className="h-5 w-5" />
            </Button>
            {session ? (
              <>
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                {role === "admin" && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            {(role === "builder" || role === "admin") && (
              <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate("/list-property")}>
                List Property
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => { navigate("/"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => { navigate("/properties"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                Properties
              </button>
              <button
                onClick={() => { navigate("/community"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                Community
              </button>
              <button
                onClick={() => { navigate("/about"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                About
              </button>
              <button
                onClick={() => { navigate("/wishlist"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                Wishlist
              </button>
              <button
                onClick={() => { navigate("/contact"); setIsMenuOpen(false); }}
                className="text-foreground hover:text-accent transition-colors text-left"
              >
                Contact
              </button>
              <div className="flex flex-col gap-2 pt-2">
                {session ? (
                  <>
                    <Button variant="outline" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    {role === "admin" && (
                      <Button variant="outline" onClick={() => { navigate("/admin"); setIsMenuOpen(false); }}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
                {(role === "builder" || role === "admin") && (
                  <Button className="bg-accent hover:bg-accent/90" onClick={() => { navigate("/list-property"); setIsMenuOpen(false); }}>
                    List Property
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header >
  );
};

export default Header;
