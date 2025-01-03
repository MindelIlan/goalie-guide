import { Goal } from "@/types/goals";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface UseGoalActionsProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setGoalToDelete: React.Dispatch<React.SetStateAction<number | null>>;
  selectedGoals: Set<number>;
  setSelectedGoals: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export const useGoalActions = ({
  goals,
  setGoals,
  setGoalToDelete,
  selectedGoals,
  setSelectedGoals
}: UseGoalActionsProps) => {
  const handleDeleteGoal = async (id: number) => {
    setGoalToDelete(id);
  };

  const confirmDelete = async () => {
    const goalId = goals.find(g => g.id === goalToDelete)?.id;
    if (!goalId) return;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) {
        throw error;
      }

      // Optimistically update the UI
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
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

  return {
    handleDeleteGoal,
    confirmDelete,
    handleEditGoal,
    handleBulkDelete,
    handleBulkMove
  };
};