import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileAvatar = ({ userId, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({
      title: "Uploading...",
      description: "Your profile image is being uploaded",
    });

    try {
      // Get the current session to ensure we're authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be authenticated to upload images");
      }

      const fileExt = file.name.split(".").pop();
      // Use the authenticated user's ID in the file path
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file, {
          upsert: true // Enable upsert to replace existing files
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl });

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatarUrl || ""} />
        <AvatarFallback>
          <User className="w-12 h-12" />
        </AvatarFallback>
      </Avatar>
      <label
        htmlFor="avatar-upload"
        className={`absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <Camera className="w-4 h-4 text-white" />
        )}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  );
};