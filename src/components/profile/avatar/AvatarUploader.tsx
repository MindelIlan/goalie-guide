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
    console.log("File upload initiated");
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    console.log("File type:", file.type);
    
    if (!validTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      console.error("File too large:", file.size);
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    console.log("Starting upload process");

    try {
      // Generate file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log("Generated file path:", filePath);

      // Delete old files
      console.log("Checking for old files");
      const { data: oldFiles, error: listError } = await supabase.storage
        .from("profile_images")
        .list(userId);

      if (listError) {
        console.error("Error listing old files:", listError);
        throw listError;
      }

      if (oldFiles?.length) {
        console.log("Deleting old files:", oldFiles.length);
        await Promise.all(
          oldFiles.map((oldFile) =>
            supabase.storage
              .from("profile_images")
              .remove([`${userId}/${oldFile.name}`])
          )
        );
      }

      // Upload new file
      console.log("Uploading new file");
      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      console.log("Getting public URL");
      const { data: { publicUrl } } = supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      // Update profile
      console.log("Updating profile with new avatar URL");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      console.log("Upload complete:", publicUrl);
      onUploadComplete(publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
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