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

    return new OpenAI({
      apiKey: data.secret,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('OpenAI client error:', error);
    throw error;
  }
};