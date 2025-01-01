import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AIDisclaimer } from "./ai/AIDisclaimer";
import { AIChat } from "./ai/AIChat";
import { generateGoalSuggestions } from "@/lib/ai/goal-suggestions";
import { Message, Goal } from "@/types/goals";

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

      <AIChat
        messages={messages}
        setMessages={setMessages}
        userGoals={userGoals}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </Card>
  );
};