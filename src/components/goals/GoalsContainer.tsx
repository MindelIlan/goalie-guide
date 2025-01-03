import { useState } from "react";
import { ProfileContainer } from "./containers/ProfileContainer";
import { GoalsList } from "@/components/GoalsList";
import { GoalsHeader } from "./GoalsHeader";
import { DuplicateGoalsDialog } from "./DuplicateGoalsDialog";
import { FoldersList } from "./FoldersList";
import { GoalsStats } from "./GoalsStats";
import { useFilteredGoals } from "@/hooks/useFilteredGoals";
import { useDuplicateGoals } from "./hooks/useDuplicateGoals";
import { useFolders } from "./hooks/useFolders";
import { useGoals } from "@/contexts/GoalsContext";
import { DndContext } from '@dnd-kit/core';

interface GoalsContainerProps {
  userId: string;
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => Promise<number | undefined>;
}

export const GoalsContainer = ({ userId, onAddGoal }: GoalsContainerProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { goals: allGoals, refreshGoals } = useGoals();
  const { goals, stats } = useFilteredGoals(selectedFolderId, searchQuery);
  const { folders, isLoading: isFoldersLoading, setFolders } = useFolders();
  const {
    showDuplicatesDialog,
    setShowDuplicatesDialog,
    duplicateGoals,
    duplicateGoalIds,
    checkForDuplicates
  } = useDuplicateGoals(allGoals);

  if (isFoldersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ProfileContainer userId={userId} />

      <GoalsStats {...stats} />

      <DndContext>
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
          setGoals={refreshGoals}
          duplicateGoals={duplicateGoalIds}
        />
      </DndContext>

      <DuplicateGoalsDialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicateGoals={duplicateGoals}
        onDuplicateDeleted={() => {
          setShowDuplicatesDialog(false);
          refreshGoals();
        }}
      />
    </>
  );
};