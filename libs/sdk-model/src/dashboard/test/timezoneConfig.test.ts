// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    normalizeDashboardTimezoneConfig,
    resolveDashboardTimezoneUserOverrideAllowed,
} from "../dashboard.js";

describe("normalizeDashboardTimezoneConfig", () => {
    it("returns undefined for undefined input", () => {
        expect(normalizeDashboardTimezoneConfig(undefined)).toBeUndefined();
    });

    it("drops empty timezoneId and false showTimezoneInfo", () => {
        expect(
            normalizeDashboardTimezoneConfig({
                timezoneId: undefined,
                showTimezoneInfo: false,
            }),
        ).toBeUndefined();
    });

    it("keeps an explicit allowUserOverrideInViewMode false so dashboards can override a true org default", () => {
        expect(
            normalizeDashboardTimezoneConfig({
                showTimezoneInfo: false,
                allowUserOverrideInViewMode: false,
            }),
        ).toEqual({ allowUserOverrideInViewMode: false });
    });

    it("keeps an explicit allowUserOverrideInViewMode true", () => {
        expect(
            normalizeDashboardTimezoneConfig({
                allowUserOverrideInViewMode: true,
            }),
        ).toEqual({ allowUserOverrideInViewMode: true });
    });
});

describe("resolveDashboardTimezoneUserOverrideAllowed", () => {
    it("uses the dashboard explicit true over a false setting", () => {
        expect(
            resolveDashboardTimezoneUserOverrideAllowed({ allowUserOverrideInViewMode: true }, false),
        ).toBe(true);
    });

    it("uses the dashboard explicit false over a true setting", () => {
        expect(
            resolveDashboardTimezoneUserOverrideAllowed({ allowUserOverrideInViewMode: false }, true),
        ).toBe(false);
    });

    it("falls back to the organization/workspace setting when the dashboard does not set it", () => {
        expect(resolveDashboardTimezoneUserOverrideAllowed({ timezoneId: "Europe/Prague" }, true)).toBe(true);
        expect(resolveDashboardTimezoneUserOverrideAllowed(undefined, true)).toBe(true);
        expect(resolveDashboardTimezoneUserOverrideAllowed(undefined, false)).toBe(false);
        expect(resolveDashboardTimezoneUserOverrideAllowed(undefined, undefined)).toBe(false);
    });
});
