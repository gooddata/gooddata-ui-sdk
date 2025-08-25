// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { parseBackendDate } from "../date.js";

describe("parseBackendDate", () => {
    it("parses a valid UTC date string in 'yyyy-MM-dd HH:mm' format", () => {
        const date = parseBackendDate("2025-01-02 03:04");
        expect(date?.toISOString()).toBe("2025-01-02T03:04:00.000Z");
    });

    it("parses leap day correctly", () => {
        const date = parseBackendDate("2024-02-29 23:59");
        expect(date?.toISOString()).toBe("2024-02-29T23:59:00.000Z");
    });

    it("parses the Unix epoch start", () => {
        const date = parseBackendDate("1970-01-01 00:00");
        expect(date?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    });

    it("returns null for unsupported format", () => {
        const date = parseBackendDate("2025-01-02 03:04:24");
        expect(date).toBeNull();
    });

    it("returns null for malformed input", () => {
        const date = parseBackendDate("not-a-date");
        expect(date).toBeNull();
    });
});
