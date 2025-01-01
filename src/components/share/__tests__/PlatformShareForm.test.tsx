import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlatformShareForm } from '../PlatformShareForm';
import { supabase } from '@/lib/supabase';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('PlatformShareForm', () => {
  const mockProps = {
    goalId: 1,
    goalTitle: 'Test Goal',
    onSuccess: vi.fn(),
  };

  const mockUser: User = {
    id: 'test-user-id',
    email: 'current@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    role: '',
    aal: '',
    amr: [{ method: '', timestamp: 0 }],
    last_sign_in_at: '',
    session_id: '',
    phone: '',
    confirmed_at: '',
    email_confirmed_at: '',
    phone_confirmed_at: '',
    last_password_change: '',
    factors: [],
    updated_at: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<PlatformShareForm {...mockProps} />);
    
    expect(screen.getByLabelText(/user's email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share goal/i })).toBeInTheDocument();
  });

  it('shows error when sharing with own email', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    render(<PlatformShareForm {...mockProps} />);
    
    const emailInput = screen.getByLabelText(/user's email/i);
    fireEvent.change(emailInput, { target: { value: mockUser.email } });
    
    const submitButton = screen.getByRole('button', { name: /share goal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you cannot share a goal with yourself/i)).toBeInTheDocument();
    });
  });

  it('shows error when user not found', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: vi.fn(),
    }));

    render(<PlatformShareForm {...mockProps} />);
    
    const emailInput = screen.getByLabelText(/user's email/i);
    fireEvent.change(emailInput, { target: { value: 'other@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /share goal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess when share is successful', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ 
            data: { id: '123', email: 'other@example.com' },
            error: null 
          }),
        }),
      }),
      insert: () => Promise.resolve({ error: null }),
    }));

    render(<PlatformShareForm {...mockProps} />);
    
    const emailInput = screen.getByLabelText(/user's email/i);
    fireEvent.change(emailInput, { target: { value: 'other@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /share goal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });
});