import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { TagInput } from "./TagInput";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  const [newSubgoal, setNewSubgoal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAddSubgoal = () => {
    if (newSubgoal.trim()) {
      setSubgoals([...subgoals, newSubgoal.trim()]);
      setNewSubgoal("");
    }
  };

  const handleRemoveSubgoal = (index: number) => {
    setSubgoals(subgoals.filter((_, i) => i !== index));
  };

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your goal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folder">Folder (Optional)</Label>
            <select
              id="folder"
              value={selectedFolderId || ""}
              onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={target_date}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} setTags={setTags} />
          </div>
          
          {/* Subgoals Section */}
          <div className="space-y-2">
            <Label>Subgoals (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newSubgoal}
                onChange={(e) => setNewSubgoal(e.target.value)}
                placeholder="Add a subgoal"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubgoal();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleAddSubgoal}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subgoals.length > 0 && (
              <div className="mt-2 space-y-2">
                {subgoals.map((subgoal, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-secondary/20 rounded-md"
                  >
                    <span>{subgoal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubgoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">Add Goal</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};