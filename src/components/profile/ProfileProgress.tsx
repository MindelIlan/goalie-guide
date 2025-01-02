import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ProfileProgressProps {
  userId: string;
}

export const ProfileProgress = ({ userId }: ProfileProgressProps) => {
  const [overallProgress, setOverallProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchGoalsProgress();
  }, [userId]);

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

  if (overallProgress === null) return null;

  return (
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
  );
};