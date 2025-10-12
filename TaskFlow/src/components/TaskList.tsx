import { useState } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  filter: "all" | "active" | "completed";
}

export const TaskList = ({ tasks, onToggleComplete, onDelete, onEdit, filter }: TaskListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "active") return !task.is_completed;
      if (filter === "completed") return task.is_completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No tasks found matching your search." : "No tasks yet. Create your first task!"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
