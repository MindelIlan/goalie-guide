import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from 'react-icons/fc';
import { Globe } from 'lucide-react';
import { AuthForm } from './auth/AuthForm';
import { createWelcomeNotification } from './auth/WelcomeNotification';
import { translations } from './auth/translations';

type Language = 'he' | 'en';

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error(t.errors.emailRequired);
      }
      
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;

      // Create welcome notification for new user
      if (user) {
        await createWelcomeNotification(user.id);
      }

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
      
      <AuthForm
        email={email}
        password={password}
        loading={loading}
        language={language}
        translations={t}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
};