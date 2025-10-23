import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";

const Profile = () => {
  const { isDemoMode, demoUser, demoWorkouts, demoMeals, demoPosts } = useDemoMode();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDemoMode) {
      setUser(demoUser);
      setProfile({
        full_name: demoUser.full_name,
        email: demoUser.email
      });
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate, isDemoMode, demoUser]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || ""
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <Navigation />
      
      <main className={`container mx-auto px-4 ${isDemoMode ? 'pt-32' : 'pt-24'} pb-12`}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage your account information
          </p>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    className="pl-10"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Your email"
                    className="pl-10"
                    value={profile.email}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>

          <AccountStats userId={user?.id} />
        </div>
      </main>
    </div>
  );
};

const AccountStats = ({ userId }: { userId?: string }) => {
  const { isDemoMode, demoWorkouts, demoMeals, demoPosts } = useDemoMode();
  const [stats, setStats] = useState({ workouts: 0, meals: 0, posts: 0 });

  useEffect(() => {
    if (isDemoMode) {
      setStats({
        workouts: demoWorkouts.length,
        meals: demoMeals.length,
        posts: demoPosts.length
      });
      return;
    }
    
    if (userId) {
      fetchStats(userId);
    }
  }, [userId, isDemoMode, demoWorkouts, demoMeals, demoPosts]);

  const fetchStats = async (userId: string) => {
    const { data: workouts } = await supabase
      .from("user_workouts")
      .select("id", { count: 'exact' })
      .eq("user_id", userId);

    const { data: meals } = await supabase
      .from("user_meals")
      .select("id", { count: 'exact' })
      .eq("user_id", userId);

    const { data: posts } = await supabase
      .from("community_posts")
      .select("id", { count: 'exact' })
      .eq("user_id", userId);

    setStats({
      workouts: workouts?.length || 0,
      meals: meals?.length || 0,
      posts: posts?.length || 0
    });
  };

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Account Stats</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{stats.workouts}</p>
          <p className="text-sm text-muted-foreground">Workouts</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.meals}</p>
          <p className="text-sm text-muted-foreground">Meals</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.posts}</p>
          <p className="text-sm text-muted-foreground">Posts</p>
        </div>
      </div>
    </Card>
  );
};

export default Profile;
