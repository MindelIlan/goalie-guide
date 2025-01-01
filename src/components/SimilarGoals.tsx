import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SimilarGoal {
  id: number;
  title: string;
  description: string;
  progress: number;
  user: {
    id: string;
    avatar_url: string | null;
    description: string | null;
  };
}

export const SimilarGoals = ({ goalTitle }: { goalTitle: string }) => {
  const [similarGoals, setSimilarGoals] = useState<SimilarGoal[]>([]);

  useEffect(() => {
    fetchSimilarGoals();
  }, [goalTitle]);

  const fetchSimilarGoals = async () => {
    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        description,
        progress,
        user_id,
        profiles!inner (
          id,
          avatar_url,
          description
        )
      `)
      .ilike('title', `%${goalTitle}%`)
      .limit(5);

    if (error) {
      console.error("Error fetching similar goals:", error);
    } else if (goals) {
      const formattedGoals = goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        progress: goal.progress,
        user: {
          id: goal.profiles.id,
          avatar_url: goal.profiles.avatar_url,
          description: goal.profiles.description
        }
      }));
      setSimilarGoals(formattedGoals);
    }
  };

  if (similarGoals.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-3">People with Similar Goals</h4>
      <div className="space-y-3">
        {similarGoals.map((goal) => (
          <Card key={goal.id} className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={goal.user.avatar_url || ""} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h5 className="font-medium">{goal.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{goal.user.description || "No description available"}</p>
                <div className="text-sm text-gray-500 mt-2">Progress: {goal.progress}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};