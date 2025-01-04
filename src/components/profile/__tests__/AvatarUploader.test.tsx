import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { AvatarUploader } from "../avatar/AvatarUploader";
import { supabase } from "@/lib/supabase";
import { StorageError } from "@supabase/storage-js";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        upload: vi.fn(() => Promise.resolve({ error: null })),
        remove: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "test-url.jpg" } })),
        // Add all required StorageFileApi properties
        url: "test-url",
        headers: {},
        fetch: vi.fn(),
        uploadOrUpdate: vi.fn(),
        move: vi.fn(),
        copy: vi.fn(),
        createSignedUrl: vi.fn(),
        createSignedUrls: vi.fn(),
        download: vi.fn(),
        getPublicUrls: vi.fn(),
        update: vi.fn(),
        uploadToSignedUrl: vi.fn(),
        createSignedUploadUrl: vi.fn(),
        info: vi.fn(),
        exists: vi.fn(),
        listBuckets: vi.fn(),
        // Add missing internal methods
        encodeMetadata: vi.fn(),
        toBase64: vi.fn(),
        _getFinalPath: vi.fn(),
        _removeEmptyFolders: vi.fn(),
        transformOptsToQueryString: vi.fn(),
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
    const storageError = new StorageError("Storage error");

    // Mock storage error
    vi.mocked(supabase.storage.from).mockImplementationOnce(() => ({
      list: vi.fn(() => Promise.resolve({ data: null, error: storageError })),
      getPublicUrl: vi.fn(),
      // Add all required StorageFileApi properties
      url: "test-url",
      headers: {},
      fetch: vi.fn(),
      uploadOrUpdate: vi.fn(),
      move: vi.fn(),
      copy: vi.fn(),
      createSignedUrl: vi.fn(),
      createSignedUrls: vi.fn(),
      download: vi.fn(),
      getPublicUrls: vi.fn(),
      update: vi.fn(),
      uploadToSignedUrl: vi.fn(),
      createSignedUploadUrl: vi.fn(),
      info: vi.fn(),
      exists: vi.fn(),
      listBuckets: vi.fn(),
      // Add missing internal methods
      encodeMetadata: vi.fn(),
      toBase64: vi.fn(),
      _getFinalPath: vi.fn(),
      _removeEmptyFolders: vi.fn(),
      transformOptsToQueryString: vi.fn(),
      // Add required methods without duplication
      upload: vi.fn(),
      remove: vi.fn(),
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