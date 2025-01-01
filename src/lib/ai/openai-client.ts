import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const getOpenAIClient = async () => {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'OPENAI_API_KEY')
      .maybeSingle();

    if (error) {
      console.error('Error fetching OpenAI API key:', error);
      toast({
        title: "Error",
        description: "Failed to fetch OpenAI API key. Please try again later.",
        variant: "destructive",
      });
      throw new Error("Failed to fetch OpenAI API key");
    }

    if (!data?.secret) {
      toast({
        title: "API Key Missing",
        description: "OpenAI API key not found. Please add it in the Supabase settings.",
        variant: "destructive",
      });
      throw new Error("OpenAI API key not found");
    }

    // Verify that the key starts with "sk-" as all OpenAI API keys do
    if (!data.secret.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "The OpenAI API key appears to be invalid. It should start with 'sk-'.",
        variant: "destructive",
      });
      throw new Error("Invalid OpenAI API key format");
    }

    return new OpenAI({
      apiKey: data.secret,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('OpenAI client error:', error);
    throw error;
  }
};