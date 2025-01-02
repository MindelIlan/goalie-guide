import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from 'react-icons/fc';
import { Globe } from 'lucide-react';

type Language = 'he' | 'en';

interface Translations {
  [key: string]: {
    title: string;
    email: string;
    password: string;
    passwordRequirements: string;
    signIn: string;
    signUp: string;
    continueWith: string;
    errors: {
      emailRequired: string;
      invalidCredentials: string;
      invalidEmail: string;
      signUpError: string;
      signInError: string;
    };
  };
}

const translations: Translations = {
  he: {
    title: 'ברוכים הבאים למעקב מטרות',
    email: 'אימייל',
    password: 'סיסמה',
    passwordRequirements: 'הסיסמה חייבת להכיל לפחות 6 תווים ומספר אחד',
    signIn: 'התחברות',
    signUp: 'הרשמה',
    continueWith: 'או המשך עם',
    errors: {
      emailRequired: 'נא להזין אימייל וסיסמה',
      invalidCredentials: 'אימייל או סיסמה לא תקינים',
      invalidEmail: 'נא להזין כתובת אימייל תקינה',
      signUpError: 'אירעה שגיאה במהלך ההרשמה',
      signInError: 'אירעה שגיאה במהלך ההתחברות'
    }
  },
  en: {
    title: 'Welcome to Goal Tracker',
    email: 'Email',
    password: 'Password',
    passwordRequirements: 'Password must be at least 6 characters long and contain at least one number',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    continueWith: 'Or continue with',
    errors: {
      emailRequired: 'Please enter email and password',
      invalidCredentials: 'Invalid email or password',
      invalidEmail: 'Please enter a valid email address',
      signUpError: 'An error occurred during sign up',
      signInError: 'An error occurred during sign in'
    }
  }
};

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('he');
  const { toast } = useToast();
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'he' ? 'en' : 'he');
  };

  const isPasswordValid = (password: string) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return minLength && hasNumber;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error(t.errors.emailRequired);
      }

      if (!isPasswordValid(password)) {
        throw new Error(t.passwordRequirements);
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
        title: t.signUp,
        description: language === 'he' ? 'בדוק את האימייל שלך לקישור האימות!' : 'Check your email for the verification link!',
      });
    } catch (error) {
      let message = t.errors.signUpError;
      if (error instanceof Error) {
        if (error.message.includes("invalid_credentials")) {
          message = t.errors.invalidCredentials;
        } else if (error.message.includes("email")) {
          message = t.errors.invalidEmail;
        } else {
          message = error.message;
        }
      }
      toast({
        title: language === 'he' ? 'שגיאה' : 'Error',
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
        throw new Error(t.errors.emailRequired);
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("invalid_credentials")) {
          throw new Error(t.errors.invalidCredentials);
        }
        throw error;
      }
    } catch (error) {
      let message = t.errors.signInError;
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: language === 'he' ? 'שגיאה' : 'Error',
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
        title: language === 'he' ? 'שגיאה' : 'Error',
        description: error instanceof Error ? error.message : t.errors.signInError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled = loading || !email || !password || !isPasswordValid(password);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className="absolute top-4 right-4 hover:bg-gray-100 transition-colors"
        aria-label={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
      >
        <Globe className="h-5 w-5" />
      </Button>
      
      <h2 className="text-2xl font-bold mb-6 text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {t.title}
      </h2>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir={language === 'he' ? 'rtl' : 'ltr'}
            className={language === 'he' ? 'text-right' : 'text-left'}
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            dir={language === 'he' ? 'rtl' : 'ltr'}
            className={language === 'he' ? 'text-right' : 'text-left'}
          />
          <p className={`text-sm text-gray-500 mt-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
            {t.passwordRequirements}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1"
            type="submit"
          >
            {t.signIn}
          </Button>
          <Button
            onClick={handleSignUp}
            disabled={isSignUpDisabled}
            variant="outline"
            className="flex-1"
            type="button"
          >
            {t.signUp}
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              {t.continueWith}
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