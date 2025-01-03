import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { DroppableFolder } from "./folders/DroppableFolder";
import { AddFolderForm } from "./folders/AddFolderForm";

interface Goal {
  id: number;
  progress: number;
  folder_id: number | null;
}

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

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
  const { toast } = useToast();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const goalId = parseInt(active.id.toString().replace('goal-', ''));
    const folderId = over.id.toString().includes('unorganized') 
      ? null 
      : parseInt(over.id.toString().replace('folder-', ''));
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ folder_id: folderId })
        .eq('id', goalId);

      if (error) throw error;

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

  const calculateFolderStats = (folderId: number | null) => {
    const folderGoals = goals.filter(goal => goal.folder_id === folderId);
    const totalGoals = folderGoals.length;
    const totalProgress = folderGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;
    return { totalGoals, averageProgress };
  };

  const unorganizedStats = calculateFolderStats(null);
  const { setNodeRef: setUnorganizedRef } = useDroppable({ id: 'unorganized' });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingFolder(!isAddingFolder)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Folder
        </Button>
      </div>

      {isAddingFolder && (
        <AddFolderForm
          folders={folders}
          onFoldersChange={onFoldersChange || (() => {})}
          onCancel={() => setIsAddingFolder(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div 
          ref={setUnorganizedRef}
          className={`
            aspect-square p-4 rounded-lg transition-all duration-200
            ${selectedFolderId === null ? 'bg-secondary/10' : 'bg-background hover:bg-secondary/5'}
            border border-border
          `}
        >
          <Button
            variant={selectedFolderId === null ? "secondary" : "ghost"}
            className="w-full h-full flex flex-col justify-between p-4"
            onClick={() => onSelectFolder(null)}
          >
            <div className="flex items-center">
              <Folder className="h-6 w-6 mr-2" />
              Unorganized Goals
            </div>
            <div className="w-full space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>{unorganizedStats.totalGoals} goals</span>
                <span>{unorganizedStats.averageProgress}%</span>
              </div>
            </div>
          </Button>
        </div>

        {folders.map((folder) => {
          const stats = calculateFolderStats(folder.id);
          return (
            <DroppableFolder
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              stats={stats}
              onSelect={() => onSelectFolder(folder.id)}
            />
          );
        })}
      </div>
    </div>
  );
};