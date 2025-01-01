import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Auth } from './Auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('Auth Component', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it('renders auth form correctly', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('handles sign up successfully', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: {}, error: null });

    render(<Auth />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Check your email for the confirmation link!',
      });
    });
  });

  it('handles sign in successfully', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: {}, error: null });

    render(<Auth />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles Google sign in', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({ data: {}, error: null });

    render(<Auth />);
    fireEvent.click(screen.getByText('Google'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.any(String),
        },
      });
    });
  });

  it('handles sign up validation error', async () => {
    render(<Auth />);
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
    });
  });

  it('handles sign in validation error', async () => {
    render(<Auth />);
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
    });
  });

  it('handles auth error responses', async () => {
    const mockError = new Error('Auth error');
    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValueOnce(mockError);

    render(<Auth />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Auth error',
        variant: 'destructive',
      });
    });
  });
});