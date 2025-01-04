import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUploader } from "./avatar/AvatarUploader";

interface ProfileAvatarProps {
  userId: string;
  avatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
}

export const ProfileAvatar = ({ userId, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={avatarUrl || ""} 
          alt="Profile picture"
          className="object-cover"
        />
        <AvatarFallback>
          {userId.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <AvatarUploader 
        userId={userId}
        onUploadComplete={(url) => onAvatarChange?.(url)}
      />
    </div>
  );
};