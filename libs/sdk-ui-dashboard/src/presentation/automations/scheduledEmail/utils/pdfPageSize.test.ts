// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getDefaultPdfPageSize } from "./pdfPageSize.js";

describe("getDefaultPdfPageSize", () => {
    it.each([
        ["en-US", "LETTER"],
        ["en-CA", "LETTER"],
        ["en-GB", "A4"],
        ["de-DE", "A4"],
    ] as const)("returns %s -> %s", (formatLocale, expected) => {
        expect(getDefaultPdfPageSize(formatLocale)).toBe(expected);
    });

    it("accepts the underscore locale form the backend also uses", () => {
        expect(getDefaultPdfPageSize("en_US")).toBe("LETTER");
    });

    it("matches the region case-insensitively", () => {
        expect(getDefaultPdfPageSize("en-us")).toBe("LETTER");
    });

    it("falls back to A4 when the locale carries no region", () => {
        expect(getDefaultPdfPageSize("en")).toBe("A4");
    });

    it("falls back to A4 when no locale is known", () => {
        expect(getDefaultPdfPageSize(undefined)).toBe("A4");
    });

    it("reads the region past a script subtag", () => {
        expect(getDefaultPdfPageSize("sr-Latn-US")).toBe("LETTER");
    });

    it("reads the region past a variant subtag in the underscore form", () => {
        expect(getDefaultPdfPageSize("en_US_POSIX")).toBe("LETTER");
    });

    it("falls back to A4 for a locale Intl.Locale cannot parse", () => {
        expect(getDefaultPdfPageSize("not a locale")).toBe("A4");
    });
});
