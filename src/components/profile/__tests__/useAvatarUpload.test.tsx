import { renderHook, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { supabase } from "@/lib/supabase";

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

describe("useAvatarUpload", () => {
  const mockUserId = "test-user-id";
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles successful file upload", async () => {
    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.handleUpload(file);
    });

    expect(mockOnUploadComplete).toHaveBeenCalledWith("test-url.jpg");
  });

  it("validates file type", async () => {
    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

    await act(async () => {
      await result.current.handleUpload(invalidFile);
    });

    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });
});