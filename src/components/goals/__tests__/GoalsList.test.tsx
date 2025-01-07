import { render, screen, fireEvent } from "@testing-library/react";
import { GoalsList } from "../../GoalsList";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Goal } from "@/types/goals";

describe("GoalsList", () => {
  const mockGoals: Goal[] = [
    {
      id: 1,
      title: "Test Goal 1",
      description: "Description 1",
      progress: 0,
      target_date: "2024-12-31",
      tags: ["test"],
      created_at: "2024-01-01",
      folder_id: null,
      user_id: "test-user-id"
    },
    {
      id: 2,
      title: "Test Goal 2",
      description: "Description 2",
      progress: 50,
      target_date: "2024-12-31",
      tags: ["test"],
      created_at: "2024-01-01",
      folder_id: 1,
      user_id: "test-user-id"
    },
  ];

  const defaultProps = {
    goals: mockGoals,
    setGoals: vi.fn(),
    duplicateGoals: new Set<number>(),
    folderName: null as string | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders goals list with correct number of goals", () => {
    render(<GoalsList {...defaultProps} />);
    const goals = screen.getAllByRole("article");
    expect(goals).toHaveLength(mockGoals.length);
  });

  it("displays empty state when no goals are present", () => {
    render(<GoalsList {...defaultProps} goals={[]} duplicateGoals={new Set<number>()} />);
    expect(screen.getByText(/no goals/i)).toBeInTheDocument();
  });

  it("handles bulk selection of goals", () => {
    render(<GoalsList {...defaultProps} />);
    const goals = screen.getAllByRole("article");
    fireEvent.click(goals[0], { ctrlKey: true });
    expect(goals[0]).toHaveClass("border-primary");
  });

  it("shows folder name when provided", () => {
    const folderName = "Test Folder";
    render(<GoalsList {...defaultProps} folderName={folderName} />);
    expect(screen.getByText(folderName)).toBeInTheDocument();
  });
});