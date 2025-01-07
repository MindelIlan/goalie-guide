import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubgoalsList } from "../../SubgoalsList";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { id: 1, title: "New Subgoal", completed: false },
            error: null 
          }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}));

describe("SubgoalsList", () => {
  const defaultProps = {
    goalId: 1,
    onProgressUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add subgoal button when no subgoals exist", () => {
    render(<SubgoalsList {...defaultProps} />);
    expect(screen.getByText(/add subgoals/i)).toBeInTheDocument();
  });

  it("allows adding new subgoals", async () => {
    render(<SubgoalsList {...defaultProps} />);
    
    // Click to expand
    fireEvent.click(screen.getByText(/add subgoals/i));
    
    // Add new subgoal
    const input = screen.getByPlaceholderText(/add a new subgoal/i);
    fireEvent.change(input, { target: { value: "New Subgoal" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText("New Subgoal")).toBeInTheDocument();
    });
  });

  it("handles subgoal completion", async () => {
    render(<SubgoalsList {...defaultProps} />);
    
    // Click to expand
    fireEvent.click(screen.getByText(/add subgoals/i));
    
    // Add and complete a subgoal
    const input = screen.getByPlaceholderText(/add a new subgoal/i);
    fireEvent.change(input, { target: { value: "Test Subgoal" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(defaultProps.onProgressUpdate).toHaveBeenCalled();
    });
  });
});