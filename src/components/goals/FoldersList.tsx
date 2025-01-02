import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface FoldersListProps {
  folders: Folder[];
  onFoldersChange: (folders: Folder[]) => void;
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
}

export const FoldersList = ({ 
  folders, 
  onFoldersChange, 
  selectedFolderId, 
  onSelectFolder 
}: FoldersListProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_folders')
        .insert([{ name: newFolderName.trim() }])
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
    } catch (error) {
      console.error('Error adding folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
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
          className="w-full justify-start"
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="h-4 w-4 mr-2" />
          All Goals
        </Button>
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectFolder(folder.id)}
          >
            <Folder className="h-4 w-4 mr-2" />
            {folder.name}
          </Button>
        ))}
      </div>
    </div>
  );
};