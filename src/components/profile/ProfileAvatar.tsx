import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUploader } from "./avatar/AvatarUploader";
import { useState, useEffect } from "react";

interface ProfileAvatarProps {
  userId: string;
  avatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
}

export const ProfileAvatar = ({ userId, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log("Avatar URL in ProfileAvatar:", avatarUrl);
    if (avatarUrl) {
      setImageError(false);
    }
  }, [avatarUrl]);

  const handleImageError = () => {
    console.error("Avatar image failed to load:", avatarUrl);
    setImageError(true);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={!imageError && avatarUrl ? avatarUrl : ""}
          alt="Profile picture"
          className="object-cover"
          onError={handleImageError}
        />
        <AvatarFallback>
          {userId.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <AvatarUploader 
        userId={userId}
        onUploadComplete={(url) => {
          console.log("Upload completed with URL:", url);
          setImageError(false);
          onAvatarChange?.(url);
        }}
      />
    </div>
  );
};