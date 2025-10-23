import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface Workout {
  id: string;
  name: string;
  description: string | null;
  exercises: Exercise[];
  duration: number | null;
  completed: boolean;
  scheduled_date: string | null;
  user_id: string;
}

const Workouts = () => {
  const { isDemoMode, demoWorkouts } = useDemoMode();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    duration: "",
    exercises: [{ name: "", sets: 3, reps: 10 }]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isDemoMode) {
      setWorkouts(demoWorkouts as Workout[]);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, demoWorkouts]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from("user_workouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching workouts", variant: "destructive" });
      return;
    }

    setWorkouts((data || []).map(workout => ({
      ...workout,
      exercises: Array.isArray(workout.exercises) ? workout.exercises as unknown as Exercise[] : []
    })));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to create workouts", variant: "destructive" });
      return;
    }

    if (!newWorkout.name) {
      toast({ title: "Please enter workout name", variant: "destructive" });
      return;
    }

    const workoutData = {
      name: newWorkout.name,
      description: newWorkout.description || null,
      duration: newWorkout.duration ? parseInt(newWorkout.duration) : null,
      exercises: newWorkout.exercises.filter(e => e.name),
      user_id: user.id
    };

    if (editingWorkout) {
      const { error } = await supabase
        .from("user_workouts")
        .update(workoutData)
        .eq("id", editingWorkout.id);

      if (error) {
        toast({ title: "Error updating workout", variant: "destructive" });
      } else {
        toast({ title: "Workout updated successfully" });
        setIsDialogOpen(false);
        setEditingWorkout(null);
        resetForm();
        fetchWorkouts();
      }
    } else {
      const { error } = await supabase
        .from("user_workouts")
        .insert(workoutData);

      if (error) {
        toast({ title: "Error creating workout", variant: "destructive" });
      } else {
        toast({ title: "Workout created successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchWorkouts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("user_workouts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting workout", variant: "destructive" });
    } else {
      toast({ title: "Workout deleted successfully" });
      fetchWorkouts();
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      name: workout.name,
      description: workout.description || "",
      duration: workout.duration?.toString() || "",
      exercises: workout.exercises.length > 0 ? workout.exercises : [{ name: "", sets: 3, reps: 10 }]
    });
    setIsDialogOpen(true);
  };

  const toggleComplete = async (workout: Workout) => {
    const { error } = await supabase
      .from("user_workouts")
      .update({ completed: !workout.completed })
      .eq("id", workout.id);

    if (error) {
      toast({ title: "Error updating workout", variant: "destructive" });
    } else {
      fetchWorkouts();
    }
  };

  const resetForm = () => {
    setNewWorkout({
      name: "",
      description: "",
      duration: "",
      exercises: [{ name: "", sets: 3, reps: 10 }]
    });
  };

  const addExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, { name: "", sets: 3, reps: 10 }]
    });
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...newWorkout.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setNewWorkout({ ...newWorkout, exercises: updated });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Workouts
            </h1>
            <p className="text-muted-foreground">
              Create and track your personalized workout routines
            </p>
          </div>
          
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingWorkout(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingWorkout ? "Edit Workout" : "Create New Workout"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Workout Name</label>
                    <Input
                      placeholder="e.g., Push Day, Leg Day"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      placeholder="e.g., Chest, Shoulders, Triceps"
                      value={newWorkout.description}
                      onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Exercises</label>
                      <Button type="button" size="sm" variant="outline" onClick={addExercise}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Exercise
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {newWorkout.exercises.map((exercise, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Exercise name"
                            value={exercise.name}
                            onChange={(e) => updateExercise(index, "name", e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Sets"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value))}
                          />
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={handleSubmit} className="w-full">
                    {editingWorkout ? "Update Workout" : "Create Workout"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6">
          {workouts.map((workout) => (
            <Card key={workout.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{workout.name}</h2>
                  {workout.description && (
                    <p className="text-muted-foreground mb-2">{workout.description}</p>
                  )}
                  {workout.duration && (
                    <p className="text-sm text-muted-foreground">Duration: {workout.duration} min</p>
                  )}
                </div>
                {user?.id === workout.user_id && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(workout)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(workout.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {workout.exercises.map((exercise, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.sets} × {exercise.reps}</p>
                  </div>
                ))}
              </div>
              
              <Button 
                variant={workout.completed ? "default" : "outline"} 
                className="w-full"
                onClick={() => toggleComplete(workout)}
              >
                {workout.completed ? '✓ Completed' : 'Mark as Complete'}
              </Button>
            </Card>
          ))}
        </div>

        {!user && (
          <Card className="p-8 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">Sign in to create and track your workouts</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </Card>
        )}

        {user && workouts.length === 0 && (
          <Card className="p-8 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">No workouts yet. Create your first workout!</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Workouts;
