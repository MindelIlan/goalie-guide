import { useState } from "react";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { useToast } from "@/components/ui/use-toast";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
}

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { toast } = useToast();

  const handleAddGoal = (newGoal: Omit<Goal, "id" | "progress">) => {
    const goal = {
      ...newGoal,
      id: Date.now(),
      progress: 0,
    };
    setGoals([...goals, goal]);
    toast({
      title: "Goal Added",
      description: "Your new goal has been added successfully!",
    });
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    toast({
      title: "Goal Deleted",
      description: "Your goal has been deleted.",
    });
  };

  const handleEditGoal = (id: number) => {
    // To be implemented in the next iteration
    toast({
      title: "Coming Soon",
      description: "Goal editing will be available in the next update!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My 2024 Goals</h1>
          <p className="text-gray-600 mb-6">Track and achieve your personal goals for the year</p>
          <AddGoalDialog onAddGoal={handleAddGoal} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDeleteGoal}
              onEdit={handleEditGoal}
            />
          ))}
          {goals.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No goals yet. Add your first goal to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;