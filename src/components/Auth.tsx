import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from 'react-icons/fc';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }
      
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Check your email for the confirmation link!",
      });
    } catch (error) {
      let message = "An error occurred during sign up";
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes("invalid_credentials")) {
          message = "Invalid email or password format";
        } else if (error.message.includes("email")) {
          message = "Please enter a valid email address";
        } else {
          message = error.message;
        }
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("invalid_credentials")) {
          throw new Error("Invalid email or password");
        }
        throw error;
      }
    } catch (error) {
      let message = "An error occurred during sign in";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during Google sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Goal Tracker</h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1"
            type="submit"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            disabled={loading}
            variant="outline"
            className="flex-1"
            type="button"
          >
            Sign Up
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
          type="button"
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
      </form>
    </div>
  );
};