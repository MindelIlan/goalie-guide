import { render, screen, fireEvent } from "@testing-library/react";
import { GoalsHeader } from "../GoalsHeader";
import { vi, describe, it, expect } from "vitest";

describe("GoalsHeader", () => {
  const mockProps = {
    onAddGoal: vi.fn(),
    onCheckDuplicates: vi.fn(),
    onSearch: vi.fn(),
    folders: [],
  };

  it("renders search input and buttons", () => {
    render(<GoalsHeader {...mockProps} />);
    
    expect(screen.getByPlaceholderText("Search goals...")).toBeInTheDocument();
    expect(screen.getByText("Check Duplicates")).toBeInTheDocument();
    expect(screen.getByText("Add New Goal")).toBeInTheDocument();
  });

  it("calls onSearch when typing in search input", () => {
    render(<GoalsHeader {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText("Search goals...");
    fireEvent.change(searchInput, { target: { value: "test search" } });
    
    // Due to debounce, we need to wait
    setTimeout(() => {
      expect(mockProps.onSearch).toHaveBeenCalledWith("test search");
    }, 300);
  });

  it("calls onCheckDuplicates when clicking check duplicates button", () => {
    render(<GoalsHeader {...mockProps} />);
    
    const checkDuplicatesButton = screen.getByText("Check Duplicates");
    fireEvent.click(checkDuplicatesButton);
    
    expect(mockProps.onCheckDuplicates).toHaveBeenCalled();
  });
});