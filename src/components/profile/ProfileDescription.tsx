import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ProfileDescriptionProps {
  userId: string;
  description: string | null;
  onDescriptionUpdate: (description: string) => void;
}

export const ProfileDescription = ({ userId, description, onDescriptionUpdate }: ProfileDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description || "");
  const { toast } = useToast();

  const handleSaveDescription = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, description: newDescription });

      if (error) throw error;

      onDescriptionUpdate(newDescription);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile description updated successfully",
      });
    } catch (error) {
      console.error("Error updating description:", error);
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  return isEditing ? (
    <div className="w-full space-y-4">
      <Textarea
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        placeholder="Tell us about yourself..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button onClick={handleSaveDescription}>
          Save
        </Button>
      </div>
    </div>
  ) : (
    <div className="w-full text-center">
      <p className="text-gray-600 mb-4">
        {description || "No description yet"}
      </p>
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit Description
      </Button>
    </div>
  );
};