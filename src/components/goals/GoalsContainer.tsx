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
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const goalId = parseInt(active.id.toString().replace('goal-', ''));
    const folderId = over.id === 'unorganized' 
      ? null 
      : parseInt(over.id.toString().replace('folder-', ''));
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ folder_id: folderId })
        .eq('id', goalId);

      if (error) throw error;

      await refreshGoals();
      
      toast({
        title: "Success",
        description: `Goal moved to ${folderId ? 'folder' : 'unorganized goals'}`,
      });
    } catch (error) {
      console.error('Error moving goal:', error);
      toast({
        title: "Error",
        description: "Failed to move goal",
        variant: "destructive",
      });
    }
  };

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

      <DndContext onDragEnd={handleDragEnd}>
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