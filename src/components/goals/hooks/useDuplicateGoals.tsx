import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
  folder_id: number | null;
}

export const useDuplicateGoals = (goals: Goal[]) => {
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateGoals, setDuplicateGoals] = useState<Goal[]>([]);
  const [duplicateGoalIds, setDuplicateGoalIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const checkForDuplicates = () => {
    const duplicates: Goal[] = [];
    const duplicateIds = new Set<number>();
    const goalMap = new Map<string, Goal[]>();
    
    goals.forEach(goal => {
      const key = `${goal.title.toLowerCase()}-${goal.description?.toLowerCase() || ''}`;
      if (!goalMap.has(key)) {
        goalMap.set(key, [goal]);
      } else {
        const existingGoals = goalMap.get(key) || [];
        existingGoals.push(goal);
        goalMap.set(key, existingGoals);
        
        if (existingGoals.length === 2) {
          duplicates.push(existingGoals[0]);
          duplicateIds.add(existingGoals[0].id);
        }
        duplicates.push(goal);
        duplicateIds.add(goal.id);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateGoals(duplicates);
      setDuplicateGoalIds(duplicateIds);
      setShowDuplicatesDialog(true);
    } else {
      toast({
        title: "No duplicates found",
        description: "All your goals are unique!",
      });
    }
  };

  return {
    showDuplicatesDialog,
    setShowDuplicatesDialog,
    duplicateGoals,
    duplicateGoalIds,
    checkForDuplicates
  };
};