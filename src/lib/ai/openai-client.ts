import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

export const getOpenAIClient = async () => {
  const { data, error } = await supabase
    .from('secrets')
    .select('secret')
    .eq('name', 'OPENAI_API_KEY')
    .single();

  if (error || !data?.secret) {
    throw new Error("OpenAI API key not found");
  }

  return new OpenAI({
    apiKey: data.secret,
    dangerouslyAllowBrowser: true
  });
};