// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DASHBOARD_TITLE_MAX_LENGTH, truncateDashboardTitle } from "./dashboardTitle.js";

describe("truncateDashboardTitle", () => {
    it("should keep a title of exactly 255 characters", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH);

        expect(truncateDashboardTitle(title)).toBe(title);
    });

    it("should keep the first 255 characters of a 256 character title", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH) + "b";

        expect(truncateDashboardTitle(title)).toBe("a".repeat(DASHBOARD_TITLE_MAX_LENGTH));
    });

    it("should not split a surrogate pair at the limit", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 1) + "😀";

        expect(truncateDashboardTitle(title)).toBe("a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 1));
    });

    it("should keep a surrogate pair that ends exactly at the limit", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 2) + "😀b";

        expect(truncateDashboardTitle(title)).toBe("a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 2) + "😀");
    });

    it("should not split an emoji with a skin tone modifier at the limit", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 2) + "👍🏽";

        expect(truncateDashboardTitle(title)).toBe("a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 2));
    });

    it("should not leave a dangling joiner of an emoji sequence at the limit", () => {
        const title = "a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 4) + "👩‍💻";

        expect(truncateDashboardTitle(title)).toBe("a".repeat(DASHBOARD_TITLE_MAX_LENGTH - 4));
    });

    it("should respect a custom max length", () => {
        expect(truncateDashboardTitle("abcdef", 3)).toBe("abc");
    });

    it("should remove whitespace left at the end by the cut", () => {
        expect(truncateDashboardTitle("ab  cdef", 4)).toBe("ab");
    });

    it("should keep trailing whitespace of a title that is not cut", () => {
        expect(truncateDashboardTitle("ab  ", 4)).toBe("ab  ");
    });

    it("should return an empty title for a negative max length", () => {
        expect(truncateDashboardTitle("abc", -2)).toBe("");
    });
});
