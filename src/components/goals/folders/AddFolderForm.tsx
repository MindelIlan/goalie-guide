import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AddFolderFormProps {
  onFoldersChange: (folders: any[]) => void;
  folders: any[];
  onCancel: () => void;
}

export const AddFolderForm = ({ onFoldersChange, folders, onCancel }: AddFolderFormProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        onCancel();
        
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
        onClick={onCancel}
        variant="ghost" 
        size="icon"
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};