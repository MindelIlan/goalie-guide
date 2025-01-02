import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const FoldersList = ({ folders, onFoldersChange, selectedFolderId, onSelectFolder }: FoldersListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('goal_folders')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;

      onFoldersChange([...folders, data]);
      setIsOpen(false);
      setName("");
      setDescription("");
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={selectedFolderId === null ? "secondary" : "outline"}
            onClick={() => onSelectFolder(null)}
          >
            All Goals
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? "secondary" : "outline"}
              onClick={() => onSelectFolder(folder.id)}
            >
              {folder.name}
            </Button>
          ))}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this folder"
                />
              </div>
              <Button type="submit" className="w-full">Create Folder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};