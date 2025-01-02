import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { testOpenAIConnection } from "@/lib/ai/chat-service";

interface APIKeyFormProps {
  userId: string;
  apiKey: string;
}

export const APIKeyForm = ({ userId, apiKey }: APIKeyFormProps) => {
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const validateApiKey = (key: string): boolean => {
    if (!key) return true;
    if (!key.startsWith('sk-')) {
      setApiKeyError('OpenAI API key must start with "sk-"');
      return false;
    }
    if (key.length < 40) {
      setApiKeyError('OpenAI API key is too short');
      return false;
    }
    setApiKeyError(null);
    return true;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setNewApiKey(key);
    validateApiKey(key);
  };

  const handleTestApiKey = async () => {
    if (!validateApiKey(newApiKey)) {
      toast({
        title: "Invalid API Key",
        description: apiKeyError,
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const { error: saveError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          openai_api_key: newApiKey 
        });

      if (saveError) throw saveError;

      await testOpenAIConnection();
      
      toast({
        title: "Success",
        description: "OpenAI API key is valid and working!",
      });
    } catch (error) {
      console.error("Error testing API key:", error);
      toast({
        title: "Error",
        description: "Failed to verify OpenAI API key. Please check the key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="openai-key">OpenAI API Key</Label>
      <div className="relative">
        <Input
          id="openai-key"
          type={showApiKey ? "text" : "password"}
          value={newApiKey}
          onChange={handleApiKeyChange}
          placeholder="sk-..."
          className={`pr-10 ${apiKeyError ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showApiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {apiKeyError && (
        <p className="text-sm text-red-500">{apiKeyError}</p>
      )}
      <p className="text-sm text-gray-500">
        Your private API key will be securely stored and used for AI features.
      </p>
      <Button 
        variant="outline" 
        onClick={handleTestApiKey}
        disabled={isTesting || !newApiKey}
      >
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Key'
        )}
      </Button>
    </div>
  );
};