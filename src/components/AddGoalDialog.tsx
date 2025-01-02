import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AddGoalForm } from "./goal/AddGoalForm";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface AddGoalDialogProps {
  onAddGoal: (goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => Promise<number | undefined>;
  folders: Folder[];
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddGoalDialog = ({ onAddGoal, folders, children, open, onOpenChange }: AddGoalDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target_date, setTargetDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subgoals, setSubgoals] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const goalId = await onAddGoal({ 
        title, 
        description, 
        target_date, 
        tags,
        folder_id: selectedFolderId 
      });
      
      if (subgoals.length > 0 && goalId) {
        const { error: subgoalsError } = await supabase
          .from("subgoals")
          .insert(
            subgoals.map(title => ({
              goal_id: goalId,
              title,
              completed: false
            }))
          );

        if (subgoalsError) {
          console.error("Error creating subgoals:", subgoalsError);
          toast({
            title: "Error",
            description: "Failed to create subgoals",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Goal and subgoals created successfully!",
          });
        }
      }

      setTitle("");
      setDescription("");
      setTargetDate("");
      setTags([]);
      setSubgoals([]);
      setSelectedFolderId(null);
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || setIsOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <AddGoalForm
          title={title}
          description={description}
          target_date={target_date}
          tags={tags}
          subgoals={subgoals}
          selectedFolderId={selectedFolderId}
          folders={folders}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onTargetDateChange={setTargetDate}
          onTagsChange={setTags}
          onSubgoalsChange={setSubgoals}
          onFolderChange={setSelectedFolderId}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};