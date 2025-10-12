import { Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem = ({ task, onToggle, onDelete, onEdit }: TaskItemProps) => {
  const priorityColors = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-warning text-warning-foreground",
    low: "bg-success text-success-foreground",
  };

  return (
    <div className="group gradient-card p-4 rounded-xl shadow-elegant hover:shadow-lg transition-smooth border border-border">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-smooth flex items-center justify-center",
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground hover:border-primary"
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-foreground transition-smooth",
              task.completed && "task-complete"
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs", priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
