import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { GoalCard } from "../../GoalCard";

// Mock the components that are not directly tested
vi.mock("../GoalProgress", () => ({
  GoalProgress: () => <div data-testid="goal-progress">Progress Mock</div>,
}));

vi.mock("../GoalHeader", () => ({
  GoalHeader: () => <div data-testid="goal-header">Header Mock</div>,
}));

vi.mock("../GoalTargetDate", () => ({
  GoalTargetDate: () => <div data-testid="goal-target-date">Target Date Mock</div>,
}));

vi.mock("../../SubgoalsList", () => ({
  SubgoalsList: () => <div data-testid="subgoals-list">Subgoals Mock</div>,
}));

vi.mock("../../SimilarGoals", () => ({
  SimilarGoals: () => <div data-testid="similar-goals">Similar Goals Mock</div>,
}));

describe("GoalCard", () => {
  const mockGoal = {
    id: 1,
    title: "Test Goal",
    description: "Test Description",
    progress: 0,
    target_date: "2024-12-31",
    tags: ["test"],
    created_at: "2024-01-01",
  };

  const defaultProps = {
    goal: mockGoal,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  it("toggles subgoals visibility when subgoals button is clicked", () => {
    render(<GoalCard {...defaultProps} />);
    
    // Initially, subgoals should not be visible
    expect(screen.queryByTestId("subgoals-list")).not.toBeInTheDocument();
    
    // Click the subgoals button
    fireEvent.click(screen.getByText("Subgoals"));
    
    // Subgoals should now be visible
    expect(screen.getByTestId("subgoals-list")).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(screen.getByText("Subgoals"));
    
    // Subgoals should be hidden again
    expect(screen.queryByTestId("subgoals-list")).not.toBeInTheDocument();
  });

  it("toggles similar goals visibility when similar goals button is clicked", () => {
    render(<GoalCard {...defaultProps} />);
    
    // Initially, similar goals should not be visible
    expect(screen.queryByTestId("similar-goals")).not.toBeInTheDocument();
    
    // Click the similar goals button
    fireEvent.click(screen.getByText("Similar Goals"));
    
    // Similar goals should now be visible
    expect(screen.getByTestId("similar-goals")).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(screen.getByText("Similar Goals"));
    
    // Similar goals should be hidden again
    expect(screen.queryByTestId("similar-goals")).not.toBeInTheDocument();
  });

  it("closes similar goals when opening subgoals", () => {
    render(<GoalCard {...defaultProps} />);
    
    // Open similar goals first
    fireEvent.click(screen.getByText("Similar Goals"));
    expect(screen.getByTestId("similar-goals")).toBeInTheDocument();
    
    // Open subgoals
    fireEvent.click(screen.getByText("Subgoals"));
    
    // Similar goals should be hidden and subgoals should be visible
    expect(screen.queryByTestId("similar-goals")).not.toBeInTheDocument();
    expect(screen.getByTestId("subgoals-list")).toBeInTheDocument();
  });

  it("closes subgoals when opening similar goals", () => {
    render(<GoalCard {...defaultProps} />);
    
    // Open subgoals first
    fireEvent.click(screen.getByText("Subgoals"));
    expect(screen.getByTestId("subgoals-list")).toBeInTheDocument();
    
    // Open similar goals
    fireEvent.click(screen.getByText("Similar Goals"));
    
    // Subgoals should be hidden and similar goals should be visible
    expect(screen.queryByTestId("subgoals-list")).not.toBeInTheDocument();
    expect(screen.getByTestId("similar-goals")).toBeInTheDocument();
  });

  it("prevents event propagation when clicking buttons", () => {
    const onSelect = vi.fn();
    render(<GoalCard {...defaultProps} onSelect={onSelect} />);
    
    // Click the subgoals button
    fireEvent.click(screen.getByText("Subgoals"));
    
    // The onSelect handler should not be called
    expect(onSelect).not.toHaveBeenCalled();
  });
});