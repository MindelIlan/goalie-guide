import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Share2, ChevronDown, ChevronUp, CheckSquare, Clock, Calendar } from "lucide-react";
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";
import { SubgoalsList } from "./SubgoalsList";
import { supabase } from "@/lib/supabase";

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSubgoals, setShowSubgoals] = useState(false);

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

    // If target date is in the past, return 100%
    if (currentDate > targetDate) return 100;
    
    // If target date is today or invalid, return current progress
    if (isNaN(targetDate.getTime()) || targetDate <= startDate) return goal.progress;

    const totalDuration = targetDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();
    const timeProgress = Math.round((elapsedDuration / totalDuration) * 100);

    // Ensure progress is between 0 and 100
    return Math.min(Math.max(timeProgress, 0), 100);
  };

  const timeProgress = calculateTimeProgress();

  return (
    <Card 
      className="p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative bg-white border-gray-200 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 tracking-tight">{goal.title}</h3>
          <p className="text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {goal.tags?.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className={`flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100"
            onClick={() => onEdit(goal.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100 hover:text-red-500"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Task Progress
            </span>
            <span>{goal.progress}%</span>
          </div>
          <Progress 
            value={goal.progress} 
            className="h-2"
            indicatorClassName="bg-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 items-center">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Time Progress
            </span>
            <span>{timeProgress}%</span>
          </div>
          <Progress 
            value={timeProgress} 
            className="h-2" 
            indicatorClassName="bg-secondary transition-all"
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Target: {new Date(goal.target_date).toLocaleDateString()}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSubgoals(!showSubgoals)}
        className="w-full mt-4 flex items-center justify-between hover:bg-gray-100"
      >
        {showSubgoals ? "Hide Subgoals" : "Show Subgoals"}
        {showSubgoals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {showSubgoals && (
        <div className="mt-4 border-t pt-4">
          <SubgoalsList goalId={goal.id} onProgressUpdate={updateGoalProgress} />
        </div>
      )}

      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSimilar(!showSimilar)}
          className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          {showSimilar ? "Hide Similar Goals" : "Show Similar Goals"}
        </Button>
        {showSimilar && <SimilarGoals goalTitle={goal.title} />}
      </div>

      <ShareGoalDialog
        goalId={goal.id}
        goalTitle={goal.title}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </Card>
  );
};
