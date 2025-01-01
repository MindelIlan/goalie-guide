import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Copy, CheckCircle2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { generateAIResponse } from "@/lib/ai/chat-service";
import { Message, Goal } from "@/types/goals";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userGoals: Goal[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AIChat = ({ 
  messages, 
  setMessages, 
  userGoals, 
  isLoading, 
  setIsLoading 
}: AIChatProps) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleError = (error: Error) => {
    console.error('Chat Error:', error);
    setError(error.message);
    toast({
      title: "Error",
      description: "Failed to send message. Please try again.",
      variant: "destructive",
    });
  };

  const copyError = async () => {
    if (error) {
      await navigator.clipboard.writeText(error);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: "Error message copied to clipboard",
      });
    }
  };

  const validateInput = (text: string): boolean => {
    if (!text.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!validateInput(input) || isLoading) return;

      const userMessage: Message = { 
        role: 'user', 
        content: input.trim() 
      };

      // Update messages optimistically
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);

      const response = await generateAIResponse([...messages, userMessage], userGoals);
      
      if (!response) {
        throw new Error('No response received from AI service');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (error) {
      handleError(error as Error);
      // Rollback the optimistic update
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.content !== input.trim())
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span className="font-mono text-sm whitespace-pre-wrap">{error}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyError}
                  className="h-8 w-8"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
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
                              <span 
                                key={tagIndex} 
                                className="text-xs bg-gray-200 px-2 py-0.5 rounded-full"
                              >
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
          aria-label="Message input"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
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