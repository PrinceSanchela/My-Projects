import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "all" | "active" | "completed";

interface TaskFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const TaskFilters = ({ activeFilter, onFilterChange, taskCounts }: TaskFiltersProps) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "transition-smooth",
            activeFilter === filter.value && "gradient-primary"
          )}
        >
          {filter.label}
          <span className="ml-2 text-xs opacity-80">
            ({taskCounts[filter.value]})
          </span>
        </Button>
      ))}
    </div>
  );
};
