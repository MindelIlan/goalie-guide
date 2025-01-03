import { useState } from "react";
import { EditGoalDialog } from "./EditGoalDialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Goal } from "@/types/goals";
import { BulkActions } from "./goals/list/BulkActions";
import { GoalsListContent } from "./goals/list/GoalsListContent";
import { DeleteConfirmDialog } from "./goals/list/DeleteConfirmDialog";
import { useGoalActions } from "./goals/hooks/useGoalActions";

interface GoalsListProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  duplicateGoals?: Set<number>;
}

export const GoalsList = ({ goals, setGoals, duplicateGoals = new Set() }: GoalsListProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const { handleDeleteGoal, confirmDelete, handleEditGoal, handleBulkDelete, handleBulkMove } = useGoalActions({
    goals,
    setGoals,
    setGoalToDelete,
    selectedGoals,
    setSelectedGoals
  });

  const handleGoalSelect = (goalId: number, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSelectedGoals(prev => {
        const newSet = new Set(prev);
        if (newSet.has(goalId)) {
          newSet.delete(goalId);
        } else {
          newSet.add(goalId);
        }
        return newSet;
      });
    }
  };

  return (
    <div>
      <BulkActions
        selectedGoals={selectedGoals}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
      />
      
      <GoalsListContent
        goals={goals}
        onDelete={handleDeleteGoal}
        onEdit={setEditingGoal}
        duplicateGoals={duplicateGoals}
        selectedGoals={selectedGoals}
        onSelect={handleGoalSelect}
      />

      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          onEditGoal={handleEditGoal}
        />
      )}

      <DeleteConfirmDialog
        open={!!goalToDelete}
        onOpenChange={(open) => !open && setGoalToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
      />
    </div>
  );
};