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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('openai_api_key')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    let apiKey = profile?.openai_api_key;

    // If no key in profile, try to get from Supabase secrets
    if (!apiKey) {
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'OPENAI_API_KEY')
        .maybeSingle();
      
      if (secretError) {
        console.error('Error fetching OpenAI API key:', secretError);
      }
      
      apiKey = secretData?.secret;
    }

    if (!apiKey) {
      console.error('No OpenAI API key found');
      toast({
        title: "OpenAI API Key Required",
        description: "Please add your OpenAI API key in the settings to use AI features.",
        variant: "destructive",
      });
      throw new Error("OpenAI API key not found. Please add your API key in the settings.");
    }

    // Create OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    // Verify the API key works by making a simple test request
    try {
      await openai.chat.completions.create({
        messages: [{ role: 'system', content: 'Test' }],
        model: 'gpt-4o-mini',
        max_tokens: 5
      });
      console.log('OpenAI API key verified successfully');
    } catch (verifyError) {
      console.error('OpenAI API key verification failed:', verifyError);
      toast({
        title: "OpenAI API Key Error",
        description: "The provided API key appears to be invalid. Please check your settings.",
        variant: "destructive",
      });
      throw new Error("Invalid OpenAI API key");
    }

    return openai;
  } catch (error) {
    console.error('OpenAI client error:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to initialize OpenAI client",
      variant: "destructive",
    });
    throw error;
  }
};