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
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  useEffect(() => {
    console.log("Avatar URL updated:", avatarUrl);
    setCurrentAvatarUrl(avatarUrl);
    setImageError(false);
  }, [avatarUrl]);

  const handleImageError = () => {
    console.error("Avatar image failed to load:", currentAvatarUrl);
    setImageError(true);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={!imageError ? (currentAvatarUrl || "") : ""}
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
          setCurrentAvatarUrl(url);
          onAvatarChange?.(url);
        }}
      />
    </div>
  );
};