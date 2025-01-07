import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const getOpenAIClient = async () => {
  try {
    // First try to get the API key from the user's profile
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('openai_api_key')
      .eq('id', session.user.id)
      .single();

    let apiKey = profile?.openai_api_key;

    // If no key in profile, try getting it from secrets
    if (!apiKey) {
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'OPENAI_API_KEY')
        .maybeSingle();

      if (secretError) {
        console.error('Error fetching OpenAI API key from secrets:', secretError);
      } else {
        apiKey = secretData?.secret;
      }
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
        model: 'gpt-3.5-turbo',
        max_tokens: 5
      });
      console.log('OpenAI API key verified successfully');
    } catch (verifyError: any) {
      console.error('OpenAI API key verification failed:', verifyError);
      let errorMessage = "The provided API key appears to be invalid.";
      
      if (verifyError?.status === 401) {
        errorMessage = "Invalid API key. Please check your settings.";
      } else if (verifyError?.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      }
      
      toast({
        title: "OpenAI API Key Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(`Invalid OpenAI API key: ${errorMessage}`);
    }

    return openai;
  } catch (error: any) {
    console.error('OpenAI client error:', error);
    let errorMessage = "Failed to initialize OpenAI client.";
    
    if (error.message.includes("not authenticated")) {
      errorMessage = "Please sign in to use AI features.";
    } else if (error.message.includes("API key not found")) {
      errorMessage = "Please add your OpenAI API key in settings.";
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  }
};