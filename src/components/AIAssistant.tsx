import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageCircle, Bot, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Goal {
  title: string;
  description: string;
  progress: number;
  target_date: string;
  tags: string[];
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchUserGoals();
  }, []);

  const fetchUserGoals = async () => {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('title, description, progress, target_date, tags');

    if (error) {
      console.error('Error fetching goals:', error);
      return;
    }

    setUserGoals(goals || []);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { secret: OPENAI_API_KEY } } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'OPENAI_API_KEY')
        .single();

      if (!OPENAI_API_KEY) {
        toast({
          title: "Error",
          description: "OpenAI API key not found. Please add it in the project settings.",
          variant: "destructive",
        });
        return;
      }

      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

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

1. Help users create SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Break down complex goals into manageable steps
3. Provide actionable strategies and techniques for goal achievement
4. Offer motivation and accountability support
5. Help identify potential obstacles and develop contingency plans
6. Guide users in tracking and measuring their progress
7. Share relevant best practices and success stories

Always maintain a supportive, encouraging tone while being direct and practical in your advice. Ask clarifying questions when needed to better understand the user's situation and provide more targeted guidance. Reference the user's existing goals when relevant to provide personalized advice.`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        model: 'gpt-4',
      });

      const assistantMessage = {
        role: 'assistant' as const,
        content: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-lg">
      <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-700">
          Please note that the AI's responses are for guidance purposes only and may not always be accurate. 
          It's recommended to verify any specific advice before taking action.
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[400px] pr-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {message.role === 'user' ? (
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about setting and achieving your goals..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  );
};