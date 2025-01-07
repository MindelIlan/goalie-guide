import { render, screen, fireEvent } from "@testing-library/react";
import { ShareGoalDialog } from "../../ShareGoalDialog";
import { vi, describe, it, expect } from "vitest";

describe("ShareGoalDialog", () => {
  const mockProps = {
    goalId: 1,
    goalTitle: "Test Goal",
    open: true,
    onOpenChange: vi.fn(),
  };

  it("renders dialog with correct title", () => {
    render(<ShareGoalDialog {...mockProps} />);
    
    expect(screen.getByText(`Share Goal: ${mockProps.goalTitle}`)).toBeInTheDocument();
  });

  it("shows platform sharing tab by default", () => {
    render(<ShareGoalDialog {...mockProps} />);
    
    expect(screen.getByText("Share with User")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter user's email/i)).toBeInTheDocument();
  });

  it("switches between platform and email sharing tabs", () => {
    render(<ShareGoalDialog {...mockProps} />);
    
    // Click email tab
    fireEvent.click(screen.getByText("Invite by Email"));
    expect(screen.getByPlaceholderText(/enter your friend's email/i)).toBeInTheDocument();
    
    // Click platform tab
    fireEvent.click(screen.getByText("Share with User"));
    expect(screen.getByPlaceholderText(/enter user's email/i)).toBeInTheDocument();
  });

  it("closes dialog when clicking outside", () => {
    render(<ShareGoalDialog {...mockProps} />);
    
    fireEvent.click(document.body);
    
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});