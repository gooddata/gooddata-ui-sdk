// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { formatDuration, formatStepDuration } from "./timeline.js";

const en = createIntl({ locale: "en-US" });
const de = createIntl({ locale: "de-DE" });

describe("formatDuration", () => {
    it("shows milliseconds under a second and one decimal of seconds from it", () => {
        expect(formatDuration(en, 0)).toBe("0ms");
        expect(formatDuration(en, 123.4)).toBe("123ms");
        expect(formatDuration(en, 1000)).toBe("1.0s");
        expect(formatDuration(en, 3449)).toBe("3.4s");
    });

    it("follows the locale's decimal separator", () => {
        expect(formatDuration(de, 1200)).toContain("1,2");
    });
});

describe("formatStepDuration", () => {
    it("shows milliseconds under a second and whole seconds rounded down from it", () => {
        expect(formatStepDuration(en, 0)).toBe("0ms");
        expect(formatStepDuration(en, 150.4)).toBe("150ms");
        expect(formatStepDuration(en, 999)).toBe("999ms");
        expect(formatStepDuration(en, 1000)).toBe("1s");
        expect(formatStepDuration(en, 7999)).toBe("7s");
    });
});
