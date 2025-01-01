import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  avatar_url: string | null;
  description: string | null;
}

export const Profile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<ProfileData>({ avatar_url: null, description: null });
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // First try to get the profile
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If no profile exists, create one
      if (!data && !error) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: userId }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return;
        }

        data = newProfile;
      } else if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      // Set the profile data
      if (data) {
        setProfile(data);
        setNewDescription(data.description || "");
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl });

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleSaveDescription = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, description: newDescription });

      if (error) throw error;

      setProfile({ ...profile, description: newDescription });
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

  return (
    <Card className="p-6 mb-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback>
              <User className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {isEditing ? (
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
              {profile.description || "No description yet"}
            </p>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Description
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
