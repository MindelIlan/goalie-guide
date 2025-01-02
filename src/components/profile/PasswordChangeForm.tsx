import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
};