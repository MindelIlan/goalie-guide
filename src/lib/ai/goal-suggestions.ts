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
          content: `You are a helpful AI assistant that suggests personalized goals based on user descriptions. 
          Provide 3 specific, actionable goals in JSON format.
          The response should be a valid JSON object with a 'goals' array containing objects with 'title', 'description', and 'tags' fields.`
        },
        {
          role: "user",
          content: `Based on this description, suggest 3 specific goals in JSON format: ${description}`
        }
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsedResponse = JSON.parse(response);
      if (!parsedResponse.goals || !Array.isArray(parsedResponse.goals)) {
        throw new Error("Invalid response format from OpenAI");
      }

      return parsedResponse.goals.map((goal: any) => ({
        title: goal.title || "Untitled Goal",
        description: goal.description || "",
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        tags: Array.isArray(goal.tags) ? goal.tags : [],
        progress: 0
      }));
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error("Failed to parse OpenAI response");
    }

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