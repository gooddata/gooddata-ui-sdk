// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IKdaDataPoint } from "./types.js";
import { formatKeyDriverAnalysisDateRange } from "./utils.js";

// The range carries the backend wall-clock in UTC and must show it unchanged in every browser timezone.
// The tests run in the timezone of the machine (this package runs its tests in worker threads, where the
// TZ variable cannot be changed); a browser timezone east of UTC would shift every value below.
describe("formatKeyDriverAnalysisDateRange", () => {
    const point = (date: string, pattern: string): IKdaDataPoint => ({
        date,
        value: undefined,
        format: { locale: "en-US", pattern },
    });

    it("should show the dates as the backend computed them", () => {
        expect(
            formatKeyDriverAnalysisDateRange(
                [
                    point("2026-03-28T00:00:00.000Z", "dd.MM.yyyy"),
                    point("2026-03-29T00:00:00.000Z", "dd.MM.yyyy"),
                ],
                "-",
            ),
        ).toBe("28.03.2026 - 29.03.2026");
    });

    it("should show the times as the backend computed them, also in a browser timezone gap", () => {
        // 2026-03-29 02:30 does not exist in Europe/Prague
        expect(
            formatKeyDriverAnalysisDateRange(
                [
                    point("2026-03-29T01:30:00.000Z", "dd.MM.yyyy, HH:mm"),
                    point("2026-03-29T02:30:00.000Z", "dd.MM.yyyy, HH:mm"),
                ],
                "-",
            ),
        ).toBe("29.03.2026, 01:30 - 02:30");
    });

    it("should tell the days apart by the backend wall-clock", () => {
        // the same local day in the browser timezones east of UTC, different days for the backend
        expect(
            formatKeyDriverAnalysisDateRange(
                [
                    point("2026-03-28T23:30:00.000Z", "dd.MM.yyyy, HH:mm"),
                    point("2026-03-29T00:30:00.000Z", "dd.MM.yyyy, HH:mm"),
                ],
                "-",
            ),
        ).toBe("28.03.2026, 23:30 - 29.03.2026, 00:30");
    });
});
