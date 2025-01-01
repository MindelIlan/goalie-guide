import { getOpenAIClient } from "./openai-client";
import { toast } from "@/components/ui/use-toast";

export interface SuggestedGoal {
  title: string;
  description: string;
  target_date: string;
  tags: string[];
}

export const generateGoalSuggestions = async (description: string): Promise<SuggestedGoal[]> => {
  try {
    const openai = await getOpenAIClient();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a goal-setting expert. Based on the user's profile description, suggest 3 SMART goals. 
          Format your response as JSON array with objects containing: title, description, target_date (YYYY-MM-DD, 3-6 months from now), and tags (array of relevant keywords).
          Make the goals specific, measurable, achievable, relevant, and time-bound.`
        },
        {
          role: 'user',
          content: `Based on this profile description, suggest 3 personalized goals: ${description}`
        }
      ],
      model: 'gpt-4',
    });

    const suggestedGoalsText = completion.choices[0]?.message?.content || '[]';
    return JSON.parse(suggestedGoalsText);
  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    toast({
      title: "Error",
      description: "Failed to generate goal suggestions. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};