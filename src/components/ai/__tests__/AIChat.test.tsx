import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIChat } from '../AIChat';
import { generateAIResponse } from '@/lib/ai/chat-service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Message, Goal } from '@/types/goals';

// Mock the chat service
vi.mock('@/lib/ai/chat-service', () => ({
  generateAIResponse: vi.fn()
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('AIChat', () => {
  const mockProps = {
    messages: [] as Message[],
    setMessages: vi.fn(),
    userGoals: [] as Goal[],
    isLoading: false,
    setIsLoading: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AIChat {...mockProps} />);
    expect(screen.getByPlaceholderText(/ask me about your goals/i)).toBeInTheDocument();
  });

  it('handles empty input correctly', async () => {
    render(<AIChat {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    expect(generateAIResponse).not.toHaveBeenCalled();
    expect(mockProps.setMessages).not.toHaveBeenCalled();
  });

  it('sends message and updates state correctly', async () => {
    const mockResponse = 'AI response';
    (generateAIResponse as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    render(<AIChat {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockProps.setMessages).toHaveBeenCalled();
      expect(mockProps.setIsLoading).toHaveBeenCalledWith(true);
    });
  });

  it('handles API errors correctly', async () => {
    (generateAIResponse as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));

    render(<AIChat {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockProps.setMessages).toHaveBeenCalled();
      // Should rollback the optimistic update
      expect(mockProps.setMessages).toHaveBeenCalledTimes(2);
    });
  });
});