import { Button } from "@/components/ui/button";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Plus } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
}

interface GoalsHeaderProps {
  onAddGoal: (goal: Omit<Goal, "id" | "progress" | "user_id" | "created_at">) => void;
  onCheckDuplicates: () => void;
}

export const GoalsHeader = ({ onAddGoal, onCheckDuplicates }: GoalsHeaderProps) => {
  return (
    <div className="mb-8 text-center">
      <Button 
        onClick={onCheckDuplicates}
        variant="outline"
        className="mr-4"
      >
        Check for Duplicates
      </Button>
      <AddGoalDialog onAddGoal={onAddGoal}>
        <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-5 w-5" />
          Add New Goal
        </Button>
      </AddGoalDialog>
    </div>
  );
};