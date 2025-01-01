import { useState } from "react";
import { GoalCard } from "./GoalCard";
import { EditGoalDialog } from "./EditGoalDialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
}

interface GoalsListProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export const GoalsList = ({ goals, setGoals }: GoalsListProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleDeleteGoal = async (id: number) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    } else {
      setGoals(goals.filter((goal) => goal.id !== id));
      toast({
        title: "Success",
        description: "Goal deleted successfully",
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
    }
  ) => {
    const { data, error } = await supabase
      .from("goals")
      .update({
        title: updatedGoal.title,
        description: updatedGoal.description,
        target_date: updatedGoal.target_date,
        tags: updatedGoal.tags || [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    } else {
      setGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)));
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onDelete={handleDeleteGoal}
          onEdit={() => setEditingGoal(goal)}
        />
      ))}
      {goals.length === 0 && (
        <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
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