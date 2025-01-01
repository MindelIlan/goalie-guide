import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareGoalDialogProps {
  goalId: number;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareGoalDialog = ({ goalId, goalTitle, open, onOpenChange }: ShareGoalDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlatformShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First, get the user ID from profiles using their email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .maybeSingle();

      if (userError) throw new Error('Failed to find user');
      if (!userData) throw new Error('User not found. Please check the email address.');

      // Get current user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication error');
      if (!user) throw new Error('Not authenticated');

      // Check if goal is already shared with this user
      const { data: existingShare, error: existingError } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', goalId)
        .eq('shared_with', userData.id)
        .maybeSingle();

      if (existingError) throw new Error('Failed to check existing shares');
      if (existingShare) throw new Error('Goal already shared with this user');

      // Share the goal
      const { error: shareError } = await supabase
        .from('shared_goals')
        .insert([
          {
            goal_id: goalId,
            shared_with: userData.id,
            shared_by: user.id
          }
        ]);

      if (shareError) throw new Error('Failed to share goal');

      // Create notification for the recipient
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userData.id,
            type: 'goal_shared',
            title: 'New Goal Shared With You',
            message: `${user.email} shared their goal "${goalTitle}" with you`
          }
        ]);

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't throw here as the share was successful
      }

      toast({
        title: "Success",
        description: "Goal shared successfully!",
      });
      
      setEmail("");
      onOpenChange(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication error');
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/share-goal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          goalTitle,
          recipientEmail: email,
          senderEmail: user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation email');
      }

      toast({
        title: "Success",
        description: "Invitation email sent successfully!",
      });
      
      setEmail("");
      onOpenChange(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Goal: {goalTitle}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platform">Share with User</TabsTrigger>
            <TabsTrigger value="email">Invite by Email</TabsTrigger>
          </TabsList>

          <TabsContent value="platform">
            <form onSubmit={handlePlatformShare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-email">User's Email</Label>
                <Input
                  id="platform-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user's email"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sharing..." : "Share Goal"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            <form onSubmit={handleEmailShare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Friend's Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your friend's email"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};