import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  avatar_url: string | null;
  description: string | null;
  openai_api_key: string | null;
  username: string | null;
}

interface ProfileDataProps {
  userId: string;
  onProfileLoaded: (profile: ProfileData) => void;
}

export const ProfileData = ({ userId, onProfileLoaded }: ProfileDataProps) => {
  useEffect(() => {
    if (!userId) return;
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
        onProfileLoaded(data);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  return null; // This is a data-only component
};