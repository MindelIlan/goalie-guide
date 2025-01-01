import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  goalId: number;
  goalTitle: string;
  recipientEmail: string;
  senderEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Starting share-goal-email function execution");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for RESEND_API_KEY early
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables");
      throw new Error("RESEND_API_KEY is not configured. Please set up the API key in Supabase Edge Function secrets.");
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json();
    const { goalId, goalTitle, recipientEmail, senderEmail } = emailRequest;

    console.log("Processing email request:", {
      goalId,
      goalTitle,
      recipientEmail,
      senderEmail: senderEmail.replace(/@.*$/, '@...') // Log email domain safely
    });

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Send email using Resend
    console.log("Sending email via Resend API...");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Goal Tracker <goals@yourdomain.com>",
        to: [recipientEmail],
        subject: `${senderEmail} shared a goal with you: ${goalTitle}`,
        html: `
          <h2>You've been invited to view a goal!</h2>
          <p>${senderEmail} has shared their goal "${goalTitle}" with you.</p>
          <p>To view this goal, please sign up or log in to Goal Tracker:</p>
          <p><a href="${SUPABASE_URL}/auth/v1/authorize?provider=google">Join Goal Tracker</a></p>
          <p>Once you're signed up, you'll be able to see this goal in your dashboard.</p>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error response from Resend API:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in share-goal-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);