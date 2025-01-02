import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { google } from 'lucide-react';

interface AuthFormProps {
  email: string;
  password: string;
  loading: boolean;
  language: 'he' | 'en';
  translations: any;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSignIn: (e: React.FormEvent) => Promise<void>;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

export const AuthForm = ({
  email,
  password,
  loading,
  language,
  translations: t,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onGoogleSignIn
}: AuthFormProps) => {
  const isPasswordValid = (password: string) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return minLength && hasNumber;
  };

  const isSignUpDisabled = loading || !email || !password || !isPasswordValid(password);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Input
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
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
          onClick={onSignIn}
          disabled={loading}
          className="flex-1"
          type="submit"
        >
          {t.signIn}
        </Button>
        <Button
          onClick={onSignUp}
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
        onClick={onGoogleSignIn}
        disabled={loading}
        className="w-full"
        type="button"
      >
        <google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </form>
  );
};