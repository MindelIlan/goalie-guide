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
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (avatarUrl) {
      // Add a timestamp to force image reload and bypass cache
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${avatarUrl}?t=${timestamp}`;
      setCurrentUrl(urlWithTimestamp);
      setImageError(false);
      console.log("Setting avatar URL with timestamp:", urlWithTimestamp);
    } else {
      setCurrentUrl(null);
    }
  }, [avatarUrl]);

  const handleImageError = () => {
    console.error("Error loading image:", currentUrl);
    setImageError(true);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        {!imageError && currentUrl ? (
          <AvatarImage 
            src={currentUrl}
            alt="Profile picture"
            className="object-cover"
            onError={handleImageError}
          />
        ) : (
          <AvatarFallback>
            {userId.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <AvatarUploader 
        userId={userId}
        onUploadComplete={(url) => {
          setImageError(false);
          onAvatarChange?.(url);
        }}
      />
    </div>
  );
};