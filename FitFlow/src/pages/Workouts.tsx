import { useState, useEffect, useMemo, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/contexts/DemoContext";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg, EventDropArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  type?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number | null;
  completed: boolean;
  scheduled_date: string;
  user_id: string;
}

const exerciseTypes = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Cardio", "Other"];
const typeColors: Record<string, string> = {
  Chest: "#3b82f6",
  Back: "#8b5cf6",
  Legs: "#f87171",
  Shoulders: "#fbbf24",
  Arms: "#10b981",
  Cardio: "#f472b6",
  Other: "#6b7280"
};

const Workouts = () => {
  const { isDemoMode, demoWorkouts } = useDemoMode();
  const [user, setUser] = useState<any>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    duration: "",
    scheduled_date: "",
    exercises: [{ name: "", sets: 3, reps: 10, weight: 0, type: "Other" }]
  });
  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "listWeek">("dayGridMonth");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { toast } = useToast();
  const calendarRef = useRef<FullCalendar>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch workouts
  useEffect(() => {
    if (isDemoMode) {
      setWorkouts(demoWorkouts as Workout[]);
      return;
    }
    if (!user) return;

    const workoutsCol = collection(db, "user_workouts");
    const q = query(workoutsCol, orderBy("scheduled_date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Workout))
        .filter(w => w.user_id === user.uid);
      setWorkouts(data);
    });

    return () => unsubscribe();
  }, [user, isDemoMode, demoWorkouts]);

  // Apply filters
  useEffect(() => {
    let filtered = [...workouts];
    if (filterType !== "All") {
      filtered = filtered.filter(w => w.exercises.some(ex => ex.type === filterType));
    }
    if (filterStatus === "Completed") filtered = filtered.filter(w => w.completed);
    if (filterStatus === "Incomplete") filtered = filtered.filter(w => !w.completed);
    setFilteredWorkouts(filtered);
  }, [workouts, filterType, filterStatus]);

  const resetForm = () => {
    setNewWorkout({
      name: "",
      description: "",
      duration: "",
      scheduled_date: "",
      exercises: [{ name: "", sets: 3, reps: 10, weight: 0, type: "Other" }]
    });
  };

  const handleSubmit = async () => {
    if (!user) return toast({ title: "Sign in required", variant: "destructive" });
    if (!newWorkout.name || !newWorkout.scheduled_date) return toast({ title: "Name and date required", variant: "destructive" });

    const workoutData = {
      ...newWorkout,
      duration: newWorkout.duration ? parseInt(newWorkout.duration) : null,
      exercises: newWorkout.exercises.filter(e => e.name),
      completed: false,
      user_id: user.uid
    };

    try {
      if (editingWorkout) {
        const workoutRef = doc(db, "user_workouts", editingWorkout.id);
        await updateDoc(workoutRef, workoutData);
        toast({ title: "Workout updated!" });
      } else {
        await addDoc(collection(db, "user_workouts"), workoutData);
        toast({ title: "Workout created!" });
      }
      setIsDialogOpen(false);
      setEditingWorkout(null);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "user_workouts", id));
      toast({ title: "Workout deleted" });
    } catch (err: any) {
      toast({ title: "Error deleting workout", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      name: workout.name,
      description: workout.description,
      duration: workout.duration?.toString() || "",
      scheduled_date: workout.scheduled_date,
      exercises: workout.exercises.length > 0 ? workout.exercises : [{ name: "", sets: 3, reps: 10, weight: 0, type: "Other" }]
    });
    setIsDialogOpen(true);
  };

  const toggleComplete = async (workout: Workout) => {
    if (!user) return;
    const workoutRef = doc(db, "user_workouts", workout.id);
    await updateDoc(workoutRef, { completed: !workout.completed });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const updatedExercises = Array.from(newWorkout.exercises);
    const [removed] = updatedExercises.splice(result.source.index, 1);
    updatedExercises.splice(result.destination.index, 0, removed);
    setNewWorkout({ ...newWorkout, exercises: updatedExercises });
  };

  const addExercise = () => setNewWorkout({
    ...newWorkout,
    exercises: [...newWorkout.exercises, { name: "", sets: 3, reps: 10, weight: 0, type: "Other" }]
  });

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...newWorkout.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setNewWorkout({ ...newWorkout, exercises: updated });
  };

  const events = filteredWorkouts.map(w => ({
    id: w.id,
    title: w.name,
    date: w.scheduled_date,
    backgroundColor: w.completed ? "#10b981" : typeColors[w.exercises[0]?.type || "Other"],
    borderColor: w.completed ? "#10b981" : typeColors[w.exercises[0]?.type || "Other"],
    extendedProps: { exercises: w.exercises, duration: w.duration, description: w.description }
  }));

  const renderEventContent = (eventInfo: any) => {
    const { title, extendedProps } = eventInfo.event;
    return (
      <div
        className="text-sm font-semibold text-white cursor-pointer"
        onMouseEnter={(e) =>
          tippy(e.currentTarget, {
            content: `<b>${title}</b><br/>${extendedProps.description || ""}<br/>Duration: ${extendedProps.duration || 0} min<br/>Exercises: ${extendedProps.exercises.map((ex: Exercise) => `${ex.name} ${ex.sets}×${ex.reps} ${ex.weight || 0}kg (${ex.type || "Other"})`).join(", ")}`,
            allowHTML: true,
            placement: "top",
          })
        }
      >
        {title}
      </div>
    );
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const workoutRef = doc(db, "user_workouts", info.event.id);
    await updateDoc(workoutRef, { scheduled_date: info.event.startStr });
  };

  const handleEventClick = (info: EventClickArg) => {
    const workout = workouts.find(w => w.id === info.event.id);
    if (workout) handleEdit(workout);
  };

  const todayWorkouts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return workouts.filter(w => w.scheduled_date === today);
  }, [workouts]);

  const changeCalendarView = (view: "dayGridMonth" | "timeGridWeek" | "listWeek") => {
    setCalendarView(view);
    if (calendarRef.current) calendarRef.current.getApi().changeView(view);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 grid md:grid-cols-4 gap-6">

        {/* Left Column: Calendar + Filters */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">My Workouts</h1>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => changeCalendarView("dayGridMonth")}>Month</Button>
              <Button size="sm" onClick={() => changeCalendarView("timeGridWeek")}>Week</Button>
              <Button size="sm" onClick={() => changeCalendarView("listWeek")}>List</Button>
              <Button size="sm" onClick={() => { setIsDialogOpen(true); setEditingWorkout(null); resetForm(); }}><Plus /></Button>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Filter Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {exerciseTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workout List */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {filteredWorkouts.map(w => (
              <Card key={w.id} className="p-4 shadow-lg hover:shadow-2xl transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-bold text-lg">{w.name}</h2>
                    <p className="text-sm text-muted-foreground">{w.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {w.duration || 0} min | Scheduled: {w.scheduled_date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(w)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {w.exercises.map((ex, i) => (
                    <span key={i} className="px-2 py-1 rounded text-white text-xs font-medium" style={{ backgroundColor: typeColors[ex.type || "Other"] }}>
                      {ex.name} {ex.sets}×{ex.reps} {ex.weight || 0}kg
                    </span>
                  ))}
                </div>
                <Button variant={w.completed ? "default" : "outline"} className="w-full" onClick={() => toggleComplete(w)}>
                  {w.completed ? "✓ Completed" : "Mark as Complete"}
                </Button>
              </Card>
            ))}
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={calendarView}
            events={events}
            eventContent={renderEventContent}
            editable={true}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            height="auto"
          />

        </div>

        {/* Sidebar: Today's Workouts */}
        <div className="hidden md:block space-y-4">
          <Card className="p-4">
            <h2 className="font-bold text-lg mb-2">Today's Workouts</h2>
            {todayWorkouts.length === 0 ? (
              <p className="text-muted-foreground">No workouts scheduled today.</p>
            ) : todayWorkouts.map(w => (
              <Card key={w.id} className="p-2 mb-2 border-l-4 border-primary">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{w.name}</p>
                  <CheckCircle className={`h-5 w-5 ${w.completed ? "text-green-500" : "text-gray-400"}`} />
                </div>
              </Card>
            ))}
          </Card>
        </div>

        {/* Create / Edit Workout Modal */}
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingWorkout(null); resetForm(); } }}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingWorkout ? "Edit Workout" : "Create New Workout"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Workout Name" value={newWorkout.name} onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })} />
                <Input placeholder="Description" value={newWorkout.description} onChange={e => setNewWorkout({ ...newWorkout, description: e.target.value })} />
                <Input type="number" placeholder="Duration (minutes)" value={newWorkout.duration} onChange={e => setNewWorkout({ ...newWorkout, duration: e.target.value })} />
                <Input type="date" value={newWorkout.scheduled_date} onChange={e => setNewWorkout({ ...newWorkout, scheduled_date: e.target.value })} />

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="exercises">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {newWorkout.exercises.map((ex, idx) => (
                          <Draggable key={idx} draggableId={String(idx)} index={idx}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="grid grid-cols-5 gap-2 items-center mb-1">
                                <Input placeholder="Name" value={ex.name} onChange={e => updateExercise(idx, "name", e.target.value)} />
                                <Input type="number" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(idx, "sets", parseInt(e.target.value))} />
                                <Input type="number" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(idx, "reps", parseInt(e.target.value))} />
                                <Input type="number" placeholder="Weight kg" value={ex.weight} onChange={e => updateExercise(idx, "weight", parseInt(e.target.value))} />
                                <Select value={ex.type} onValueChange={val => updateExercise(idx, "type", val)}>
                                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                  <SelectContent>
                                    {exerciseTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="flex gap-2">
                  <Button onClick={addExercise} variant="outline" className="flex-1"><Plus /> Add Exercise</Button>
                  <Button onClick={handleSubmit} className="flex-1">{editingWorkout ? "Update Workout" : "Create Workout"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  );
};

export default Workouts;
