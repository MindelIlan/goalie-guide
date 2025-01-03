import { useState, useEffect } from 'react';
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";
import { SubgoalsList } from "./SubgoalsList";
import { supabase } from "@/lib/supabase";
import { GoalHeader } from "./goal/GoalHeader";
import { GoalProgress } from "./goal/GoalProgress";
import { GoalButtons } from "./goal/GoalButtons";
import { GoalTargetDate } from "./goal/GoalTargetDate";
import { celebrateCompletion } from "./goal/GoalCelebration";
import { FolderBadge } from './goal/card/FolderBadge';
import { GoalCardWrapper } from './goal/card/GoalCardWrapper';

interface GoalCardProps {
  goal: {
    id: number;
    title: string;
    description: string;
    progress: number;
    target_date: string;
    tags: string[];
    created_at: string;
    folder_id?: number | null;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  isDuplicate?: boolean;
}

export const GoalCard = ({ goal, onDelete, onEdit, isDuplicate = false }: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(goal.progress);

  useEffect(() => {
    if (previousProgress < 100 && goal.progress === 100) {
      celebrateCompletion();
    }
    setPreviousProgress(goal.progress);
  }, [goal.progress, previousProgress]);

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
  const isCompleted = goal.progress === 100;

  return (
    <GoalCardWrapper
      goalId={goal.id}
      goalData={goal}
      isCompleted={isCompleted}
      isDuplicate={isDuplicate}
      isHovered={isHovered}
      onHoverChange={setIsHovered}
    >
      <FolderBadge folderId={goal.folder_id} />
      
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
      
      <GoalTargetDate targetDate={goal.target_date} />

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
    </GoalCardWrapper>
  );
};