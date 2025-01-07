import { render, screen, fireEvent } from "@testing-library/react";
import { GoalCard } from "../../GoalCard";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Goal } from "@/types/goals";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}));

describe("GoalCard", () => {
  const mockGoal: Goal = {
    id: 1,
    title: "Test Goal",
    description: "Test Description",
    progress: 50,
    target_date: "2024-12-31",
    tags: ["test", "important"],
    created_at: "2024-01-01",
    folder_id: null,
    user_id: "test-user-id"
  };

  const defaultProps = {
    goal: mockGoal,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    isDuplicate: false,
    isSelected: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders goal details correctly", () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText(mockGoal.title)).toBeInTheDocument();
    expect(screen.getByText(mockGoal.description)).toBeInTheDocument();
    mockGoal.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("handles edit button click", () => {
    render(<GoalCard {...defaultProps} />);
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockGoal.id);
  });

  it("handles delete button click", () => {
    render(<GoalCard {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockGoal.id);
  });

  it("shows progress correctly", () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("applies duplicate styling when isDuplicate is true", () => {
    render(<GoalCard {...defaultProps} isDuplicate={true} />);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("border-yellow-400");
  });

  it("applies selected styling when isSelected is true", () => {
    render(<GoalCard {...defaultProps} isSelected={true} />);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("border-primary");
  });
});