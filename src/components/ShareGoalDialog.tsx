import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ShareGoalDialogProps {
  goalId: number;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareGoalDialog = ({ goalId, goalTitle, open, onOpenChange }: ShareGoalDialogProps) => {
  const [email, setEmail] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, get the user ID from auth.users using their email
    const { data: userData, error: userError } = await supabase.auth
      .admin
      .listUsers({
        filters: {
          email: email
        }
      });

    if (userError || !userData?.users?.length) {
      toast({
        title: "Error",
        description: "User not found. Please check the email address.",
        variant: "destructive",
      });
      return;
    }

    const userId = userData.users[0].id;

    const { error: shareError } = await supabase
      .from('shared_goals')
      .insert([
        {
          goal_id: goalId,
          shared_with: userId,
        }
      ]);

    if (shareError) {
      toast({
        title: "Error",
        description: "Failed to share goal",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Goal shared successfully!",
      });
      setEmail("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Goal: {goalTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleShare} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your friend's email"
              required
            />
          </div>
          <Button type="submit" className="w-full">Share Goal</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};