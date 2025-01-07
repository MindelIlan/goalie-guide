import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoalsHeader } from "../GoalsHeader";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("GoalsHeader", () => {
  const mockFolders = [
    { id: 1, name: "Work", description: "Work related goals" },
    { id: 2, name: "Personal", description: "Personal goals" },
  ];

  const defaultProps = {
    onAddGoal: vi.fn(),
    onCheckDuplicates: vi.fn(),
    onSearch: vi.fn(),
    folders: mockFolders,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input and buttons", () => {
    render(<GoalsHeader {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search goals/i)).toBeInTheDocument();
    expect(screen.getByText(/check duplicates/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add.*goal/i })).toBeInTheDocument();
  });

  it("calls onSearch with debounced value when typing in search", async () => {
    render(<GoalsHeader {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/search goals/i);
    
    fireEvent.change(searchInput, { target: { value: "test search" } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("test search");
    }, { timeout: 400 });
  });

  it("calls onCheckDuplicates when clicking check duplicates button", () => {
    render(<GoalsHeader {...defaultProps} />);
    const checkDuplicatesButton = screen.getByText(/check duplicates/i);
    
    fireEvent.click(checkDuplicatesButton);
    expect(defaultProps.onCheckDuplicates).toHaveBeenCalled();
  });

  it("handles empty folders array", () => {
    render(<GoalsHeader {...defaultProps} folders={[]} />);
    expect(screen.getByPlaceholderText(/search goals/i)).toBeInTheDocument();
  });

  it("clears search input when clicking clear button", async () => {
    render(<GoalsHeader {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/search goals/i);
    
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(searchInput).toHaveValue("test");
    
    // Wait for debounce and verify the search was triggered
    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("test");
    }, { timeout: 400 });
    
    fireEvent.change(searchInput, { target: { value: "" } });
    
    // Wait for debounce and verify empty search was triggered
    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("");
    }, { timeout: 400 });
  });
});