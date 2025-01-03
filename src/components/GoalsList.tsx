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
  folderName?: string | null;
}

export const GoalsList = ({ goals, setGoals, duplicateGoals = new Set(), folderName }: GoalsListProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const { handleDeleteGoal, confirmDelete, handleEditGoal, handleBulkDelete, handleBulkMove } = useGoalActions({
    goals,
    setGoals,
    setGoalToDelete,
    selectedGoals,
    setSelectedGoals,
    goalToDelete
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

  const handleEditClick = (id: number) => {
    const goalToEdit = goals.find(g => g.id === id);
    if (goalToEdit) {
      setEditingGoal(goalToEdit);
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
        onEdit={handleEditClick}
        duplicateGoals={duplicateGoals}
        selectedGoals={selectedGoals}
        onSelect={handleGoalSelect}
        folderName={folderName}
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