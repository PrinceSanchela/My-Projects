import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dumbbell,
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  User,
  LogOut,
  Menu,
  Settings
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // 🔹 Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Sign out function
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
    }
  };

  const NavLinks = () => (
    <>
      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
        <Button variant={isActive("/dashboard") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Button>
      </Link>
      <Link to="/workouts" onClick={() => setMobileOpen(false)}>
        <Button variant={isActive("/workouts") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
          <Dumbbell className="h-4 w-4" /> Workouts
        </Button>
      </Link>
      <Link to="/nutrition" onClick={() => setMobileOpen(false)}>
        <Button variant={isActive("/nutrition") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
          <UtensilsCrossed className="h-4 w-4" /> Nutrition
        </Button>
      </Link>
      <Link to="/community" onClick={() => setMobileOpen(false)}>
        <Button variant={isActive("/community") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
          <Users className="h-4 w-4" /> Community
        </Button>
      </Link>
      {user && (
        <>
          <Link to="/profile" onClick={() => setMobileOpen(false)}>
            <Button variant={isActive("/profile") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
              <User className="h-4 w-4" /> {user.displayName || "Profile"}
            </Button>
          </Link>
          <Link to="/settings" onClick={() => setMobileOpen(false)}>
            <Button variant={isActive("/settings") ? "default" : "ghost"} size="sm" className="gap-2 w-full justify-start">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg group-hover:scale-110 transition-transform">
              <Dumbbell className="h-6 w-6 text-background" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FitFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden nav-md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Desktop Actions */}
          <div className="hidden nav-md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <User className="h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex nav-md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="border-t pt-4">
                    {user ? (
                      <Button onClick={() => { handleSignOut(); setMobileOpen(false); }} variant="ghost" size="sm" className="gap-2 w-full justify-start">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>
                        <Button variant="default" size="sm" className="gap-2 w-full">
                          <User className="h-4 w-4" /> Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
