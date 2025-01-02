import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./ProfileForm";
import { APIKeyForm } from "./APIKeyForm";

interface ProfileDescriptionProps {
  userId: string;
  description: string | null;
  username: string | null;
  openai_api_key?: string | null;
  onDescriptionUpdate: (description: string, username: string) => void;
}

export const ProfileDescription = ({ 
  userId, 
  description,
  username,
  openai_api_key,
  onDescriptionUpdate 
}: ProfileDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (newDescription: string, newUsername: string) => {
    onDescriptionUpdate(newDescription, newUsername);
    setIsEditing(false);
  };

  return isEditing ? (
    <div className="w-full space-y-6">
      <ProfileForm
        userId={userId}
        description={description}
        username={username}
        onUpdate={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
      <APIKeyForm
        userId={userId}
        apiKey={openai_api_key || ""}
      />
    </div>
  ) : (
    <div className="w-full text-center">
      {username && (
        <p className="text-lg font-semibold mb-2">@{username}</p>
      )}
      <p className="text-gray-600 mb-4">
        {description || "No description yet"}
      </p>
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit Profile
      </Button>
    </div>
  );
};