import { renderHook, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { supabase } from "@/lib/supabase";
import { validateFile } from "@/utils/fileUtils";

// Mock the supabase client
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

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock file validation
vi.mock("@/utils/fileUtils", () => ({
  validateFile: vi.fn(),
  generateFilePath: vi.fn((userId, file) => `${userId}/${file.name}`),
}));

describe("useAvatarUpload", () => {
  const mockUserId = "test-user-id";
  const mockOnUploadComplete = vi.fn();
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles successful file upload", async () => {
    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    await act(async () => {
      await result.current.handleUpload(mockFile);
    });

    expect(mockOnUploadComplete).toHaveBeenCalledWith("test-url.jpg");
  });

  it("handles file validation failure", async () => {
    (validateFile as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid file");
    });

    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    await act(async () => {
      await result.current.handleUpload(mockFile);
    });

    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it("handles storage upload error", async () => {
    const mockStorageError = new Error("Storage error");
    vi.mocked(supabase.storage.from).mockImplementationOnce(() => ({
      list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      upload: vi.fn(() => Promise.resolve({ error: mockStorageError })),
      remove: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "test-url.jpg" } })),
    }));

    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    await act(async () => {
      await result.current.handleUpload(mockFile);
    });

    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it("handles profile update error", async () => {
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: new Error("Update error") })),
      })),
    }));

    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    await act(async () => {
      await result.current.handleUpload(mockFile);
    });

    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it("updates loading state during upload", async () => {
    const { result } = renderHook(() => 
      useAvatarUpload(mockUserId, mockOnUploadComplete)
    );

    expect(result.current.isUploading).toBe(false);

    await act(async () => {
      const uploadPromise = result.current.handleUpload(mockFile);
      expect(result.current.isUploading).toBe(true);
      await uploadPromise;
    });

    expect(result.current.isUploading).toBe(false);
  });
});