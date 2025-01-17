import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { validateFile, generateFilePath } from "@/utils/fileUtils";

export const useAvatarUpload = (userId: string, onUploadComplete: (url: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    console.log("File upload initiated");
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    setIsUploading(true);
    console.log("Starting upload process");

    try {
      validateFile(file);
      const filePath = generateFilePath(userId, file);
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
    }
  };

  return { isUploading, handleUpload };
};