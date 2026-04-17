import { buildCalendarDays, schedulesForDate, bandColor } from "../calendar-utils";
import type { BandSchedule } from "../types";

// ---------------------------------------------------------------------------
// buildCalendarDays
// ---------------------------------------------------------------------------

describe("buildCalendarDays", () => {
  it("always returns 42 days", () => {
    expect(buildCalendarDays(2026, 0).length).toBe(42); // January
    expect(buildCalendarDays(2026, 1).length).toBe(42); // February
    expect(buildCalendarDays(2026, 2).length).toBe(42); // March
  });

  it("starts on the correct weekday", () => {
    // 2026-03-01 is Sunday (0)
    const days = buildCalendarDays(2026, 2);
    expect(days[0].getDate()).toBe(1);
    expect(days[0].getDay()).toBe(0);
  });

  it("starts previous month days when month does not start on Sunday", () => {
    // 2026-04-01 is Wednesday (3) → first 3 days are from March
    const days = buildCalendarDays(2026, 3);
    expect(days[0].getMonth()).toBe(2); // March
    expect(days[3].getDate()).toBe(1);
    expect(days[3].getMonth()).toBe(3); // April 1
  });

  it("fills trailing days with next month", () => {
    const days = buildCalendarDays(2026, 2); // March 2026
    const lastDay = days[41];
    // Last cell should be in April if March ends before cell 42
    expect(lastDay.getMonth()).toBeGreaterThanOrEqual(2);
  });

  it("contains all days of the month", () => {
    const days = buildCalendarDays(2026, 2); // March = 31 days
    const marchDays = days.filter((d) => d.getMonth() === 2);
    expect(marchDays.length).toBe(31);
  });
});

// ---------------------------------------------------------------------------
// schedulesForDate
// ---------------------------------------------------------------------------

function makeSchedule(startAt: string): BandSchedule {
  return {
    id: "s1",
    eventBandId: "eb1",
    bandName: "Test Band",
    location: "Studio",
    startAt,
    endAt: startAt,
    createdBy: "user1",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  };
}

describe("schedulesForDate", () => {
  it("returns schedules matching the date", () => {
    const s = makeSchedule("2026-03-20T14:00:00Z");
    const result = schedulesForDate([s], new Date("2026-03-20"));
    expect(result).toHaveLength(1);
  });

  it("returns empty array when no schedules match", () => {
    const s = makeSchedule("2026-03-20T14:00:00Z");
    const result = schedulesForDate([s], new Date("2026-03-21"));
    expect(result).toHaveLength(0);
  });

  it("handles multiple schedules on same date", () => {
    const s1 = { ...makeSchedule("2026-03-20T10:00:00Z"), id: "s1" };
    const s2 = { ...makeSchedule("2026-03-20T15:00:00Z"), id: "s2" };
    const s3 = { ...makeSchedule("2026-03-21T10:00:00Z"), id: "s3" };
    const result = schedulesForDate([s1, s2, s3], new Date("2026-03-20"));
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toContain("s1");
    expect(result.map((s) => s.id)).toContain("s2");
  });

  it("returns empty array for empty schedules", () => {
    const result = schedulesForDate([], new Date("2026-03-20"));
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// bandColor
// ---------------------------------------------------------------------------

describe("bandColor", () => {
  it("returns a valid HSL string", () => {
    const color = bandColor("band-id-123");
    expect(color).toMatch(/^hsl\(\d+, 60%, 88%\)$/);
  });

  it("returns consistent color for the same bandId", () => {
    expect(bandColor("abc")).toBe(bandColor("abc"));
  });

  it("returns different colors for different bandIds", () => {
    const colors = new Set(["band-1", "band-2", "band-3", "band-4"].map(bandColor));
    expect(colors.size).toBeGreaterThan(1);
  });

  it("hue is within 0-359 range", () => {
    for (const id of ["a", "test", "uuid-1234-abcd"]) {
      const color = bandColor(id);
      const hue = parseInt(color.match(/\d+/)![0]);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });
});
