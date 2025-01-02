import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ProfileFormProps {
  userId: string;
  description: string | null;
  username: string | null;
  onUpdate: (description: string, username: string) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ 
  userId, 
  description, 
  username,
  onUpdate,
  onCancel 
}: ProfileFormProps) => {
  const [newDescription, setNewDescription] = useState(description || "");
  const [newUsername, setNewUsername] = useState(username || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          description: newDescription,
          username: newUsername || null
        });

      if (error) throw error;

      onUpdate(newDescription, newUsername);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username (optional)</Label>
          <Input
            id="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter your username..."
          />
          {usernameError && (
            <p className="text-sm text-red-500">{usernameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About Me</Label>
          <Textarea
            id="description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};