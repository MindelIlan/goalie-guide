import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileAvatar = ({ userId, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const { toast } = useToast();

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

      onAvatarUpdate(publicUrl);
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
  );
};