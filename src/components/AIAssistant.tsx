import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, X, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AIDisclaimer } from "./ai/AIDisclaimer";
import { ChatMessage } from "./ai/ChatMessage";
import { generateGoalSuggestions, type SuggestedGoal } from "@/lib/ai/goal-suggestions";
import { getOpenAIClient } from "@/lib/ai/openai-client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedGoals?: SuggestedGoal[];
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
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userDescription, setUserDescription] = useState<string | null>(null);

  useEffect(() => {
    fetchUserGoals();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('description')
      .eq('id', session.user.id)
      .single();

    if (profile?.description) {
      setUserDescription(profile.description);
      suggestGoalsBasedOnProfile(profile.description);
    }
  };

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

  const suggestGoalsBasedOnProfile = async (description: string) => {
    if (!description) return;

    setIsLoading(true);
    try {
      const suggestedGoals = await generateGoalSuggestions(description);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: "Based on your profile, here are some suggested goals that might interest you:",
        suggestedGoals
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate goal suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedGoal = async (goal: SuggestedGoal) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('goals')
        .insert([{
          ...goal,
          progress: 0,
          user_id: session.user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal added successfully!",
      });

      fetchUserGoals();

    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setShowDisclaimer(false);
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setIsExpanded(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] p-4 shadow-lg flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsExpanded(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showDisclaimer && <AIDisclaimer />}

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <ChatMessage {...message} />
              {message.suggestedGoals && (
                <div className="ml-8 mt-2 space-y-2">
                  {message.suggestedGoals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {goal.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2"
                          onClick={() => handleAddSuggestedGoal(goal)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          placeholder="Ask me about your goals..."
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