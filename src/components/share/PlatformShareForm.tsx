import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

interface PlatformShareFormProps {
  goalId: number;
  goalTitle: string;
  onSuccess: () => void;
}

export const PlatformShareForm = ({ goalId, goalTitle, onSuccess }: PlatformShareFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication error');
      if (!user) throw new Error('Not authenticated');

      // Find user profile by email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) throw new Error('Failed to find user');
      if (!profileData) throw new Error('User not found. Please check the email address.');

      // Check for existing share
      const { data: existingShare, error: existingError } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', goalId)
        .eq('shared_with', profileData.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') throw new Error('Failed to check existing shares');
      if (existingShare) throw new Error('Goal already shared with this user');

      // Share the goal
      const { error: shareError } = await supabase
        .from('shared_goals')
        .insert([{
          goal_id: goalId,
          shared_with: profileData.id,
          shared_by: user.id
        }]);

      if (shareError) throw new Error('Failed to share goal');

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: profileData.id,
          type: 'goal_shared',
          title: 'New Goal Shared With You',
          message: `${user.email} shared their goal "${goalTitle}" with you`
        }]);

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      setEmail("");
      onSuccess();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
  );
};