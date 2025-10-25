import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, Plus, Edit, Trash2, Apple, Coffee, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoContext";
import { db, auth } from "@/firebase/firebaseConfig";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

interface Meal {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_date: string;
}

const mealColors: Record<string, string> = {
  breakfast: "#facc15",
  lunch: "#22c55e",
  dinner: "#8b5cf6",
  snack: "#3b82f6",
};

const nutrientColors: Record<string, string> = {
  calories: "url(#grad-calories)",
  protein: "url(#grad-protein)",
  carbs: "url(#grad-carbs)",
  fats: "url(#grad-fats)",
};

const mealOrder: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
};

const dailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fats: 70,
};

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
    fats: "",
    meal_date: dayjs().format("YYYY-MM-DD"),
  });
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Sync with Dashboard via Firestore
  useEffect(() => {
    if (isDemoMode) {
      setMeals(demoMeals as Meal[]);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribeAuth();
  }, [isDemoMode, demoMeals]);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.data() as { meals?: Meal[] };
      if (data?.meals) {
        const filteredMeals = data.meals.filter((meal) => meal.meal_date === selectedDate);
        filteredMeals.sort((a, b) => (mealOrder[a.meal_type] || 5) - (mealOrder[b.meal_type] || 5));
        setMeals(filteredMeals);
      } else setMeals([]);
    });
    return () => unsubscribe();
  }, [user, selectedDate]);

  const saveMealsToUserProfile = async (allMeals: Meal[]) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { meals: allMeals }, { merge: true });
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

    const mealData: Meal = {
      id: editingMeal?.id || `${Date.now()}`,
      meal_name: newMeal.meal_name,
      meal_type: newMeal.meal_type,
      calories: parseInt(newMeal.calories),
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      meal_date: newMeal.meal_date || dayjs().format("YYYY-MM-DD"),
    };

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const allMeals: Meal[] = userDocSnap.exists() ? (userDocSnap.data().meals || []) : [];

    const updatedMeals = editingMeal
      ? allMeals.map((meal) => (meal.id === editingMeal.id ? mealData : meal))
      : [...allMeals, mealData];

    await saveMealsToUserProfile(updatedMeals);
    toast({ title: editingMeal ? "Meal updated successfully" : "Meal logged successfully" });
    setIsDialogOpen(false);
    setEditingMeal(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const allMeals: Meal[] = userDocSnap.exists() ? (userDocSnap.data().meals || []) : [];
    const updatedMeals = allMeals.filter((meal) => meal.id !== id);
    await saveMealsToUserProfile(updatedMeals);
    toast({ title: "Meal deleted successfully" });
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setNewMeal({
      meal_name: meal.meal_name,
      meal_type: meal.meal_type,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString(),
      meal_date: meal.meal_date,
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
      fats: "",
      meal_date: selectedDate,
    });
  };

  const totalNutrition = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const completionPercent = Math.min(
    Math.round(
      ((totalNutrition.calories / dailyGoals.calories +
        totalNutrition.protein / dailyGoals.protein +
        totalNutrition.carbs / dailyGoals.carbs +
        totalNutrition.fats / dailyGoals.fats) /
        4) *
      100
    ),
    100
  );

  const chartData = [
    { name: "Calories", value: totalNutrition.calories, color: nutrientColors.calories },
    { name: "Protein", value: totalNutrition.protein, color: nutrientColors.protein },
    { name: "Carbs", value: totalNutrition.carbs, color: nutrientColors.carbs },
    { name: "Fats", value: totalNutrition.fats, color: nutrientColors.fats },
  ];

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast": return Coffee;
      case "lunch": return Apple;
      case "dinner": return UtensilsCrossed;
      default: return Moon;
    }
  };

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nutrition Tracker
            </h1>
            <p className="text-muted-foreground">Track your daily meals and nutrition goals</p>
          </div>
          {user && (
            <div className="flex gap-4 flex-wrap items-center">
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingMeal(null); resetForm(); } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Log Meal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMeal ? "Edit Meal" : "Log New Meal"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <InputField label="Meal Name" value={newMeal.meal_name} onChange={(val) => setNewMeal({ ...newMeal, meal_name: val })} />
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meal Type</label>
                      <Select value={newMeal.meal_type} onValueChange={(value) => setNewMeal({ ...newMeal, meal_type: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Calories" type="number" value={newMeal.calories} onChange={(val) => setNewMeal({ ...newMeal, calories: val })} />
                      <InputField label="Protein (g)" type="number" value={newMeal.protein} onChange={(val) => setNewMeal({ ...newMeal, protein: val })} />
                      <InputField label="Carbs (g)" type="number" value={newMeal.carbs} onChange={(val) => setNewMeal({ ...newMeal, carbs: val })} />
                      <InputField label="Fats (g)" type="number" value={newMeal.fats} onChange={(val) => setNewMeal({ ...newMeal, fats: val })} />
                    </div>
                    <Button onClick={handleSubmit} className="w-full">{editingMeal ? "Update Meal" : "Log Meal"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        {user && (
          <Card className="p-6 mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="grad-calories" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="grad-protein" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="grad-carbs" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#facc15" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="grad-fats" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  activeIndex={activeIndex ?? undefined}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Pie
                  data={[
                    { name: "Completion", value: completionPercent },
                    { name: "Remaining", value: 100 - completionPercent },
                  ]}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={50}
                  outerRadius={65}
                  stroke="none"
                >
                  <Cell key="completion" fill="#3b82f6" /> {/* Blue for completion */}
                  <Cell key="remaining" fill="#d1d5db" />  {/* Gray for remaining */}
                </Pie>

                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-lg font-semibold">
              Daily Completion: {completionPercent}%
            </div>
          </Card>
        )}

        {/* Meal List */}
        <AnimatePresence>
          <div className="grid gap-6">
            {meals.map((meal) => {
              const Icon = getMealIcon(meal.meal_type);
              return (
                <motion.div key={meal.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} layout>
                  <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: mealColors[meal.meal_type] }}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">{meal.meal_type}</span>
                          <h2 className="text-xl font-bold mt-2">{meal.meal_name}</h2>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(meal.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Nutrition;

const InputField = ({
  label,
  value,
  onChange,
  type = "text", // default to text
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: "text" | "number";
}) => (
  <div>
    <label className="text-sm font-medium mb-2 block">{label}</label>
    <Input
      type={type}
      placeholder={type === "number" ? "0" : ""}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

