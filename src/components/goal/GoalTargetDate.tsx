import { Calendar } from "lucide-react";

interface GoalTargetDateProps {
  targetDate: string;
}

export const GoalTargetDate = ({ targetDate }: GoalTargetDateProps) => {
  return (
    <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      Target: {new Date(targetDate).toLocaleDateString()}
    </div>
  );
};