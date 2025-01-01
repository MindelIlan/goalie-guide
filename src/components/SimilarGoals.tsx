import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  profile: Profile;
}

export const SimilarGoals = ({ goalTitle }: { goalTitle: string }) => {
  const [similarGoals, setSimilarGoals] = useState<SimilarGoal[]>([]);
  const { toast } = useToast();

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
          profile:profiles!goals_user_id_fkey_profiles (
            id,
            avatar_url,
            description
          )
        `)
        .neq('title', goalTitle)
        .ilike('title', `%${goalTitle}%`)
        .limit(5);

      if (error) {
        console.error("Error fetching similar goals:", error);
        return;
      }

      console.log("Fetched goals:", goals);
      if (goals) {
        // Transform the data to match our expected type
        const formattedGoals = goals.map(goal => ({
          ...goal,
          profile: Array.isArray(goal.profile) ? goal.profile[0] : goal.profile
        })) as SimilarGoal[];
        
        setSimilarGoals(formattedGoals);

        // Show toast message if no similar goals are found
        if (formattedGoals.length === 0) {
          toast({
            title: "No similar goals found",
            description: "Be the first one to create a goal like this! Others might join you soon.",
            duration: 5000,
          });
        }
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
                <AvatarImage src={goal.profile?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h5 className="font-medium">{goal.title}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {goal.profile?.description || "No description available"}
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