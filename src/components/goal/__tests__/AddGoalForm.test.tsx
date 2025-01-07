import { render, screen, fireEvent } from "@testing-library/react";
import { AddGoalForm } from "../AddGoalForm";
import { vi, describe, it, expect } from "vitest";

describe("AddGoalForm", () => {
  const mockProps = {
    title: "",
    description: "",
    target_date: "",
    tags: [],
    subgoals: [],
    selectedFolderId: null,
    folders: [],
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onTargetDateChange: vi.fn(),
    onTagsChange: vi.fn(),
    onSubgoalsChange: vi.fn(),
    onFolderChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it("renders all form fields", () => {
    render(<AddGoalForm {...mockProps} />);
    
    expect(screen.getByLabelText(/goal title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/folder/i)).toBeInTheDocument();
  });

  it("calls onChange handlers when fields are updated", () => {
    render(<AddGoalForm {...mockProps} />);
    
    const titleInput = screen.getByLabelText(/goal title/i);
    fireEvent.change(titleInput, { target: { value: "New Goal" } });
    expect(mockProps.onTitleChange).toHaveBeenCalledWith("New Goal");
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: "New Description" } });
    expect(mockProps.onDescriptionChange).toHaveBeenCalledWith("New Description");
  });

  it("calls onSubmit when form is submitted", () => {
    render(<AddGoalForm {...mockProps} />);
    
    const form = screen.getByRole("form");
    fireEvent.submit(form);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it("shows folder options when folders are provided", () => {
    const folders = [
      { id: 1, name: "Folder 1", description: null },
      { id: 2, name: "Folder 2", description: null },
    ];
    
    render(<AddGoalForm {...mockProps} folders={folders} />);
    
    folders.forEach(folder => {
      expect(screen.getByText(folder.name)).toBeInTheDocument();
    });
  });
});