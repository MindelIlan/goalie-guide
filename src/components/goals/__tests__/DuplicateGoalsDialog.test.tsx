import { render, screen, fireEvent } from "@testing-library/react";
import { DuplicateGoalsDialog } from "../DuplicateGoalsDialog";
import { vi, describe, it, expect } from "vitest";
import { Goal } from "@/types/goals";

describe("DuplicateGoalsDialog", () => {
  const mockDuplicates: Goal[][] = [
    [
      {
        id: 1,
        title: "Test Goal 1",
        description: "Description 1",
        progress: 0,
        target_date: "2024-12-31",
        tags: ["test"],
        created_at: "2024-01-01",
        user_id: "test-user-id",
        folder_id: null
      },
      {
        id: 2,
        title: "Test Goal 1",
        description: "Description 1",
        progress: 0,
        target_date: "2024-12-31",
        tags: ["test"],
        created_at: "2024-01-01",
        user_id: "test-user-id",
        folder_id: null
      },
    ],
  ];

  const defaultProps = {
    duplicates: mockDuplicates,
    open: true,
    onOpenChange: vi.fn(),
    onDeleteGoal: vi.fn(),
  };

  it("renders dialog when open", () => {
    render(<DuplicateGoalsDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/duplicate goals found/i)).toBeInTheDocument();
  });

  it("doesn't render when closed", () => {
    render(<DuplicateGoalsDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays duplicate goals", () => {
    render(<DuplicateGoalsDialog {...defaultProps} />);
    mockDuplicates[0].forEach(goal => {
      expect(screen.getAllByText(goal.title).length).toBeGreaterThan(0);
    });
  });

  it("calls onDeleteGoal when delete button is clicked", () => {
    render(<DuplicateGoalsDialog {...defaultProps} />);
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeleteGoal).toHaveBeenCalledWith(mockDuplicates[0][0].id);
  });

  it("calls onOpenChange when dialog is closed", () => {
    render(<DuplicateGoalsDialog {...defaultProps} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows no duplicates message when duplicates array is empty", () => {
    render(<DuplicateGoalsDialog {...defaultProps} duplicates={[]} />);
    expect(screen.getByText(/no duplicate goals found/i)).toBeInTheDocument();
  });
});