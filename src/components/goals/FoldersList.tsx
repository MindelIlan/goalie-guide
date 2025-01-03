import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { AddFolderForm } from "./folders/AddFolderForm";
import { FolderGrid } from "./folders/FolderGrid";
import { FolderHeader } from "./folders/FolderHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Goal, Folder } from "@/types/goals";

interface FoldersListProps {
  folders: Folder[];
  onFoldersChange?: (folders: Folder[]) => void;
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  goals: Goal[];
}

export const FoldersList = ({ 
  folders, 
  onFoldersChange, 
  selectedFolderId, 
  onSelectFolder,
  goals
}: FoldersListProps) => {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const { toast } = useToast();
  const { setNodeRef: setUnorganizedRef } = useDroppable({ id: 'unorganized' });

  const calculateFolderStats = (folderId: number | null) => {
    const folderGoals = goals.filter(goal => goal.folder_id === folderId);
    const totalGoals = folderGoals.length;
    const totalProgress = folderGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;
    return { totalGoals, averageProgress };
  };

  const handleDeleteFolder = async (folder: Folder) => {
    const folderGoals = goals.filter(goal => goal.folder_id === folder.id);
    
    if (folderGoals.length > 0) {
      setFolderToDelete(folder);
      return;
    }

    await deleteFolder(folder.id);
  };

  const deleteFolder = async (folderId: number) => {
    try {
      // First, update all goals in this folder to have no folder (unorganized)
      const { error: updateError } = await supabase
        .from('goals')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error: deleteError } = await supabase
        .from('goal_folders')
        .delete()
        .eq('id', folderId);

      if (deleteError) throw deleteError;

      if (onFoldersChange) {
        onFoldersChange(folders.filter(f => f.id !== folderId));
      }

      if (selectedFolderId === folderId) {
        onSelectFolder(null);
      }

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
    setFolderToDelete(null);
  };

  if (folders === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <FolderHeader onAddFolder={() => setIsAddingFolder(true)} />

      {isAddingFolder && (
        <AddFolderForm
          folders={folders}
          onFoldersChange={onFoldersChange || (() => {})}
          onCancel={() => setIsAddingFolder(false)}
        />
      )}

      <FolderGrid
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={onSelectFolder}
        onDeleteFolder={handleDeleteFolder}
        goals={goals}
        calculateFolderStats={calculateFolderStats}
        setUnorganizedRef={setUnorganizedRef}
      />

      <AlertDialog 
        open={!!folderToDelete} 
        onOpenChange={(open) => !open && setFolderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              This folder contains goals. Are you sure you want to delete it? The goals will be moved to "Unorganized Goals".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => folderToDelete && deleteFolder(folderToDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};