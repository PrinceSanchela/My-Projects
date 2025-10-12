import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { TaskItem } from "@/components/TaskItem";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useTasksDB } from "@/hooks/useTasksDB";
import { Task } from "@/types/task";
import { toast } from "sonner";

type FilterType = "all" | "active" | "completed";

const Index = () => {
  const { user, loading: authLoading } = useAuth();

  // Local storage tasks for anonymous users
  const localTasks = useTasks();

  // Database tasks for authenticated users
  const dbTasks = useTasksDB(user?.id);

  // Use database if authenticated, otherwise local storage
  const taskManager = user ? dbTasks : localTasks;
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = taskManager;

  const [filter, setFilter] = useState<FilterType>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks]
  );

  const handleSaveTask = (task: Omit<Task, "id"> | Task) => {
    if ("id" in task) {
      updateTask(task);
    } else {
      addTask(task);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success("Task deleted successfully");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-smooth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-xl shadow-md">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user ? `Welcome, ${user.email?.split('@')[0]}` : 'Manage your tasks efficiently'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!user && (
          <div className="mb-6 gradient-card p-4 rounded-xl border border-primary/20 shadow-md">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Your tasks are saved locally. Sign in to sync across devices and keep your tasks safe.
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <TaskFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            taskCounts={taskCounts}
          />
          <AddTaskDialog
            editTask={editingTask}
            onSave={handleSaveTask}
            onClose={() => setEditingTask(null)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="gradient-card p-6 rounded-xl shadow-elegant border border-border hover:shadow-lg transition-smooth">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h3>
            <p className="text-3xl font-bold text-foreground">{taskCounts.all}</p>
          </div>
          <div className="gradient-card p-6 rounded-xl shadow-elegant border border-border hover:shadow-lg transition-smooth">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
            <p className="text-3xl font-bold text-primary">{taskCounts.active}</p>
          </div>
          <div className="gradient-card p-6 rounded-xl shadow-elegant border border-border hover:shadow-lg transition-smooth">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed</h3>
            <p className="text-3xl font-bold text-success">{taskCounts.completed}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 gradient-card rounded-xl border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Start by adding your first task!"
                  : `No ${filter} tasks at the moment.`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={handleDeleteTask}
                onEdit={setEditingTask}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with TaskFlow • Your productivity companion</p>
          <p>Made By Prince Sanchela</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
