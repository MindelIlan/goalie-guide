import { render, screen, fireEvent } from "@testing-library/react";
import { GoalButtons } from "../GoalButtons";
import { vi, describe, it, expect } from "vitest";

describe("GoalButtons", () => {
  const defaultProps = {
    showSubgoals: false,
    showSimilar: false,
    onToggleSubgoals: vi.fn(),
    onToggleSimilar: vi.fn(),
  };

  it("renders both buttons", () => {
    render(<GoalButtons {...defaultProps} />);
    expect(screen.getByText(/subgoals/i)).toBeInTheDocument();
    expect(screen.getByText(/partner up/i)).toBeInTheDocument();
  });

  it("applies active state to subgoals button when showSubgoals is true", () => {
    render(<GoalButtons {...defaultProps} showSubgoals={true} />);
    const subgoalsButton = screen.getByText(/subgoals/i).closest("button");
    expect(subgoalsButton).toHaveClass("bg-gray-100");
  });

  it("applies active state to similar button when showSimilar is true", () => {
    render(<GoalButtons {...defaultProps} showSimilar={true} />);
    const similarButton = screen.getByText(/partner up/i).closest("button");
    expect(similarButton).toHaveClass("bg-gray-100");
  });

  it("calls onToggleSubgoals when subgoals button is clicked", () => {
    render(<GoalButtons {...defaultProps} />);
    fireEvent.click(screen.getByText(/subgoals/i));
    expect(defaultProps.onToggleSubgoals).toHaveBeenCalled();
  });

  it("calls onToggleSimilar when similar button is clicked", () => {
    render(<GoalButtons {...defaultProps} />);
    fireEvent.click(screen.getByText(/partner up/i));
    expect(defaultProps.onToggleSimilar).toHaveBeenCalled();
  });

  it("prevents event propagation when buttons are clicked", () => {
    const mockStopPropagation = vi.fn();
    render(<GoalButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/subgoals/i), {
      stopPropagation: mockStopPropagation,
    });
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });
});