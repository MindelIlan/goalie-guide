import { render, screen, fireEvent } from "@testing-library/react";
import { GoalsList } from "../../GoalsList";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("GoalsList", () => {
  const mockGoals = [
    {
      id: 1,
      title: "Test Goal 1",
      description: "Description 1",
      progress: 0,
      target_date: "2024-12-31",
      tags: ["test"],
      created_at: "2024-01-01",
    },
    {
      id: 2,
      title: "Test Goal 2",
      description: "Description 2",
      progress: 50,
      target_date: "2024-12-31",
      tags: ["test"],
      created_at: "2024-01-01",
    },
  ];

  const defaultProps = {
    goals: mockGoals,
    setGoals: vi.fn(),
    duplicateGoals: new Set(),
    folderName: null,
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
    render(<GoalsList {...defaultProps} goals={[]} />);
    
    expect(screen.getByText(/no goals/i)).toBeInTheDocument();
  });

  it("handles bulk selection of goals", () => {
    render(<GoalsList {...defaultProps} />);
    
    const goals = screen.getAllByRole("article");
    fireEvent.click(goals[0], { ctrlKey: true });
    
    expect(goals[0]).toHaveClass("border-primary");
  });

  it("shows folder name when provided", () => {
    render(<GoalsList {...defaultProps} folderName="Test Folder" />);
    
    expect(screen.getByText("Test Folder")).toBeInTheDocument();
  });
});