import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { generateGoalSuggestions } from "@/lib/ai/goal-suggestions";

interface AIGoalGeneratorProps {
  description: string;
  userId: string;
}

export const AIGoalGenerator = ({ description, userId }: AIGoalGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateGoals = async () => {
    try {
      setIsGenerating(true);
      
      // First, get or create the Profile Goals folder
      const { data: folderData, error: folderError } = await supabase
        .rpc('get_or_create_profile_goals_folder', {
          user_id_param: userId
        });

      if (folderError) throw folderError;

      const folderId = folderData;
      const suggestedGoals = await generateGoalSuggestions(description);

      // Insert each suggested goal into the database with the folder_id
      for (const goal of suggestedGoals) {
        const { error } = await supabase.from("goals").insert([
          {
            title: goal.title,
            description: goal.description,
            target_date: goal.target_date,
            tags: goal.tags,
            user_id: userId,
            progress: 0,
            folder_id: folderId // Add the folder_id here
          },
        ]);

        if (error) {
          console.error("Error creating goal:", error);
          throw error;
        }
      }

      toast({
        title: "Goals Generated!",
        description: `${suggestedGoals.length} goals have been created in your Profile Goals folder.`,
      });
    } catch (error) {
      console.error("Error generating goals:", error);
      toast({
        title: "Error",
        description: "Failed to generate goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleGenerateGoals}
      disabled={isGenerating}
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Generating Goals..." : "Generate AI Goals"}
    </Button>
  );
};