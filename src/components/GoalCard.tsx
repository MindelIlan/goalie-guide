import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";
import { SubgoalsList } from "./SubgoalsList";
import { supabase } from "@/lib/supabase";
import { GoalHeader } from "./goal/GoalHeader";
import { GoalProgress } from "./goal/GoalProgress";
import { GoalButtons } from "./goal/GoalButtons";
import confetti from 'canvas-confetti';

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
  isDuplicate?: boolean;
}

export const GoalCard = ({ goal, onDelete, onEdit, isDuplicate = false }: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(goal.progress);

  useEffect(() => {
    // Only celebrate if the progress changed from less than 100 to exactly 100
    if (previousProgress < 100 && goal.progress === 100) {
      celebrateCompletion();
    }
    setPreviousProgress(goal.progress);
  }, [goal.progress, previousProgress]);

  const celebrateCompletion = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50;

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#F97316', '#0D9488', '#8B5CF6', '#D946EF', '#1EAEDB'],
        disableForReducedMotion: true
      });
    }, 250);
  };

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
      className={`p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative ${
        isCompleted 
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-emerald-200'
          : isDuplicate
          ? 'bg-[#E5DEFF] border-purple-200 hover:border-purple-300'
          : 'bg-white border-gray-200 hover:border-primary/20'
      }`}
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