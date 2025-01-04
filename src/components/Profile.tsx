import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileDescription } from "./profile/ProfileDescription";
import { ProfileProgress } from "./profile/ProfileProgress";
import { ProfileData } from "./profile/ProfileData";
import { AIGoalGenerator } from "./profile/AIGoalGenerator";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  avatar_url: string | null;
  description: string | null;
  openai_api_key: string | null;
  username: string | null;
}

export const Profile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<ProfileData>({ 
    avatar_url: null, 
    description: null,
    openai_api_key: null,
    username: null
  });

  useEffect(() => {
    // Subscribe to realtime profile changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile update received:', payload);
          if (payload.new) {
            setProfile(prev => ({ ...prev, ...payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleAvatarUpdate = (url: string) => {
    console.log('Avatar update:', url);
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  const handleDescriptionUpdate = (description: string, username: string) => {
    console.log('Description update:', { description, username });
    setProfile(prev => ({ ...prev, description, username }));
  };

  const showAIGenerator = profile.description && profile.description.length >= 50;

  return (
    <Card className="p-6 mb-8">
      <ProfileData userId={userId} onProfileLoaded={setProfile} />
      <div className="flex flex-col items-center space-y-4">
        <ProfileAvatar
          userId={userId}
          avatarUrl={profile.avatar_url}
          onAvatarChange={handleAvatarUpdate}
        />
        <div className="w-full">
          <ProfileProgress userId={userId} />
          <ProfileDescription
            userId={userId}
            description={profile.description}
            username={profile.username}
            openai_api_key={profile.openai_api_key}
            onDescriptionUpdate={handleDescriptionUpdate}
          />
          {showAIGenerator && (
            <div className="mt-4">
              <AIGoalGenerator 
                description={profile.description || ""} 
                userId={userId}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};