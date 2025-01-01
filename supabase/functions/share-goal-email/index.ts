import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables");
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("RESEND_API_KEY is configured correctly");

    // Parse request body
    const emailRequest: EmailRequest = await req.json();
    const { goalId, goalTitle, recipientEmail, senderEmail } = emailRequest;

    console.log("Processing email request:", {
      goalId,
      goalTitle,
      recipientEmail,
      senderEmail: senderEmail.replace(/@.*$/, '@...') // Log email domain safely
    });

    // Send email using Resend
    console.log("Sending email via Resend API...");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Goal Tracker <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `${senderEmail} shared a goal with you: ${goalTitle}`,
        html: `
          <h2>You've been invited to view a goal!</h2>
          <p>${senderEmail} has shared their goal "${goalTitle}" with you.</p>
          <p>To view this goal, please sign up or log in to Goal Tracker:</p>
          <p><a href="${req.headers.get('origin')}">Join Goal Tracker</a></p>
          <p>Once you're signed up, you'll be able to see this goal in your dashboard.</p>
        `,
      }),
    });

    const resData = await res.json();
    console.log('Resend API response:', resData);

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resData)}`);
    }

    return new Response(JSON.stringify(resData), {
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