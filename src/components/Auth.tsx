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

  const isPasswordValid = (password: string) => {
    // Password must be at least 6 characters long and contain at least one number
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return minLength && hasNumber;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error("נא להזין אימייל וסיסמה");
      }

      if (!isPasswordValid(password)) {
        throw new Error("הסיסמה חייבת להכיל לפחות 6 תווים ומספר אחד");
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
        title: "הצלחה",
        description: "בדוק את האימייל שלך לקישור האימות!",
      });
    } catch (error) {
      let message = "אירעה שגיאה במהלך ההרשמה";
      if (error instanceof Error) {
        if (error.message.includes("invalid_credentials")) {
          message = "אימייל או סיסמה לא תקינים";
        } else if (error.message.includes("email")) {
          message = "נא להזין כתובת אימייל תקינה";
        } else {
          message = error.message;
        }
      }
      toast({
        title: "שגיאה",
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
        throw new Error("נא להזין אימייל וסיסמה");
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("invalid_credentials")) {
          throw new Error("אימייל או סיסמה שגויים");
        }
        throw error;
      }
    } catch (error) {
      let message = "אירעה שגיאה במהלך ההתחברות";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "שגיאה",
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
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה במהלך ההתחברות עם Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled = loading || !email || !password || !isPasswordValid(password);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ברוכים הבאים למעקב מטרות</h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="rtl"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            dir="rtl"
          />
          <p className="text-sm text-gray-500 mt-1 text-right">
            הסיסמה חייבת להכיל לפחות 6 תווים ומספר אחד
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1"
            type="submit"
          >
            התחברות
          </Button>
          <Button
            onClick={handleSignUp}
            disabled={isSignUpDisabled}
            variant="outline"
            className="flex-1"
            type="button"
          >
            הרשמה
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              או המשך עם
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