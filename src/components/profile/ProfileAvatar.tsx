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
  const [currentUrl, setCurrentUrl] = useState(avatarUrl);

  useEffect(() => {
    setCurrentUrl(avatarUrl);
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={!imageError ? (currentUrl || "") : ""}
          alt="Profile picture"
          className="object-cover"
          onError={() => setImageError(true)}
        />
        <AvatarFallback>
          {userId.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <AvatarUploader 
        userId={userId}
        onUploadComplete={(url) => {
          setImageError(false);
          setCurrentUrl(url);
          onAvatarChange?.(url);
        }}
      />
    </div>
  );
};