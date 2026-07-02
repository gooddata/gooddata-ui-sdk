// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
// (C) 2026 GoodData Corporation
import { describe, expect, it } from "vitest";

import { formatDuration } from "../ItemsGroup.js";

describe("formatDuration", () => {
    const intl = createIntl({
        locale: "en",
        messages: {
            "gd.gen-ai.state.seconds": "s",
            "gd.gen-ai.state.minutes": "m",
        },
    });

    it("should return 1s for duration less than 1 second", () => {
        expect(formatDuration(intl, 500)).toBe("1s");
    });

    it("should return 1s for exactly 1 second", () => {
        expect(formatDuration(intl, 1000)).toBe("1s");
    });

    it("should return 59s for 59 seconds", () => {
        expect(formatDuration(intl, 59000)).toBe("59s");
    });

    it("should return 1m for 59.8s", () => {
        expect(formatDuration(intl, 59800)).toBe("1m");
    });

    it("should return 1m for exactly 1 minute", () => {
        expect(formatDuration(intl, 60000)).toBe("1m");
    });

    it("should return 1m 1s for 61 seconds", () => {
        expect(formatDuration(intl, 61000)).toBe("1m 1s");
    });

    it("should return 2m 30s for 150 seconds", () => {
        expect(formatDuration(intl, 150000)).toBe("2m 30s");
    });

    it("should handle rounding of milliseconds", () => {
        expect(formatDuration(intl, 1400)).toBe("1s");
        expect(formatDuration(intl, 1900)).toBe("2s");
    });

    it("should handle durations longer than an hour by converting to minutes", () => {
        // 3661000 ms = 61 minutes and 1 second
        expect(formatDuration(intl, 3661000)).toBe("61m 1s");
    });
});
