import { Profile } from "@/components/Profile";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { useState } from "react";

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
  created_at: string;
}

interface GoalsContainerProps {
  userId: string;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  onAddGoal: (goal: Omit<Goal, "id" | "progress" | "user_id" | "created_at">) => void;
}

export const GoalsContainer = ({ userId, goals, setGoals, onAddGoal }: GoalsContainerProps) => {
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateGoals, setDuplicateGoals] = useState<Goal[]>([]);
  const [duplicateGoalIds, setDuplicateGoalIds] = useState<Set<number>>(new Set());

  const checkForDuplicates = (goalsList: Goal[] = goals) => {
    console.log('Checking for duplicates among', goalsList.length, 'goals');
    const duplicates: Goal[] = [];
    const duplicateIds = new Set<number>();
    const seen = new Map<string, Goal>();

    goalsList.forEach(goal => {
      const key = `${goal.title.toLowerCase()}-${goal.description?.toLowerCase() || ''}`;
      console.log('Checking goal:', goal.title, 'with key:', key);
      
      if (seen.has(key)) {
        if (!duplicates.includes(seen.get(key)!)) {
          duplicates.push(seen.get(key)!);
          duplicateIds.add(seen.get(key)!.id);
        }
        duplicates.push(goal);
        duplicateIds.add(goal.id);
      } else {
        seen.set(key, goal);
      }
    });

    console.log('Found duplicate goals:', duplicates.length);
    console.log('Duplicate IDs:', Array.from(duplicateIds));

    setDuplicateGoals(duplicates);
    setDuplicateGoalIds(duplicateIds);
    if (duplicates.length > 0) {
      setShowDuplicatesDialog(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 animate-fade-in">
        <Profile userId={userId} />
      </div>

      <GoalsHeader 
        onAddGoal={onAddGoal}
        onCheckDuplicates={() => checkForDuplicates()}
      />
      
      <GoalsList 
        goals={goals} 
        setGoals={setGoals} 
        duplicateGoals={duplicateGoalIds}
      />

      <DuplicateGoalsDialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicateGoals={duplicateGoals}
        onDuplicateDeleted={() => {
          setShowDuplicatesDialog(false);
          setDuplicateGoalIds(new Set());
          // Trigger a refresh of the goals list
          const event = new CustomEvent('goals-updated');
          window.dispatchEvent(event);
        }}
      />
    </>
  );
};