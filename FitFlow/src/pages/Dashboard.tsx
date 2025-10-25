import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Target, Flame, TrendingUp } from "lucide-react";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number | null;
  completed: boolean;
  scheduled_date: string;
  user_id: string;
}

const Dashboard = () => {
  const { isDemoMode, demoUser, demoWorkouts, demoMeals } = useDemoMode();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch user profile and data
  useEffect(() => {
    if (isDemoMode) {
      setProfile({ full_name: demoUser.full_name });
      setWorkouts(demoWorkouts);
      setTodayWorkouts(demoWorkouts.filter(w => w.scheduled_date === todayStr));
      setMeals(demoMeals);
      setTodayMeals(demoMeals);
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setProfile({
      full_name: user.displayName || "Athlete",
      email: user.email,
      photoURL: user.photoURL,
    });

    const fetchData = async () => {
      try {
        // Workouts
        const workoutsRef = collection(db, "user_workouts");
        const workoutsQuery = query(workoutsRef, where("user_id", "==", user.uid));
        const workoutSnap = await getDocs(workoutsQuery);
        const workoutsData = workoutSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
        setWorkouts(workoutsData);
        setTodayWorkouts(workoutsData.filter(w => w.scheduled_date === todayStr));

        // Meals (live subscription)
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          const data = docSnap.data() as { meals?: any[] };
          const allMeals = data?.meals || [];
          setMeals(allMeals);
          setTodayMeals(allMeals.filter(m => m.meal_date === todayStr));
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching workouts/meals:", error);
      }
    };

    fetchData();
  }, [user, isDemoMode, demoUser, demoWorkouts, demoMeals, navigate, todayStr]);

  const totalNutrition = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const completedTodayWorkouts = todayWorkouts.filter(w => w.completed).length;
  const totalTodayWorkouts = todayWorkouts.length;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <DemoBanner />
      <Navigation />

      <div className={`${isDemoMode ? "pt-32" : "pt-24"} pb-12`}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome Back,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {profile?.full_name || "Athlete"}
              </span>
            </h1>
            <p className="text-muted-foreground">Here's your fitness summary for today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              label="Today's Workouts"
              value={totalTodayWorkouts.toString()}
              target={`${completedTodayWorkouts} completed`}
              progress={totalTodayWorkouts ? (completedTodayWorkouts / totalTodayWorkouts) * 100 : 0}
              color="primary"
            />
            <StatCard
              icon={Flame}
              label="Calories Today"
              value={totalNutrition.calories.toString()}
              target="2000 goal"
              progress={(totalNutrition.calories / 2000) * 100}
              color="destructive"
            />
            <StatCard
              icon={Target}
              label="Total Workouts"
              value={workouts.length.toString()}
              target="All time"
              progress={100}
              color="secondary"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Meals"
              value={meals.length.toString()}
              target="All time"
              progress={100}
              color="primary"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Progress */}
              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h2 className="text-2xl font-bold mb-4">Weekly Progress</h2>
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <img
                    src={dashboardBg}
                    alt="Analytics"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              </Card>

              {/* Today's Workouts */}
              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h2 className="text-2xl font-bold mb-4">Today's Workouts</h2>
                {todayWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {todayWorkouts.map(workout => (
                      <div key={workout.id} className="p-4 bg-background rounded-lg border">
                        <p className="font-semibold">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">{workout.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {workout.completed ? "✓ Completed" : "Not completed yet"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No workouts scheduled for today</p>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              {/* AI Fitness Tip */}
              <Card className="p-6 bg-gradient-primary">
                <h3 className="text-xl font-bold text-background mb-2">AI Fitness Tip</h3>
                <p className="text-background/90">
                  Try incorporating more compound movements like deadlifts and squats
                  to maximize muscle growth and calorie burn!
                </p>
              </Card>

              {/* Nutrition Today */}
              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h3 className="text-xl font-bold mb-4">Nutrition Today</h3>
                <div className="space-y-4">
                  <NutritionBar label="Protein" value={totalNutrition.protein} target={150} color="primary" />
                  <NutritionBar label="Carbs" value={totalNutrition.carbs} target={200} color="secondary" />
                  <NutritionBar label="Fats" value={totalNutrition.fats} target={65} color="muted" />
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/workouts")}>
                    Log Workout
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/nutrition")}>
                    Add Meal
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/community")}>
                    View Community
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, target, progress, color }: any) => (
  <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color === "primary" ? "bg-primary/20" : color === "secondary" ? "bg-secondary/20" : "bg-destructive/20"}`}>
        <Icon className={`h-5 w-5 ${color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-destructive"}`} />
      </div>
    </div>
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">/ {target}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  </Card>
);

// NutritionBar Component
const NutritionBar = ({ label, value, target, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}g / {target}g</span>
    </div>
    <Progress value={(value / target) * 100} className="h-2" />
  </div>
);

export default Dashboard;
