import { Button } from "@/components/ui/button";
import { ListTodo, Share2 } from "lucide-react";

interface GoalButtonsProps {
  showSubgoals: boolean;
  showSimilar: boolean;
  onToggleSubgoals: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleSimilar: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const GoalButtons = ({
  showSubgoals,
  showSimilar,
  onToggleSubgoals,
  onToggleSimilar,
}: GoalButtonsProps) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSubgoals}
        className={showSubgoals ? "bg-gray-100" : ""}
      >
        <ListTodo className="h-4 w-4 mr-2" />
        Subgoals
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSimilar}
        className={showSimilar ? "bg-gray-100" : ""}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Similar Goals
      </Button>
    </div>
  );
};