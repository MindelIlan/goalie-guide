import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileDescription } from "./profile/ProfileDescription";

interface ProfileData {
  avatar_url: string | null;
  description: string | null;
}

export const Profile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<ProfileData>({ avatar_url: null, description: null });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!data && !error) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: userId }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return;
        }

        data = newProfile;
      } else if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile({ ...profile, avatar_url: url });
  };

  const handleDescriptionUpdate = (description: string) => {
    setProfile({ ...profile, description });
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex flex-col items-center space-y-4">
        <ProfileAvatar
          userId={userId}
          avatarUrl={profile.avatar_url}
          onAvatarUpdate={handleAvatarUpdate}
        />
        <ProfileDescription
          userId={userId}
          description={profile.description}
          onDescriptionUpdate={handleDescriptionUpdate}
        />
      </div>
    </Card>
  );
};