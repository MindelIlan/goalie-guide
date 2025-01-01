import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const getOpenAIClient = async () => {
  try {
    // First try to get the API key from the user's profile
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('openai_api_key')
      .eq('id', session.user.id)
      .single();

    let apiKey = profile?.openai_api_key;

    // If no key in profile, try to get from Supabase secrets
    if (!apiKey) {
      const { data: secretData } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'OPENAI_API_KEY')
        .single();
      
      apiKey = secretData?.secret;
    }

    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  } catch (error) {
    console.error('OpenAI client error:', error);
    throw error;
  }
};