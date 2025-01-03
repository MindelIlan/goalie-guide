import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";
import { SubgoalsList } from "./SubgoalsList";
import { supabase } from "@/lib/supabase";
import { GoalHeader } from "./goal/GoalHeader";
import { GoalProgress } from "./goal/GoalProgress";
import { GoalButtons } from "./goal/GoalButtons";
import { GoalTargetDate } from "./goal/GoalTargetDate";
import { celebrateCompletion } from "./goal/GoalCelebration";
import { useDraggable } from '@dnd-kit/core';
import { Folder } from 'lucide-react';
import { Badge } from './ui/badge';

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
  const [folderName, setFolderName] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `goal-${goal.id}`,
    data: goal,
  });

  useEffect(() => {
    const fetchFolderName = async () => {
      if (goal.folder_id) {
        const { data, error } = await supabase
          .from('goal_folders')
          .select('name')
          .eq('id', goal.folder_id)
          .single();
        
        if (!error && data) {
          setFolderName(data.name);
        }
      } else {
        setFolderName(null);
      }
    };

    fetchFolderName();
  }, [goal.folder_id]);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

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
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative cursor-move ${
        isCompleted 
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-emerald-200'
          : isDuplicate
          ? 'bg-[#E5DEFF] border-purple-200 hover:border-purple-300'
          : 'bg-white border-gray-200 hover:border-primary/20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {folderName && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          <Folder className="h-3 w-3" />
          <span>{folderName}</span>
        </div>
      )}
      
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
    </Card>
  );
};