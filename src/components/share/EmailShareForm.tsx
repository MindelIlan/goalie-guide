import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

interface EmailShareFormProps {
  goalId: number;
  goalTitle: string;
  onSuccess: () => void;
}

export const EmailShareForm = ({ goalId, goalTitle, onSuccess }: EmailShareFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication error');
      if (!user) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('share-goal-email', {
        body: {
          goalId,
          goalTitle,
          recipientEmail: email,
          senderEmail: user.email
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invitation email');
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
  );
};