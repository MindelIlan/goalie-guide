import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareGoalDialog } from "../../ShareGoalDialog";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}));

describe("ShareGoalDialog", () => {
  const defaultProps = {
    goalId: 1,
    goalTitle: "Test Goal",
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog when open", () => {
    render(<ShareGoalDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/share goal/i)).toBeInTheDocument();
  });

  it("doesn't render when closed", () => {
    render(<ShareGoalDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows goal title", () => {
    render(<ShareGoalDialog {...defaultProps} />);
    expect(screen.getByText(defaultProps.goalTitle)).toBeInTheDocument();
  });

  it("calls onOpenChange when dialog is closed", () => {
    render(<ShareGoalDialog {...defaultProps} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows sharing options", () => {
    render(<ShareGoalDialog {...defaultProps} />);
    expect(screen.getByText(/share via email/i)).toBeInTheDocument();
    expect(screen.getByText(/share on platform/i)).toBeInTheDocument();
  });
});