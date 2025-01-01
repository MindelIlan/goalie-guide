import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock } from "lucide-react";

interface GoalProgressProps {
  taskProgress: number;
  timeProgress: number;
}

export const GoalProgress = ({ taskProgress, timeProgress }: GoalProgressProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 items-center">
          <span className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Task Progress
          </span>
          <span>{taskProgress}%</span>
        </div>
        <Progress 
          value={taskProgress} 
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