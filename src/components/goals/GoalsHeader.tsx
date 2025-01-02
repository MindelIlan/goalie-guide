import { Button } from "@/components/ui/button";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Plus } from "lucide-react";

interface GoalsHeaderProps {
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
  }) => Promise<number | undefined>;
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