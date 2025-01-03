import { useState } from "react";
import { ProfileContainer } from "./containers/ProfileContainer";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { FoldersList } from "./FoldersList";
import { GoalsStats } from "./GoalsStats";
import { useGoals } from "./hooks/useGoals";
import { useDuplicateGoals } from "./hooks/useDuplicateGoals";
import { useFolders } from "./hooks/useFolders";
import { Goal } from "@/types/goals";

interface GoalsContainerProps {
  userId: string;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => Promise<number | undefined>;
}

export const GoalsContainer = ({ userId, goals: initialGoals, setGoals, onAddGoal }: GoalsContainerProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { goals, isLoading, stats } = useGoals(selectedFolderId, searchQuery);
  const { folders, isLoading: isFoldersLoading, setFolders } = useFolders();
  const {
    showDuplicatesDialog,
    setShowDuplicatesDialog,
    duplicateGoals,
    duplicateGoalIds,
    checkForDuplicates
  } = useDuplicateGoals(goals);

  if (isLoading || isFoldersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ProfileContainer userId={userId} />

      <GoalsStats
        totalGoals={stats.totalGoals}
        completedGoals={stats.completedGoals}
        averageProgress={stats.averageProgress}
      />

      <FoldersList
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        goals={goals}
        onFoldersChange={setFolders}
      />

      <GoalsHeader 
        onAddGoal={onAddGoal}
        onCheckDuplicates={checkForDuplicates}
        onSearch={setSearchQuery}
        folders={folders}
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
          const event = new CustomEvent('goals-updated');
          window.dispatchEvent(event);
        }}
      />
    </>
  );
};