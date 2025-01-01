import { getOpenAIClient } from "./openai-client";
import { Goal } from "@/types/goals";
import { toast } from "@/components/ui/use-toast";

export const generateGoalSuggestions = async (description: string): Promise<Goal[]> => {
  try {
    const openai = await getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that suggests personalized goals based on user descriptions. Provide 3 specific, actionable goals."
        },
        {
          role: "user",
          content: `Based on this description, suggest 3 specific goals: ${description}`
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const parsedResponse = JSON.parse(response);
    return parsedResponse.goals.map((goal: any) => ({
      title: goal.title,
      description: goal.description,
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      tags: goal.tags || [],
      progress: 0
    }));

  } catch (error) {
    console.error('Goal suggestion error:', error);
    toast({
      title: "Error",
      description: "Failed to generate goal suggestions. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};