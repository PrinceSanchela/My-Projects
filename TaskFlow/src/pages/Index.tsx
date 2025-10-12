import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { TaskList } from "@/components/TaskList";
import { TaskDialog } from "@/components/TaskDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, CheckSquare, Filter, Bell } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permission, requestPermission, showNotification } = useNotifications();

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      
      // Check for due tasks every minute
      const interval = setInterval(() => {
        checkDueTasks();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkDueTasks = () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 15 * 60000); // 15 minutes from now

    tasks.forEach((task) => {
      if (!task.is_completed && task.due_date) {
        const dueDate = new Date(task.due_date);
        
        // Check if task is due within the next 15 minutes
        if (dueDate > now && dueDate <= soon) {
          showNotification(task);
        }
      }
    });
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast({
        title: "Notifications enabled",
        description: "You'll receive reminders for upcoming tasks.",
      });
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", editingTask.id);

        if (error) throw error;

        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        if (!taskData.title) {
          throw new Error("Task title is required");
        }
        
        const { error } = await supabase.from("tasks").insert([
          {
            title: taskData.title,
            description: taskData.description,
            due_date: taskData.due_date,
            priority: taskData.priority,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Task created",
          description: "Your task has been added successfully.",
        });
      }

      setEditingTask(null);
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: isCompleted })
        .eq("id", id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, is_completed: isCompleted } : task))
      );

      toast({
        description: isCompleted ? "Task completed!" : "Task marked as active",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast({
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.is_completed).length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {permission !== "granted" && (
                <Button variant="outline" size="sm" onClick={handleEnableNotifications}>
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Button>
              )}
              <ThemeToggle />
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            You have {activeTasks} active {activeTasks === 1 ? "task" : "tasks"} and{" "}
            {completedTasks} completed
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <Button
            onClick={() => {
              setEditingTask(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filter === "all" ? "All Tasks" : filter === "active" ? "Active" : "Completed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>All Tasks</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          filter={filter}
        />

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveTask}
          task={editingTask}
        />
      </main>
    </div>
  );
};

export default Index;
