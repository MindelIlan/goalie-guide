import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  avatar_url: string | null;
  description: string | null;
}

interface SimilarGoal {
  id: number;
  title: string;
  description: string;
  progress: number;
  profiles: Profile;
}

export const SimilarGoals = ({ goalTitle }: { goalTitle: string }) => {
  const [similarGoals, setSimilarGoals] = useState<SimilarGoal[]>([]);

  useEffect(() => {
    fetchSimilarGoals();
  }, [goalTitle]);

  const fetchSimilarGoals = async () => {
    try {
      console.log("Fetching similar goals for title:", goalTitle);
      const { data: goals, error } = await supabase
        .from('goals')
        .select(`
          id,
          title,
          description,
          progress,
          profiles (
            id,
            avatar_url,
            description
          )
        `)
        .ilike('title', `%${goalTitle}%`)
        .limit(5);

      if (error) {
        console.error("Error fetching similar goals:", error);
        return;
      }

      console.log("Fetched goals:", goals);
      if (goals) {
        setSimilarGoals(goals);
      }
    } catch (error) {
      console.error("Error in fetchSimilarGoals:", error);
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
                <AvatarImage src={goal.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h5 className="font-medium">{goal.title}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {goal.profiles?.description || "No description available"}
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  Progress: {goal.progress}%
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};