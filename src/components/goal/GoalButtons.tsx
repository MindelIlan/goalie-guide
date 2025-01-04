import { Button } from "@/components/ui/button";
import { ListTodo, Share2 } from "lucide-react";

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
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    console.log("Button clicked");
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="flex gap-2 mt-4" 
      onClick={(e) => {
        console.log("Button container clicked");
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, onToggleSubgoals)}
        className={showSubgoals ? "bg-gray-100" : ""}
      >
        <ListTodo className="h-4 w-4 mr-2" />
        Subgoals
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, onToggleSimilar)}
        className={showSimilar ? "bg-gray-100" : ""}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Partner up
      </Button>
    </div>
  );
};