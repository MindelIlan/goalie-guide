import { render, screen, fireEvent } from "@testing-library/react";
import { GoalHeader } from "../GoalHeader";
import { vi, describe, it, expect } from "vitest";

describe("GoalHeader", () => {
  const defaultProps = {
    title: "Test Goal",
    description: "Test Description",
    tags: ["test", "important"],
    isHovered: false,
    onShare: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders goal title and description", () => {
    render(<GoalHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  it("renders all tags", () => {
    render(<GoalHeader {...defaultProps} />);
    defaultProps.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("shows action buttons when hovered", () => {
    render(<GoalHeader {...defaultProps} isHovered={true} />);
    expect(screen.getByLabelText(/share/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delete/i)).toBeInTheDocument();
  });

  it("calls appropriate handlers when buttons are clicked", () => {
    render(<GoalHeader {...defaultProps} isHovered={true} />);
    
    fireEvent.click(screen.getByLabelText(/share/i));
    expect(defaultProps.onShare).toHaveBeenCalled();
    
    fireEvent.click(screen.getByLabelText(/edit/i));
    expect(defaultProps.onEdit).toHaveBeenCalled();
    
    fireEvent.click(screen.getByLabelText(/delete/i));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });
});