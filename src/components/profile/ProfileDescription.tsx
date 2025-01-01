import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

interface ProfileDescriptionProps {
  userId: string;
  description: string | null;
  openai_api_key?: string | null;
  onDescriptionUpdate: (description: string) => void;
}

export const ProfileDescription = ({ 
  userId, 
  description, 
  openai_api_key,
  onDescriptionUpdate 
}: ProfileDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description || "");
  const [apiKey, setApiKey] = useState(openai_api_key || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateApiKey = (key: string): boolean => {
    if (!key) return true; // Allow empty key
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
    const newKey = e.target.value;
    setApiKey(newKey);
    validateApiKey(newKey);
  };

  const handleSaveDescription = async () => {
    if (!validateApiKey(apiKey)) {
      toast({
        title: "Invalid API Key",
        description: apiKeyError,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          description: newDescription,
          openai_api_key: apiKey 
        });

      if (error) throw error;

      onDescriptionUpdate(newDescription);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return isEditing ? (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <Label htmlFor="description">About Me</Label>
        <Textarea
          id="description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="openai-key">OpenAI API Key</Label>
        <div className="relative">
          <Input
            id="openai-key"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
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
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button onClick={handleSaveDescription}>
          Save
        </Button>
      </div>
    </div>
  ) : (
    <div className="w-full text-center">
      <p className="text-gray-600 mb-4">
        {description || "No description yet"}
      </p>
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Edit Profile
      </Button>
    </div>
  );
};