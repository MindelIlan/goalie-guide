import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { AvatarUploader } from "../avatar/AvatarUploader";

vi.mock("@/hooks/useAvatarUpload", () => ({
  useAvatarUpload: () => ({
    isUploading: false,
    handleUpload: vi.fn(),
  }),
}));

describe("AvatarUploader", () => {
  const mockUserId = "test-user-id";
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload button", () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    expect(screen.getByTestId("avatar-upload-input")).toBeInTheDocument();
  });

  it("handles file selection", () => {
    render(
      <AvatarUploader 
        userId={mockUserId} 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [file] } });
  });
});