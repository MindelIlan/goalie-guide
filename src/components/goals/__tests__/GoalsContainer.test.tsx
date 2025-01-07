import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoalsContainer } from "../GoalsContainer";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      update: vi.fn().mockReturnValue({ error: null }),
      select: vi.fn().mockReturnValue({ data: [], error: null }),
    })),
  },
}));

// Mock components
vi.mock("../GoalsHeader", () => ({
  GoalsHeader: () => <div data-testid="goals-header">Goals Header Mock</div>,
}));

vi.mock("../GoalsList", () => ({
  GoalsList: () => <div data-testid="goals-list">Goals List Mock</div>,
}));

vi.mock("../FoldersList", () => ({
  FoldersList: () => <div data-testid="folders-list">Folders List Mock</div>,
}));

describe("GoalsContainer", () => {
  const defaultProps = {
    userId: "test-user-id",
    onAddGoal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all main components", () => {
    render(
      <GoalsProvider>
        <GoalsContainer {...defaultProps} />
      </GoalsProvider>
    );

    expect(screen.getByTestId("goals-header")).toBeInTheDocument();
    expect(screen.getByTestId("goals-list")).toBeInTheDocument();
    expect(screen.getByTestId("folders-list")).toBeInTheDocument();
  });

  it("sets up real-time subscription on mount", () => {
    render(
      <GoalsProvider>
        <GoalsContainer {...defaultProps} />
      </GoalsProvider>
    );

    expect(supabase.channel).toHaveBeenCalled();
  });

  it("cleans up subscription on unmount", () => {
    const { unmount } = render(
      <GoalsProvider>
        <GoalsContainer {...defaultProps} />
      </GoalsProvider>
    );

    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});