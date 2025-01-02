import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, X, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

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
  const [newFolderName, setNewFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calculateFolderStats = (folderId: number | null) => {
    const folderGoals = goals.filter(goal => goal.folder_id === folderId);
    const totalGoals = folderGoals.length;
    const totalProgress = folderGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;
    const completedGoals = folderGoals.filter(goal => goal.progress === 100).length;
    return { totalGoals, averageProgress, completedGoals };
  };

  const unorganizedGoals = goals.filter(goal => goal.folder_id === null);
  const unorganizedStats = {
    totalGoals: unorganizedGoals.length,
    averageProgress: unorganizedGoals.length > 0
      ? Math.round(unorganizedGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / unorganizedGoals.length)
      : 0,
    completedGoals: unorganizedGoals.filter(goal => goal.progress === 100).length
  };

  const handleAddFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!userData.user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from('goal_folders')
        .insert([{ 
          name: trimmedName,
          user_id: userData.user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onFoldersChange([...folders, data]);
        setNewFolderName("");
        setIsAddingFolder(false);
        
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      }
    } catch (error: any) {
      console.error('Error adding folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingFolder(!isAddingFolder)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Add Folder
        </Button>
      </div>

      {isAddingFolder && (
        <div className="flex gap-2 mb-4">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                e.preventDefault();
                handleAddFolder();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleAddFolder} 
            size="icon"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => {
              setIsAddingFolder(false);
              setNewFolderName("");
            }} 
            variant="ghost" 
            size="icon"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant={selectedFolderId === null ? "secondary" : "ghost"}
          className="w-full justify-between group"
          onClick={() => onSelectFolder(null)}
        >
          <span className="flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            Unorganized Goals
          </span>
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <span>{unorganizedStats.totalGoals} goals</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
        {selectedFolderId === null && unorganizedStats.totalGoals > 0 && (
          <div className="ml-6 mr-2 mt-2 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{unorganizedStats.averageProgress}%</span>
            </div>
            <Progress value={unorganizedStats.averageProgress} className="h-1.5" />
          </div>
        )}

        {folders.map((folder) => {
          const stats = calculateFolderStats(folder.id);
          return (
            <div key={folder.id}>
              <Button
                variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                className="w-full justify-between group"
                onClick={() => onSelectFolder(folder.id)}
              >
                <span className="flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{stats.totalGoals} goals</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              {selectedFolderId === folder.id && stats.totalGoals > 0 && (
                <div className="ml-6 mr-2 mt-2 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{stats.averageProgress}%</span>
                  </div>
                  <Progress value={stats.averageProgress} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};