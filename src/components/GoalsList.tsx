import { useState } from "react";
import { EditGoalDialog } from "./EditGoalDialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Goal } from "@/types/goals";
import { BulkActions } from "./goals/list/BulkActions";
import { GoalsListContent } from "./goals/list/GoalsListContent";
import { DeleteConfirmDialog } from "./goals/list/DeleteConfirmDialog";

interface GoalsListProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  duplicateGoals?: Set<number>;
}

export const GoalsList = ({ goals, setGoals, duplicateGoals = new Set() }: GoalsListProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const handleDeleteGoal = async (id: number) => {
    setGoalToDelete(id);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalToDelete);

      if (error) {
        throw error;
      }

      // Optimistically update the UI
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalToDelete));
      setGoalToDelete(null);
      
      toast({
        title: "Success",
        description: "Goal deleted successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditGoal = async (
    id: number,
    updatedGoal: {
      title: string;
      description: string;
      target_date: string;
      tags: string[];
      folder_id?: number | null;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .update({
          title: updatedGoal.title,
          description: updatedGoal.description,
          target_date: updatedGoal.target_date,
          tags: updatedGoal.tags || [],
          folder_id: updatedGoal.folder_id
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)));
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

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

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .in("id", Array.from(selectedGoals));

      if (error) throw error;

      // Optimistically update the UI
      setGoals(prevGoals => prevGoals.filter(goal => !selectedGoals.has(goal.id)));
      setSelectedGoals(new Set());
      
      toast({
        title: "Success",
        description: `${selectedGoals.size} goals deleted successfully`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting goals:', error);
      toast({
        title: "Error",
        description: "Failed to delete goals",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleBulkMove = async () => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ folder_id: null })
        .in("id", Array.from(selectedGoals));

      if (error) throw error;

      setGoals(goals.map(goal => 
        selectedGoals.has(goal.id) 
          ? { ...goal, folder_id: null }
          : goal
      ));
      setSelectedGoals(new Set());
      toast({
        title: "Success",
        description: `${selectedGoals.size} goals moved successfully`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error moving goals:', error);
      toast({
        title: "Error",
        description: "Failed to move goals",
        variant: "destructive",
        duration: 3000,
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
        onEdit={() => setEditingGoal(goal)}
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