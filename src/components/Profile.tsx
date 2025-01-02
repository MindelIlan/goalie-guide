import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileDescription } from "./profile/ProfileDescription";
import { Progress } from "@/components/ui/progress";
import { AIGoalGenerator } from "./profile/AIGoalGenerator";

interface ProfileData {
  avatar_url: string | null;
  description: string | null;
  openai_api_key: string | null;
  username: string | null;
}

interface Goal {
  progress: number;
}

export const Profile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<ProfileData>({ 
    avatar_url: null, 
    description: null,
    openai_api_key: null,
    username: null
  });
  const [overallProgress, setOverallProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
    fetchGoalsProgress();
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

  const fetchGoalsProgress = async () => {
    try {
      const { data: goals, error } = await supabase
        .from("goals")
        .select("progress")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching goals:", error);
        return;
      }

      if (goals && goals.length > 1) {
        const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
        const averageProgress = Math.round(totalProgress / goals.length);
        setOverallProgress(averageProgress);
      } else {
        setOverallProgress(null);
      }
    } catch (error) {
      console.error("Error in fetchGoalsProgress:", error);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  const handleDescriptionUpdate = (description: string, username: string) => {
    setProfile(prev => ({ ...prev, description, username }));
  };

  const showAIGenerator = profile.description && profile.description.length >= 50;

  return (
    <Card className="p-6 mb-8">
      <div className="flex flex-col items-center space-y-4">
        <ProfileAvatar
          userId={userId}
          avatarUrl={profile.avatar_url}
          onAvatarChange={handleAvatarUpdate}
        />
        <div className="w-full">
          {overallProgress !== null && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Overall Goals Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-2"
                indicatorClassName="bg-primary transition-all"
              />
            </div>
          )}
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