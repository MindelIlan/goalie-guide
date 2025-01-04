import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AvatarUploaderProps {
  userId: string;
  onUploadComplete: (url: string) => void;
}

export const AvatarUploader = ({ userId, onUploadComplete }: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Starting file upload process");

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Delete existing files
      const { data: oldFiles } = await supabase.storage
        .from("profile_images")
        .list(userId);

      if (oldFiles?.length) {
        await Promise.all(
          oldFiles.map((oldFile) =>
            supabase.storage
              .from("profile_images")
              .remove([`${userId}/${oldFile.name}`])
          )
        );
      }

      // Upload new file
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <label
      htmlFor="avatar-upload"
      className={`absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors ${
        isUploading ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {isUploading ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <Upload className="w-4 h-4 text-white" />
      )}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
        data-testid="avatar-upload-input"
      />
    </label>
  );
};