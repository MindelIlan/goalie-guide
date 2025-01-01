import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";
import { SubgoalsList } from "./SubgoalsList";
import { supabase } from "@/lib/supabase";
import { GoalHeader } from "./goal/GoalHeader";
import { GoalProgress } from "./goal/GoalProgress";
import { GoalButtons } from "./goal/GoalButtons";

interface GoalCardProps {
  goal: {
    id: number;
    title: string;
    description: string;
    progress: number;
    target_date: string;
    tags: string[];
    created_at: string;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const GoalCard = ({ goal, onDelete, onEdit }: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const updateGoalProgress = async (progress: number) => {
    const { error } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goal.id);

    if (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const calculateTimeProgress = () => {
    const startDate = new Date(goal.created_at || new Date());
    const targetDate = new Date(goal.target_date);
    const currentDate = new Date();

    if (currentDate > targetDate) return 100;
    if (isNaN(targetDate.getTime()) || targetDate <= startDate) return goal.progress;

    const totalDuration = targetDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();
    const timeProgress = Math.round((elapsedDuration / totalDuration) * 100);

    return Math.min(Math.max(timeProgress, 0), 100);
  };

  const handleToggleSubgoals = () => {
    setShowSubgoals(!showSubgoals);
    if (showSimilar) setShowSimilar(false);
  };

  const handleToggleSimilar = () => {
    setShowSimilar(!showSimilar);
    if (showSubgoals) setShowSubgoals(false);
  };

  const timeProgress = calculateTimeProgress();

  return (
    <Card 
      className="p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative bg-white border-gray-200 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GoalHeader
        title={goal.title}
        description={goal.description}
        tags={goal.tags}
        isHovered={isHovered}
        onShare={() => setShowShareDialog(true)}
        onEdit={() => onEdit(goal.id)}
        onDelete={() => onDelete(goal.id)}
      />
      
      <GoalProgress
        taskProgress={goal.progress}
        timeProgress={timeProgress}
      />
      
      <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Target: {new Date(goal.target_date).toLocaleDateString()}
      </div>

      <GoalButtons
        showSubgoals={showSubgoals}
        showSimilar={showSimilar}
        onToggleSubgoals={handleToggleSubgoals}
        onToggleSimilar={handleToggleSimilar}
      />

      {showSubgoals && (
        <div className="mt-4 border-t pt-4">
          <SubgoalsList goalId={goal.id} onProgressUpdate={updateGoalProgress} />
        </div>
      )}

      {showSimilar && (
        <div className="mt-4 border-t pt-4">
          <SimilarGoals goalTitle={goal.title} />
        </div>
      )}

      <ShareGoalDialog
        goalId={goal.id}
        goalTitle={goal.title}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </Card>
  );
};