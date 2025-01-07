import { render, screen, fireEvent } from "@testing-library/react";
import { AddGoalForm } from "../AddGoalForm";
import { vi, describe, it, expect } from "vitest";

describe("AddGoalForm", () => {
  const mockFolders = [
    { id: 1, name: "Work", description: "Work goals" },
    { id: 2, name: "Personal", description: "Personal goals" },
  ];

  const defaultProps = {
    title: "",
    description: "",
    target_date: "",
    tags: [],
    subgoals: [],
    selectedFolderId: null,
    folders: mockFolders,
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onTargetDateChange: vi.fn(),
    onTagsChange: vi.fn(),
    onSubgoalsChange: vi.fn(),
    onFolderChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it("renders all form fields", () => {
    render(<AddGoalForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/goal title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/folder/i)).toBeInTheDocument();
    expect(screen.getByText(/tags/i)).toBeInTheDocument();
  });

  it("calls appropriate handlers when fields change", () => {
    render(<AddGoalForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/goal title/i), {
      target: { value: "New Goal" },
    });
    expect(defaultProps.onTitleChange).toHaveBeenCalledWith("New Goal");
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "New Description" },
    });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith("New Description");
  });

  it("shows folder options", () => {
    render(<AddGoalForm {...defaultProps} />);
    
    const folderSelect = screen.getByLabelText(/folder/i);
    mockFolders.forEach(folder => {
      expect(screen.getByText(folder.name)).toBeInTheDocument();
    });
  });

  it("calls onSubmit when form is submitted", () => {
    render(<AddGoalForm {...defaultProps} />);
    
    const form = screen.getByRole("form");
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("validates required fields", () => {
    render(<AddGoalForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/goal title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const targetDateInput = screen.getByLabelText(/target date/i);
    
    expect(titleInput).toBeRequired();
    expect(descriptionInput).toBeRequired();
    expect(targetDateInput).toBeRequired();
  });
});