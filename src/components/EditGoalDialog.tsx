import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditGoalDialogProps {
  goal: {
    id: number;
    title: string;
    description: string;
    target_date: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditGoal: (id: number, goal: {
    title: string;
    description: string;
    target_date: string;
  }) => void;
}

export const EditGoalDialog = ({ goal, open, onOpenChange, onEditGoal }: EditGoalDialogProps) => {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [target_date, setTargetDate] = useState(goal.target_date);

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetDate(goal.target_date);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditGoal(goal.id, { title, description, target_date });
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
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={target_date}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};