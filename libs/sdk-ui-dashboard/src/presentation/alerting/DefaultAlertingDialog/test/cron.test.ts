// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createCronFromGranularity } from "../utils/cron.js";

describe("cron", () => {
    it("granularity: HOUR, Monday week start", () => {
        expect(createCronFromGranularity("HOUR", "Monday")).toBe("0 0 * * * *");
    });

    it("granularity: DAY, Monday week start", () => {
        expect(createCronFromGranularity("DAY", "Monday")).toBe("0 0 0 * * *");
    });

    it("granularity: WEEK, Monday week start", () => {
        expect(createCronFromGranularity("WEEK", "Monday")).toBe("0 0 0 * * 1");
    });

    it("granularity: WEEK, Sunday week start", () => {
        expect(createCronFromGranularity("WEEK", "Sunday")).toBe("0 0 0 * * 0");
    });

    it("granularity: MONTH, Monday week start", () => {
        expect(createCronFromGranularity("MONTH", "Monday")).toBe("0 0 0 1 * *");
    });

    it("granularity: QUARTER, Monday week start", () => {
        expect(createCronFromGranularity("QUARTER", "Monday")).toBe("0 0 0 1 */3 *");
    });

    it("granularity: YEAR, Monday week start", () => {
        expect(createCronFromGranularity("YEAR", "Monday")).toBe("0 0 0 1 1 *");
    });
});
