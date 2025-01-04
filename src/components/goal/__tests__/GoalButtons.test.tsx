import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { GoalButtons } from "../GoalButtons";

describe("GoalButtons", () => {
  const defaultProps = {
    showSubgoals: false,
    showSimilar: false,
    onToggleSubgoals: vi.fn(),
    onToggleSimilar: vi.fn(),
  };

  it("renders both buttons", () => {
    render(<GoalButtons {...defaultProps} />);
    expect(screen.getByText("Subgoals")).toBeInTheDocument();
    expect(screen.getByText("Similar Goals")).toBeInTheDocument();
  });

  it("applies active state class when showSubgoals is true", () => {
    render(<GoalButtons {...defaultProps} showSubgoals={true} />);
    const subgoalsButton = screen.getByText("Subgoals").closest("button");
    expect(subgoalsButton).toHaveClass("bg-gray-100");
  });

  it("applies active state class when showSimilar is true", () => {
    render(<GoalButtons {...defaultProps} showSimilar={true} />);
    const similarButton = screen.getByText("Similar Goals").closest("button");
    expect(similarButton).toHaveClass("bg-gray-100");
  });

  it("calls onToggleSubgoals and stops event propagation when subgoals button is clicked", () => {
    const onToggleSubgoals = vi.fn();
    render(<GoalButtons {...defaultProps} onToggleSubgoals={onToggleSubgoals} />);
    
    const mockEvent = { stopPropagation: vi.fn() };
    const subgoalsButton = screen.getByText("Subgoals");
    
    fireEvent.click(subgoalsButton, mockEvent);
    
    expect(onToggleSubgoals).toHaveBeenCalledTimes(1);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it("calls onToggleSimilar and stops event propagation when similar goals button is clicked", () => {
    const onToggleSimilar = vi.fn();
    render(<GoalButtons {...defaultProps} onToggleSimilar={onToggleSimilar} />);
    
    const mockEvent = { stopPropagation: vi.fn() };
    const similarButton = screen.getByText("Similar Goals");
    
    fireEvent.click(similarButton, mockEvent);
    
    expect(onToggleSimilar).toHaveBeenCalledTimes(1);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});