import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { generateAIResponse } from "@/lib/ai/chat-service";
import { Message, Goal } from "@/types/goals";

interface AIChatProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  userGoals: Goal[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AIChat = ({ messages, setMessages, userGoals, isLoading, setIsLoading }: AIChatProps) => {
  const [input, setInput] = useState('');

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse([...messages, userMessage], userGoals);
      const assistantMessage = {
        role: 'assistant' as const,
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
};