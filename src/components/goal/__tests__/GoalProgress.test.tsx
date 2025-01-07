import { render, screen } from "@testing-library/react";
import { GoalProgress } from "../GoalProgress";
import { vi, describe, it, expect } from "vitest";

describe("GoalProgress", () => {
  it("renders task progress correctly", () => {
    render(<GoalProgress taskProgress={50} timeProgress={30} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders time progress correctly", () => {
    render(<GoalProgress taskProgress={50} timeProgress={30} />);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("handles 0% progress", () => {
    render(<GoalProgress taskProgress={0} timeProgress={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("handles 100% progress", () => {
    render(<GoalProgress taskProgress={100} timeProgress={100} />);
    expect(screen.getAllByText("100%")).toHaveLength(2);
  });

  it("renders progress bars", () => {
    render(<GoalProgress taskProgress={50} timeProgress={30} />);
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars).toHaveLength(2);
  });
});