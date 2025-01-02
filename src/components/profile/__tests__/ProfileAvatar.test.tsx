import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { ProfileAvatar } from "../ProfileAvatar";
import { supabase } from "@/lib/supabase";

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

describe("ProfileAvatar", () => {
  const mockUserId = "test-user-id";
  const mockOnAvatarChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders avatar with fallback when no URL provided", () => {
    render(<ProfileAvatar userId={mockUserId} onAvatarChange={mockOnAvatarChange} />);
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("renders avatar with image when URL provided", () => {
    render(
      <ProfileAvatar 
        userId={mockUserId} 
        avatarUrl="test.jpg"
        onAvatarChange={mockOnAvatarChange} 
      />
    );
    expect(screen.getByAltText("Profile picture")).toHaveAttribute("src", "test.jpg");
  });

  it("handles file upload successfully", async () => {
    render(
      <ProfileAvatar 
        userId={mockUserId} 
        onAvatarChange={mockOnAvatarChange}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("avatar-upload-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnAvatarChange).toHaveBeenCalledWith("test-url.jpg");
    });
  });
});