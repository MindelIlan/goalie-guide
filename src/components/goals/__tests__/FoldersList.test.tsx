import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FoldersList } from "../FoldersList";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Goal, Folder } from "@/types/goals";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}));

describe("FoldersList", () => {
  const mockFolders: Folder[] = [
    {
      id: 1,
      name: "Work",
      description: "Work related goals",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Personal",
      description: "Personal goals",
      created_at: new Date().toISOString(),
    },
  ];

  const mockGoals: Goal[] = [
    {
      id: 1,
      title: "Test Goal",
      description: "Test Description",
      progress: 0,
      target_date: "2024-12-31",
      tags: ["test"],
      created_at: "2024-01-01",
      folder_id: 1,
      user_id: "test-user-id"
    },
  ];

  const defaultProps = {
    folders: mockFolders,
    onFoldersChange: vi.fn(),
    selectedFolderId: null,
    onSelectFolder: vi.fn(),
    goals: mockGoals,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all folders", () => {
    render(<FoldersList {...defaultProps} />);
    mockFolders.forEach(folder => {
      expect(screen.getByText(folder.name)).toBeInTheDocument();
    });
  });

  it("shows loading state when folders are null", () => {
    render(<FoldersList {...defaultProps} folders={null} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("handles folder selection", () => {
    render(<FoldersList {...defaultProps} />);
    const folderElement = screen.getByText(mockFolders[0].name);
    fireEvent.click(folderElement);
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith(mockFolders[0].id);
  });

  it("allows adding new folders", async () => {
    render(<FoldersList {...defaultProps} />);
    const addButton = screen.getByText(/add folder/i);
    fireEvent.click(addButton);
    expect(screen.getByPlaceholderText(/folder name/i)).toBeInTheDocument();
  });

  it("shows folder statistics", () => {
    render(<FoldersList {...defaultProps} />);
    expect(screen.getByText(/1 goal/i)).toBeInTheDocument();
  });
});