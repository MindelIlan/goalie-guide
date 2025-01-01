import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Share2 } from "lucide-react";
import { SimilarGoals } from "./SimilarGoals";
import { ShareGoalDialog } from "./ShareGoalDialog";

interface GoalCardProps {
  goal: {
    id: number;
    title: string;
    description: string;
    progress: number;
    target_date: string;
    tags: string[];
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const GoalCard = ({ goal, onDelete, onEdit }: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <Card 
      className="p-6 transition-all duration-300 hover:shadow-lg animate-fade-in relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{goal.title}</h3>
          <p className="text-gray-600 mt-1">{goal.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {goal.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className={`flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Target Date: {new Date(goal.target_date).toLocaleDateString()}
      </div>

      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSimilar(!showSimilar)}
          className="text-sm text-blue-600 hover:text-blue-700"
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