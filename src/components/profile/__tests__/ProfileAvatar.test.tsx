import { render, screen } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { ProfileAvatar } from "../ProfileAvatar";

// Mock the AvatarUploader component
vi.mock("../avatar/AvatarUploader", () => ({
  AvatarUploader: ({ onUploadComplete }: { onUploadComplete: (url: string) => void }) => (
    <button 
      onClick={() => onUploadComplete("test-url.jpg")}
      data-testid="avatar-uploader"
    >
      Upload
    </button>
  ),
}));

describe("ProfileAvatar", () => {
  const userId = "test-user-id";
  const mockOnAvatarChange = vi.fn();

  it("renders avatar with fallback when no URL provided", () => {
    render(
      <ProfileAvatar 
        userId={userId} 
        onAvatarChange={mockOnAvatarChange} 
      />
    );
    
    expect(screen.getByText("TE")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toHaveAttribute("src", "");
  });

  it("renders avatar with image when URL provided", () => {
    render(
      <ProfileAvatar 
        userId={userId} 
        avatarUrl="test.jpg"
        onAvatarChange={mockOnAvatarChange} 
      />
    );
    
    const avatarImage = screen.getByRole("img");
    expect(avatarImage).toHaveAttribute("src", "test.jpg");
    expect(avatarImage).toHaveAttribute("alt", "Profile picture");
    expect(avatarImage).toHaveClass("object-cover");
  });

  it("updates avatar when upload is completed", () => {
    render(
      <ProfileAvatar 
        userId={userId}
        onAvatarChange={mockOnAvatarChange}
      />
    );
    
    // Simulate upload completion
    const uploadButton = screen.getByTestId("avatar-uploader");
    uploadButton.click();
    
    expect(mockOnAvatarChange).toHaveBeenCalledWith("test-url.jpg");
  });
});