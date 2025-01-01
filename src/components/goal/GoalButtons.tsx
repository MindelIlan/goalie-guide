import { Button } from "@/components/ui/button";
import { Eye, EyeOff, List, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GoalButtonsProps {
  showSubgoals: boolean;
  showSimilar: boolean;
  onToggleSubgoals: () => void;
  onToggleSimilar: () => void;
}

export const GoalButtons = ({
  showSubgoals,
  showSimilar,
  onToggleSubgoals,
  onToggleSimilar,
}: GoalButtonsProps) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSubgoals}
            className="hover:bg-gray-100"
          >
            {showSubgoals ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showSubgoals ? "Hide Subgoals" : "Show Subgoals"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSimilar}
            className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            {showSimilar ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showSimilar ? "Hide Similar Goals" : "Show Similar Goals"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};