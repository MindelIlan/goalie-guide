import { useState } from "react";
import { GoalCard } from "./GoalCard";
import { EditGoalDialog } from "./EditGoalDialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
  folder_id?: number | null;
}

interface GoalsListProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  duplicateGoals?: Set<number>;
}

export const GoalsList = ({ goals, setGoals, duplicateGoals = new Set() }: GoalsListProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleDeleteGoal = async (id: number) => {
    console.log('Attempting to delete goal:', id);
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('Error deleting goal:', error);
        toast({
          title: "Error",
          description: `Failed to delete goal: ${error.message}. Code: ${error.code}`,
          variant: "destructive",
        });
      } else {
        setGoals(goals.filter((goal) => goal.id !== id));
        toast({
          title: "Success",
          description: "Goal deleted successfully",
        });
      }
    } catch (err) {
      console.error('Unexpected error deleting goal:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the goal",
        variant: "destructive",
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
    console.log('Attempting to update goal:', id, updatedGoal);
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

      if (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Error",
          description: `Failed to update goal: ${error.message}. Code: ${error.code}`,
          variant: "destructive",
        });
      } else {
        setGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)));
        toast({
          title: "Success",
          description: "Goal updated successfully!",
        });
      }
    } catch (err) {
      console.error('Unexpected error updating goal:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the goal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {goals.map((goal, index) => (
        <motion.div
          key={goal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GoalCard
            goal={goal}
            onDelete={handleDeleteGoal}
            onEdit={() => setEditingGoal(goal)}
            isDuplicate={duplicateGoals.has(goal.id)}
          />
        </motion.div>
      ))}
      {goals.length === 0 && (
        <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No goals yet. Add your first goal to get started!</p>
        </div>
      )}

      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          onEditGoal={handleEditGoal}
        />
      )}
    </div>
  );
};