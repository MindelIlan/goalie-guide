import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

export const getOpenAIClient = async () => {
  const { data, error } = await supabase
    .from('secrets')
    .select('secret')
    .eq('name', 'OPENAI_API_KEY')
    .maybeSingle();

  if (error) {
    console.error('Error fetching OpenAI API key:', error);
    throw new Error("Failed to fetch OpenAI API key");
  }

  if (!data?.secret) {
    throw new Error("OpenAI API key not found. Please make sure you've added it to your secrets.");
  }

  return new OpenAI({
    apiKey: data.secret,
    dangerouslyAllowBrowser: true
  });
};