import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AvatarUploader } from "../avatar/AvatarUploader";
import { supabase } from "@/lib/supabase";
import { vi } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
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

  it("shows error for large files", async () => {
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
});