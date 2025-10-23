import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/contexts/DemoContext";
import { useNavigate } from "react-router-dom";

export const DemoBanner = () => {
  const { isDemoMode, setIsDemoMode } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleExitDemo = () => {
    setIsDemoMode(false);
    navigate("/auth");
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary to-secondary py-2 px-4">
      <div className="container mx-auto flex items-center justify-between text-background">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're in Demo Mode - All features unlocked with sample data
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitDemo}
          className="text-background hover:bg-background/20 gap-2"
        >
          Exit Demo
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
