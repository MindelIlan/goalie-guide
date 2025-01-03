import { getOpenAIClient } from "./openai-client";
import { Goal } from "@/types/goals";
import { toast } from "@/components/ui/use-toast";

export const testOpenAIConnection = async () => {
  try {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OpenAI connection successful!" if you can read this message.' }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('OpenAI Test Response:', response);
    toast({
      title: "OpenAI Connection Test",
      description: response || "No response received",
    });
    return response;
  } catch (error: any) {
    console.error('OpenAI connection test error:', error);
    const errorMessage = error.message || "Failed to connect to OpenAI";
    toast({
      title: "Error",
      description: `Failed to connect to OpenAI: ${errorMessage}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const generateAIResponse = async (messages: any[], userGoals: Goal[]) => {
  try {
    const openai = await getOpenAIClient();

    const goalsContext = userGoals.length > 0 
      ? `Here are the user's current goals:\n\n${userGoals.map((goal, index) => 
          `${index + 1}. ${goal.title} (Progress: ${goal.progress}%)\n` +
          `   Description: ${goal.description}\n` +
          `   Target Date: ${new Date(goal.target_date).toLocaleDateString()}\n` +
          `   Tags: ${goal.tags.join(', ')}`
        ).join('\n\n')}`
      : "The user hasn't set any goals yet.";

    const systemMessage = `You are an experienced goal-setting expert and personal development coach with years of experience helping individuals achieve their objectives. 

${goalsContext}

Your role is to:
1. Help users create SMART goals
2. Break down complex goals into manageable steps
3. Provide actionable strategies
4. Offer motivation and support
5. Help identify potential obstacles
6. Guide users in tracking progress
7. Share relevant best practices

Always maintain a supportive, encouraging tone while being direct and practical in your advice.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const errorMessage = error.message || "Failed to get response from AI";
    toast({
      title: "Error",
      description: `Failed to get response from AI assistant: ${errorMessage}`,
      variant: "destructive",
    });
    throw error;
  }
};