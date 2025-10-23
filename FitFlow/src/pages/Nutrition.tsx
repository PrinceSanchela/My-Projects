import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, Plus, Edit, Trash2, Apple, Coffee, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";

interface Meal {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_date: string;
  user_id: string;
}

const Nutrition = () => {
  const { isDemoMode, demoMeals } = useDemoMode();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [newMeal, setNewMeal] = useState({
    meal_name: "",
    meal_type: "breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isDemoMode) {
      setMeals(demoMeals as Meal[]);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, demoMeals]);

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("user_meals")
      .select("*")
      .eq("meal_date", today)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching meals", variant: "destructive" });
      return;
    }

    setMeals(data as Meal[]);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to log meals", variant: "destructive" });
      return;
    }

    if (!newMeal.meal_name || !newMeal.calories) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const mealData = {
      meal_name: newMeal.meal_name,
      meal_type: newMeal.meal_type,
      calories: parseInt(newMeal.calories),
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      user_id: user.id
    };

    if (editingMeal) {
      const { error } = await supabase
        .from("user_meals")
        .update(mealData)
        .eq("id", editingMeal.id);

      if (error) {
        toast({ title: "Error updating meal", variant: "destructive" });
      } else {
        toast({ title: "Meal updated successfully" });
        setIsDialogOpen(false);
        setEditingMeal(null);
        resetForm();
        fetchMeals();
      }
    } else {
      const { error } = await supabase
        .from("user_meals")
        .insert(mealData);

      if (error) {
        toast({ title: "Error logging meal", variant: "destructive" });
      } else {
        toast({ title: "Meal logged successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchMeals();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("user_meals")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting meal", variant: "destructive" });
    } else {
      toast({ title: "Meal deleted successfully" });
      fetchMeals();
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setNewMeal({
      meal_name: meal.meal_name,
      meal_type: meal.meal_type,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewMeal({
      meal_name: "",
      meal_type: "breakfast",
      calories: "",
      protein: "",
      carbs: "",
      fats: ""
    });
  };

  const totalNutrition = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fats: acc.fats + meal.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return Coffee;
      case 'lunch': return Apple;
      case 'dinner': return UtensilsCrossed;
      default: return Moon;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nutrition Tracker
            </h1>
            <p className="text-muted-foreground">
              Track your daily meals and nutrition goals
            </p>
          </div>
          
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingMeal(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMeal ? "Edit Meal" : "Log New Meal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Meal Name</label>
                    <Input
                      placeholder="e.g., Grilled Chicken Salad"
                      value={newMeal.meal_name}
                      onChange={(e) => setNewMeal({ ...newMeal, meal_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Meal Type</label>
                    <Select value={newMeal.meal_type} onValueChange={(value) => setNewMeal({ ...newMeal, meal_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Calories</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newMeal.calories}
                        onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newMeal.protein}
                        onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newMeal.carbs}
                        onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Fats (g)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newMeal.fats}
                        onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingMeal ? "Update Meal" : "Log Meal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {user && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Calories</h3>
              <p className="text-2xl font-bold">{totalNutrition.calories}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Protein</h3>
              <p className="text-2xl font-bold">{totalNutrition.protein}g</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Carbs</h3>
              <p className="text-2xl font-bold">{totalNutrition.carbs}g</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-muted-foreground mb-1">Fats</h3>
              <p className="text-2xl font-bold">{totalNutrition.fats}g</p>
            </Card>
          </div>
        )}

        <div className="grid gap-6">
          {meals.map((meal) => {
            const Icon = getMealIcon(meal.meal_type);
            return (
              <Card key={meal.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {meal.meal_type}
                      </span>
                      <h2 className="text-xl font-bold mt-2">{meal.meal_name}</h2>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{meal.calories} cal</span>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fats}g</span>
                      </div>
                    </div>
                  </div>
                  {user?.id === meal.user_id && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(meal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {!user && (
          <Card className="p-8 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">Sign in to track your nutrition</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </Card>
        )}

        {user && meals.length === 0 && (
          <Card className="p-8 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">No meals logged today. Start tracking!</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Nutrition;
