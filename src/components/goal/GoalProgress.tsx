import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock } from "lucide-react";

interface GoalProgressProps {
  taskProgress: number;
  timeProgress: number;
}

export const GoalProgress = ({ taskProgress, timeProgress }: GoalProgressProps) => {
  // For task progress, we now receive the actual completed count
  // Calculate total based on whether it's the main goal (1) or subgoals
  const total = taskProgress <= 1 ? 1 : Math.ceil(taskProgress * 100 / Math.max(taskProgress, 1));
  const completed = Math.min(taskProgress, total);
  
  // Convert to percentage for the progress bar
  const progressPercentage = (completed / total) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 items-center">
          <span className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Task Progress
          </span>
          <span>{completed}/{total}</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2"
          indicatorClassName="bg-primary transition-all"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 items-center">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            Time Progress
          </span>
          <span>{timeProgress}%</span>
        </div>
        <Progress 
          value={timeProgress} 
          className="h-2" 
          indicatorClassName="bg-secondary transition-all"
        />
      </div>
    </div>
  );
};