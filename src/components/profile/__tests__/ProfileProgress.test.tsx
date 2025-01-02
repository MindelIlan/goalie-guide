import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { ProfileProgress } from "../ProfileProgress";
import { supabase } from "@/lib/supabase";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [
            { progress: 50 },
            { progress: 75 },
          ],
          error: null,
        })),
      })),
    })),
  },
}));

describe("ProfileProgress", () => {
  const mockUserId = "test-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates and displays average progress", async () => {
    render(<ProfileProgress userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText("63%")).toBeInTheDocument();
    });
  });

  it("doesn't render when there are no goals", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [],
          error: null,
        })),
      })),
    }));

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { container } = render(<ProfileProgress userId={mockUserId} />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});