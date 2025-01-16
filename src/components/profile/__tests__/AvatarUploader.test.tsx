import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { AvatarUploader } from "../avatar/AvatarUploader";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

// Mock the useAvatarUpload hook
vi.mock("@/hooks/useAvatarUpload", () => ({
  useAvatarUpload: vi.fn(),
}));

describe("AvatarUploader", () => {
  const mockUserId = "test-user-id";
  const mockOnUploadComplete = vi.fn();
  const mockHandleUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isUploading: false,
      handleUpload: mockHandleUpload,
    });
  });

  it("renders upload button with correct accessibility", () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const input = screen.getByTestId("avatar-upload-input");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("handles file selection", async () => {
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
      expect(mockHandleUpload).toHaveBeenCalledWith(file);
    });
  });

  it("disables input while uploading", () => {
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isUploading: true,
      handleUpload: mockHandleUpload,
    });

    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const input = screen.getByTestId("avatar-upload-input");
    expect(input).toBeDisabled();
  });

  it("shows loading spinner while uploading", () => {
    (useAvatarUpload as jest.Mock).mockReturnValue({
      isUploading: true,
      handleUpload: mockHandleUpload,
    });

    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    expect(screen.getByTestId("avatar-upload-input")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("clears input value after upload", async () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });
});