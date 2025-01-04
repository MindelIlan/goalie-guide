import { Loader2, Upload } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploaderProps {
  userId: string;
  onUploadComplete: (url: string) => void;
}

export const AvatarUploader = ({ userId, onUploadComplete }: AvatarUploaderProps) => {
  const { isUploading, handleUpload } = useAvatarUpload(userId, onUploadComplete);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleUpload(file);
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