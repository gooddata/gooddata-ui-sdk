// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { BROWSER_DETECTED, isValidDashboardTimezoneId, isValidIanaTimezoneId } from "./dashboard.js";

describe("dashboard timezone validation", () => {
    describe("isValidIanaTimezoneId", () => {
        it("accepts real IANA identifiers", () => {
            expect(isValidIanaTimezoneId("UTC")).toBe(true);
            expect(isValidIanaTimezoneId("Europe/Prague")).toBe(true);
            expect(isValidIanaTimezoneId("America/New_York")).toBe(true);
        });

        it("rejects unknown or malformed identifiers", () => {
            expect(isValidIanaTimezoneId("Europe/Vi")).toBe(false);
            expect(isValidIanaTimezoneId("not-a-zone")).toBe(false);
            expect(isValidIanaTimezoneId(BROWSER_DETECTED)).toBe(false);
        });
    });

    describe("isValidDashboardTimezoneId", () => {
        it("accepts the browser-detected sentinel and real IANA identifiers", () => {
            expect(isValidDashboardTimezoneId(BROWSER_DETECTED)).toBe(true);
            expect(isValidDashboardTimezoneId("Europe/Prague")).toBe(true);
        });

        it("rejects unknown identifiers", () => {
            expect(isValidDashboardTimezoneId("Europe/Vi")).toBe(false);
        });
    });
});
