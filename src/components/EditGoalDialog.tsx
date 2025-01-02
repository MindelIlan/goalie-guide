import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "./TagInput";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Folder {
  id: number;
  name: string;
  description: string | null;
}

interface EditGoalDialogProps {
  goal: {
    id: number;
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditGoal: (id: number, goal: {
    title: string;
    description: string;
    target_date: string;
    tags: string[];
    folder_id?: number | null;
  }) => void;
}

export const EditGoalDialog = ({ goal, open, onOpenChange, onEditGoal }: EditGoalDialogProps) => {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [target_date, setTargetDate] = useState(goal.target_date);
  const [tags, setTags] = useState(goal.tags || []);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(goal.folder_id || null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetDate(goal.target_date);
    setTags(goal.tags || []);
    setSelectedFolderId(goal.folder_id || null);
  }, [goal]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: foldersData, error } = await supabase
          .from('goal_folders')
          .select('*')
          .eq('user_id', userData.user.id);

        if (error) throw error;
        setFolders(foldersData || []);
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Error",
          description: "Failed to load folders",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchFolders();
    }
  }, [open, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditGoal(goal.id, { 
      title, 
      description, 
      target_date, 
      tags,
      folder_id: selectedFolderId 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
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
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};