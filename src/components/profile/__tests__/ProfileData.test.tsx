import { render, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { ProfileData } from "../ProfileData";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: "test-id",
              avatar_url: null,
              description: null,
              openai_api_key: null,
              username: null,
            },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe("ProfileData", () => {
  const mockUserId = "test-user-id";
  const mockOnProfileLoaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches profile data on mount", async () => {
    render(
      <ProfileData userId={mockUserId} onProfileLoaded={mockOnProfileLoaded} />
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("profiles");
    });
  });

  it("creates new profile if none exists", async () => {
    render(
      <ProfileData userId={mockUserId} onProfileLoaded={mockOnProfileLoaded} />
    );

    await waitFor(() => {
      expect(mockOnProfileLoaded).toHaveBeenCalledWith({
        id: "test-id",
        avatar_url: null,
        description: null,
        openai_api_key: null,
        username: null,
      });
    });
  });
});