import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Target, Flame, TrendingUp } from "lucide-react";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";

const Dashboard = () => {
  const { isDemoMode, demoUser, demoWorkouts, demoMeals } = useDemoMode();
  const [user, setUser] = useState<unknown>(null);
  const [profile, setProfile] = useState<any>(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [mealCount, setMealCount] = useState(0);
  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDemoMode) {
      setUser(demoUser);
      setProfile({ full_name: demoUser.full_name });
      setWorkoutCount(demoWorkouts.length);
      setMealCount(demoMeals.length);
      setTodayWorkouts(demoWorkouts.filter(w => w.scheduled_date === new Date().toISOString().split('T')[0]));
      setTodayMeals(demoMeals);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate, isDemoMode, demoUser, demoWorkouts, demoMeals]);

  const fetchUserData = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);

    const { data: workouts } = await supabase
      .from("user_workouts")
      .select("*");

    setWorkoutCount(workouts?.length || 0);

    const today = new Date().toISOString().split('T')[0];
    const { data: todaysWorkouts } = await supabase
      .from("user_workouts")
      .select("*")
      .eq("scheduled_date", today);

    setTodayWorkouts(todaysWorkouts || []);

    const { data: meals } = await supabase
      .from("user_meals")
      .select("*");

    setMealCount(meals?.length || 0);

    const { data: todaysMeals } = await supabase
      .from("user_meals")
      .select("*")
      .eq("meal_date", today);

    setTodayMeals(todaysMeals || []);
  };

  const totalNutrition = todayMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fats: acc.fats + meal.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <div className="min-h-screen bg-gradient-dark">
      <DemoBanner />
      <Navigation />

      <div className={`${isDemoMode ? 'pt-32' : 'pt-24'} pb-12`}>
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome Back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{profile?.full_name || 'Athlete'}</span>
            </h1>
            <p className="text-muted-foreground">Here's your fitness summary for today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              label="Today's Workouts"
              value={todayWorkouts.length.toString()}
              target={`${todayWorkouts.filter(w => w.completed).length} completed`}
              progress={todayWorkouts.length > 0 ? (todayWorkouts.filter(w => w.completed).length / todayWorkouts.length) * 100 : 0}
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
              value={workoutCount.toString()}
              target="All time"
              progress={100}
              color="secondary"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Meals"
              value={mealCount.toString()}
              target="All time"
              progress={100}
              color="primary"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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

              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h2 className="text-2xl font-bold mb-4">Today's Workouts</h2>
                {todayWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {todayWorkouts.map((workout) => (
                      <div key={workout.id} className="p-4 bg-background rounded-lg border">
                        <p className="font-semibold">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">{workout.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {workout.completed ? '✓ Completed' : 'Not completed yet'}
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
              <Card className="p-6 bg-gradient-primary">
                <h3 className="text-xl font-bold text-background mb-2">AI Fitness Tip</h3>
                <p className="text-background/90">
                  Try incorporating more compound movements like deadlifts and squats
                  to maximize muscle growth and calorie burn!
                </p>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h3 className="text-xl font-bold mb-4">Nutrition Today</h3>
                <div className="space-y-4">
                  <NutritionBar label="Protein" value={totalNutrition.protein} target={150} color="primary" />
                  <NutritionBar label="Carbs" value={totalNutrition.carbs} target={200} color="secondary" />
                  <NutritionBar label="Fats" value={totalNutrition.fats} target={65} color="muted" />
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate("/workouts")}
                  >
                    Log Workout
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate("/nutrition")}
                  >
                    Add Meal
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate("/community")}
                  >
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

const StatCard = ({ icon: Icon, label, value, target, progress, color }: any) => (
  <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color === 'primary' ? 'bg-primary/20' :
        color === 'secondary' ? 'bg-secondary/20' :
          'bg-destructive/20'
        }`}>
        <Icon className={`h-5 w-5 ${color === 'primary' ? 'text-primary' :
          color === 'secondary' ? 'text-secondary' :
            'text-destructive'
          }`} />
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

const WorkoutItem = ({ exercise, sets, reps, completed }: any) => (
  <div className={`flex items-center justify-between p-4 rounded-lg border ${completed ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'
    }`}>
    <div>
      <p className="font-semibold">{exercise}</p>
      <p className="text-sm text-muted-foreground">{sets} sets × {reps} reps</p>
    </div>
    <div className={`h-6 w-6 rounded-full border-2 ${completed ? 'bg-primary border-primary' : 'border-muted'
      }`}>
      {completed && <span className="block text-background text-xs text-center">✓</span>}
    </div>
  </div>
);

const NutritionBar = ({ label, value, target, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}g / {target}g</span>
    </div>
    <Progress
      value={(value / target) * 100}
      className="h-2"
    />
  </div>
);

export default Dashboard;
