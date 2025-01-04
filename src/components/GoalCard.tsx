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
import { toast } from "@/components/ui/use-toast";

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
  isSelected?: boolean;
  onSelect?: (ctrlKey: boolean) => void;
}

export const GoalCard = ({ 
  goal, 
  onDelete, 
  onEdit, 
  isDuplicate = false,
  isSelected = false,
  onSelect
}: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(goal.progress);
  const [localGoal, setLocalGoal] = useState(goal);

  useEffect(() => {
    setLocalGoal(goal);
  }, [goal]);

  useEffect(() => {
    if (previousProgress < 100 && localGoal.progress === 100) {
      celebrateCompletion();
    }
    setPreviousProgress(localGoal.progress);
  }, [localGoal.progress, previousProgress]);

  useEffect(() => {
    // Subscribe to realtime goal updates
    const channel = supabase
      .channel(`goal_${goal.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `id=eq.${goal.id}`
        },
        (payload) => {
          console.log('Goal update received:', payload);
          if (payload.new) {
            setLocalGoal(payload.new as typeof goal);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [goal.id]);

  const updateGoalProgress = async (progress: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress })
        .eq('id', goal.id);

      if (error) throw error;
      
      setLocalGoal(prev => ({ ...prev, progress }));
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update goal progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSubgoals = () => {
    console.log('Toggling subgoals');
    setShowSubgoals(!showSubgoals);
    if (showSimilar) setShowSimilar(false);
  };

  const handleToggleSimilar = () => {
    console.log('Toggling similar goals');
    setShowSimilar(!showSimilar);
    if (showSubgoals) setShowSubgoals(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(e.ctrlKey);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareDialog(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(goal.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(goal.id);
  };

  const timeProgress = calculateTimeProgress(localGoal);
  const isCompleted = localGoal.progress === 100;

  return (
    <GoalCardWrapper
      goalId={localGoal.id}
      goalData={localGoal}
      isCompleted={isCompleted}
      isDuplicate={isDuplicate}
      isSelected={isSelected}
      isHovered={isHovered}
      onHoverChange={setIsHovered}
      onClick={handleClick}
    >
      <FolderBadge folderId={localGoal.folder_id} />
      
      <GoalHeader
        title={localGoal.title}
        description={localGoal.description}
        tags={localGoal.tags}
        isHovered={isHovered}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <GoalProgress
        taskProgress={localGoal.progress}
        timeProgress={timeProgress}
      />
      
      <GoalTargetDate targetDate={localGoal.target_date} />

      <GoalButtons
        showSubgoals={showSubgoals}
        showSimilar={showSimilar}
        onToggleSubgoals={handleToggleSubgoals}
        onToggleSimilar={handleToggleSimilar}
      />

      {showSubgoals && (
        <div className="mt-4 border-t pt-4">
          <SubgoalsList goalId={localGoal.id} onProgressUpdate={updateGoalProgress} />
        </div>
      )}

      {showSimilar && (
        <div className="mt-4 border-t pt-4">
          <SimilarGoals goalTitle={localGoal.title} />
        </div>
      )}

      <ShareGoalDialog
        goalId={localGoal.id}
        goalTitle={localGoal.title}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </GoalCardWrapper>
  );
};

const calculateTimeProgress = (goal: GoalCardProps['goal']) => {
  if (!goal?.created_at || !goal?.target_date) return 0;
  
  const startDate = new Date(goal.created_at);
  const targetDate = new Date(goal.target_date);
  const currentDate = new Date();

  if (currentDate > targetDate) return 100;
  if (isNaN(targetDate.getTime()) || targetDate <= startDate) return goal.progress;

  const totalDuration = targetDate.getTime() - startDate.getTime();
  const elapsedDuration = currentDate.getTime() - startDate.getTime();
  const timeProgress = Math.round((elapsedDuration / totalDuration) * 100);

  return Math.min(Math.max(timeProgress, 0), 100);
};