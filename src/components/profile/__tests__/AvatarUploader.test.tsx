import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { AvatarUploader } from "../avatar/AvatarUploader";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        upload: vi.fn(() => Promise.resolve({ error: null })),
        remove: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "test-url.jpg" } })),
      })),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe("AvatarUploader", () => {
  const mockUserId = "test-user-id";
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles file upload successfully", async () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith("test-url.jpg");
    });
  });

  it("validates file type", async () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(mockOnUploadComplete).not.toHaveBeenCalled();
    });
  });

  it("validates file size", async () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const largeFile = new File(["x".repeat(3 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(mockOnUploadComplete).not.toHaveBeenCalled();
    });
  });

  it("handles storage errors gracefully", async () => {
    // Mock storage error
    vi.mocked(supabase.storage.from).mockImplementationOnce(() => ({
      list: vi.fn(() => Promise.resolve({ data: null, error: new Error("Storage error") })),
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(),
    }));

    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUploadComplete).not.toHaveBeenCalled();
    });
  });
});