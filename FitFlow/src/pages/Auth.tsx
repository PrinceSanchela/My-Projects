import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, User as UserIcon, Sparkles, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoContext";
import { auth, db } from "@/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsDemoMode } = useDemoMode();

  // 🔹 Demo Mode
  const handleDemoMode = () => {
    setIsDemoMode(true);
    toast({ title: "Demo Mode Activated! 🎉", description: "Explore all features with sample data" });
    navigate("/dashboard");
  };

  // 🔹 Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔹 Create default data for new users
  const createDefaultData = async (uid: string) => {
    await setDoc(doc(db, "workouts", `${uid}-workout-1`), {
      userId: uid,
      name: "Full Body Warmup",
      description: "10 min full body warmup",
      scheduled_date: new Date().toISOString().split("T")[0],
      completed: false
    });
    await setDoc(doc(db, "meals", `${uid}-meal-1`), {
      userId: uid,
      name: "Protein Breakfast",
      calories: 350,
      protein: 30,
      carbs: 40,
      fats: 10,
      scheduled_date: new Date().toISOString().split("T")[0]
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password || (!isLogin && !formData.fullName)) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // 🔹 Sign In
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "Welcome back!", description: "Signed in successfully" });
      } else {
        // 🔹 Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: formData.fullName });
          await createDefaultData(auth.currentUser.uid);
        }
        toast({ title: "Account created! 🎉", description: "Welcome to FitFlow" });
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) await createDefaultData(result.user.uid);
      toast({ title: "Welcome! 👋", description: "Signed in successfully with Google" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Sign in to continue your fitness journey"
              : "Join FitFlow and start your transformation"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ email: "", password: "", fullName: "" });
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full gap-2 border-gray-300 hover:border-primary hover:bg-primary/10"
            disabled={loading}
          >
            <Chrome className="h-4 w-4 text-primary" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={handleDemoMode}
            className="w-full gap-2 border-primary/50 hover:border-primary hover:bg-primary/10"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Try Demo Mode
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full gap-2"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
