import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  demoUser: {
    id: string;
    email: string;
    full_name: string;
  };
  demoWorkouts: any[];
  demoMeals: any[];
  demoPosts: any[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoProvider");
  }
  return context;
};

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const demoUser = {
    id: "demo-user-id",
    email: "demo@fitflow.app",
    full_name: "Demo Athlete"
  };

  const demoWorkouts = [
    {
      id: "demo-workout-1",
      name: "Morning Strength Training",
      description: "Full body workout focusing on compound movements",
      completed: true,
      scheduled_date: new Date().toISOString().split('T')[0],
      duration: 45,
      exercises: [
        { name: "Squats", sets: 4, reps: 10, weight: 135 },
        { name: "Bench Press", sets: 4, reps: 8, weight: 185 },
        { name: "Deadlifts", sets: 3, reps: 6, weight: 225 }
      ]
    },
    {
      id: "demo-workout-2",
      name: "Evening Cardio",
      description: "30 minutes of interval running",
      completed: false,
      scheduled_date: new Date().toISOString().split('T')[0],
      duration: 30,
      exercises: [
        { name: "Running", sets: 6, reps: 1, duration: "5 min intervals" }
      ]
    },
    {
      id: "demo-workout-3",
      name: "Upper Body Focus",
      description: "Chest and back day",
      completed: true,
      scheduled_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      duration: 60,
      exercises: [
        { name: "Pull-ups", sets: 4, reps: 12 },
        { name: "Dumbbell Press", sets: 4, reps: 10, weight: 70 }
      ]
    }
  ];

  const demoMeals = [
    {
      id: "demo-meal-1",
      meal_name: "Protein Power Breakfast",
      meal_type: "breakfast",
      calories: 450,
      protein: 35,
      carbs: 45,
      fats: 15,
      meal_date: new Date().toISOString().split('T')[0]
    },
    {
      id: "demo-meal-2",
      meal_name: "Grilled Chicken Salad",
      meal_type: "lunch",
      calories: 550,
      protein: 45,
      carbs: 35,
      fats: 22,
      meal_date: new Date().toISOString().split('T')[0]
    },
    {
      id: "demo-meal-3",
      meal_name: "Salmon with Quinoa",
      meal_type: "dinner",
      calories: 680,
      protein: 48,
      carbs: 55,
      fats: 28,
      meal_date: new Date().toISOString().split('T')[0]
    },
    {
      id: "demo-meal-4",
      meal_name: "Greek Yogurt & Berries",
      meal_type: "snack",
      calories: 220,
      protein: 18,
      carbs: 28,
      fats: 5,
      meal_date: new Date().toISOString().split('T')[0]
    }
  ];

  const demoPosts = [
    {
      id: "demo-post-1",
      title: "Just hit a new PR on deadlifts! 💪",
      content: "After months of consistent training, I finally pulled 315lbs for 5 reps! The key was focusing on form and progressive overload. Keep pushing, everyone!",
      category: "progress",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_id: demoUser.id,
      comments_count: 12,
      profile: {
        full_name: demoUser.full_name,
        avatar_url: null
      }
    },
    {
      id: "demo-post-2",
      title: "Meal prep Sunday success! 🥗",
      content: "Prepared all my meals for the week. Grilled chicken, brown rice, and tons of veggies. Staying consistent with nutrition is the real game changer!",
      category: "nutrition",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_id: demoUser.id,
      comments_count: 8,
      profile: {
        full_name: demoUser.full_name,
        avatar_url: null
      }
    }
  ];

  const value = {
    isDemoMode,
    setIsDemoMode,
    demoUser,
    demoWorkouts,
    demoMeals,
    demoPosts
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
