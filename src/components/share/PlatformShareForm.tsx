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
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication error');
      }
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Prevent sharing with yourself
      if (user.email === email) {
        throw new Error("You cannot share a goal with yourself");
      }

      // Find profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw new Error('Failed to find user profile');
      }

      if (!profileData) {
        throw new Error('User not found. Please check the email address.');
      }

      // Check for existing share
      const { data: existingShare, error: existingError } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', goalId)
        .eq('shared_with', profileData.id)
        .maybeSingle();

      if (existingError) {
        console.error('Existing share check error:', existingError);
        throw new Error('Failed to check existing shares');
      }
      
      if (existingShare) {
        throw new Error('Goal already shared with this user');
      }

      // Share the goal
      const { error: shareError } = await supabase
        .from('shared_goals')
        .insert([{
          goal_id: goalId,
          shared_with: profileData.id,
          shared_by: user.id
        }]);

      if (shareError) {
        console.error('Share error:', shareError);
        throw new Error('Failed to share goal');
      }

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
        console.error('Notification error:', notificationError);
        // Don't throw here as the share was successful
      }

      setEmail("");
      onSuccess();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Share error:', err);
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