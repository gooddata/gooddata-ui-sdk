// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getTimezoneById,
    getTimezoneDisplayLabel,
    getTimezoneLabels,
    getTimezoneTitle,
    getTimezones,
    getUserTimezone,
    timezoneMatchesSearch,
} from "../timezones.js";

describe("timezones", () => {
    describe("getTimezones", () => {
        it("should return the curated list", () => {
            const timezones = getTimezones();

            expect(timezones.length).toBeGreaterThan(100);
            expect(timezones.every((tz) => tz.id && tz.name && tz.offsetLabel)).toBe(true);
        });

        it("should keep name and offset label as independent fields", () => {
            const prague = getTimezones().find((tz) => tz.id === "Europe/Prague");

            expect(prague).toEqual({
                id: "Europe/Prague",
                name: "Prague",
                offsetLabel: "GMT+01:00",
                januaryOffset: 60,
                juneOffset: 120,
            });
        });

        it("should keep multi-word names with negative offsets", () => {
            const pacific = getTimezones().find((tz) => tz.id === "America/Los_Angeles");

            expect(pacific?.name).toBe("Pacific Time (US & Canada)");
            expect(pacific?.offsetLabel).toBe("GMT-08:00");
        });
    });

    describe("getTimezoneById", () => {
        it("should find a curated timezone", () => {
            expect(getTimezoneById("Etc/UTC")?.name).toBe("UTC");
        });

        it("should return undefined for unknown or missing id", () => {
            expect(getTimezoneById("Unknown/Zone")).toBeUndefined();
            expect(getTimezoneById(undefined)).toBeUndefined();
        });
    });

    describe("getTimezoneTitle", () => {
        it("should combine offset label and name", () => {
            expect(getTimezoneTitle(getTimezoneById("Europe/Prague")!)).toBe("GMT+01:00 Prague");
        });

        it("should return name alone when the offset label is empty", () => {
            expect(getTimezoneTitle({ name: "Not/AZone", offsetLabel: "" })).toBe("Not/AZone");
        });
    });

    describe("getTimezoneLabels", () => {
        it("should return curated labels for a known id", () => {
            expect(getTimezoneLabels("Europe/Prague")).toEqual({
                name: "Prague",
                offsetLabel: "GMT+01:00",
            });
        });

        it("should fall back to Intl computed offset for an ICU-known id outside the curated list", () => {
            const labels = getTimezoneLabels("Australia/Eucla");

            expect(labels.name).toBe("Australia/Eucla");
            expect(labels.offsetLabel).toBe("GMT+08:45");
            expect(getTimezoneTitle(labels)).toBe("GMT+08:45 Australia/Eucla");
        });

        it("should gracefully handle an id unknown even to the runtime", () => {
            const labels = getTimezoneLabels("Not/AZone");

            expect(labels).toEqual({
                name: "Not/AZone",
                offsetLabel: "",
            });
            expect(getTimezoneTitle(labels)).toBe("Not/AZone");
        });
    });

    describe("getTimezoneDisplayLabel", () => {
        it("should return the friendly name with the offset label as suffix in brackets", () => {
            expect(getTimezoneDisplayLabel("Europe/Prague")).toBe("Prague (GMT+01:00)");
        });

        it("should fall back to the raw id and Intl offset for an ICU-known id outside the curated list", () => {
            expect(getTimezoneDisplayLabel("Australia/Eucla")).toBe("Australia/Eucla (GMT+08:45)");
        });

        it("should return the plain id when the offset is not known", () => {
            expect(getTimezoneDisplayLabel("Not/AZone")).toBe("Not/AZone");
        });
    });

    describe("timezoneMatchesSearch", () => {
        const losAngeles = getTimezoneById("America/Los_Angeles")!;
        const prague = getTimezoneById("Europe/Prague")!;

        it("should match on the display title", () => {
            expect(timezoneMatchesSearch(losAngeles, "pacific time")).toBe(true);
            expect(timezoneMatchesSearch(prague, "gmt+01")).toBe(true);
        });

        it("should match on the IANA ID with underscores treated as spaces", () => {
            expect(timezoneMatchesSearch(losAngeles, "Los Angeles")).toBe(true);
            expect(timezoneMatchesSearch(losAngeles, "los_angeles")).toBe(true);
            expect(timezoneMatchesSearch(losAngeles, "america/los")).toBe(true);
        });

        it("should match on the picker display label as shown in the list", () => {
            expect(timezoneMatchesSearch(prague, "Prague (GMT+01")).toBe(true);
        });

        it("should match everything on an empty or whitespace-only search", () => {
            expect(timezoneMatchesSearch(prague, "")).toBe(true);
            expect(timezoneMatchesSearch(prague, "   ")).toBe(true);
        });

        it("should not match unrelated searches", () => {
            expect(timezoneMatchesSearch(prague, "tokyo")).toBe(false);
        });
    });

    describe("getUserTimezone", () => {
        it("should return a curated timezone matching the runtime offsets or UTC", () => {
            const userTimezone = getUserTimezone();
            const januaryOffset = -new Date(2011, 0, 1, 0, 0, 0, 0).getTimezoneOffset();
            const juneOffset = -new Date(2011, 5, 1, 0, 0, 0, 0).getTimezoneOffset();

            expect(getTimezoneById(userTimezone.id)).toBeDefined();

            const matchesRuntime =
                userTimezone.januaryOffset === januaryOffset && userTimezone.juneOffset === juneOffset;
            expect(matchesRuntime || userTimezone.id === "Etc/UTC").toBe(true);
        });
    });
});
