// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { computeDurationParts, formatDuration } from "./formatDuration.js";

describe("computeDurationParts", () => {
    it("should keep one decimal place for sub-second durations", () => {
        expect(computeDurationParts(200)).toEqual({ minutes: 0, seconds: 0.2 });
    });

    it("should keep one decimal place for multi-second durations", () => {
        expect(computeDurationParts(13600)).toEqual({ minutes: 0, seconds: 13.6 });
    });

    it("should round to one decimal place", () => {
        expect(computeDurationParts(2249)).toEqual({ minutes: 0, seconds: 2.2 });
    });

    it("should split whole minutes with no seconds remainder", () => {
        expect(computeDurationParts(60000)).toEqual({ minutes: 1, seconds: 0 });
    });

    it("should split minutes with a seconds remainder", () => {
        expect(computeDurationParts(65000)).toEqual({ minutes: 1, seconds: 5 });
    });

    it("should treat negative durations as zero", () => {
        expect(computeDurationParts(-50)).toEqual({ minutes: 0, seconds: 0 });
    });

    it("should carry a sub-minute duration that rounds up to a full minute", () => {
        expect(computeDurationParts(59950)).toEqual({ minutes: 1, seconds: 0 });
    });

    it("should carry a seconds remainder that rounds up to a full minute", () => {
        expect(computeDurationParts(119500)).toEqual({ minutes: 2, seconds: 0 });
    });
});

describe("formatDuration", () => {
    const intl = createIntl({
        locale: "en",
        messages: {
            "gd.gen-ai.interactionIntelligence.duration.seconds": "{seconds}s",
            "gd.gen-ai.interactionIntelligence.duration.minutes": "{minutes}m",
            "gd.gen-ai.interactionIntelligence.duration.minutesAndSeconds": "{minutes}m {seconds}s",
        },
    });

    it("should format sub-second durations with one decimal", () => {
        expect(formatDuration(intl, 200)).toBe("0.2s");
    });

    it("should format multi-second durations with one decimal", () => {
        expect(formatDuration(intl, 13600)).toBe("13.6s");
    });

    it("should format whole minutes with no seconds remainder", () => {
        expect(formatDuration(intl, 60000)).toBe("1m");
    });

    it("should format minutes with a seconds remainder", () => {
        expect(formatDuration(intl, 65000)).toBe("1m 5s");
    });
});
