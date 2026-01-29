// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISeparators } from "@gooddata/number-formatter";

import { DEFAULT_SEPARATORS, formatNumberWithSeparators, shortenNumber } from "../numberFormat.js";

describe("formatNumberWithSeparators", () => {
    describe("with default separators", () => {
        it("should format integer with thousand separators", () => {
            expect(formatNumberWithSeparators(1234)).toBe("1,234");
        });

        it("should format large integer with multiple thousand separators", () => {
            expect(formatNumberWithSeparators(1234567890)).toBe("1,234,567,890");
        });

        it("should format number with decimal part", () => {
            expect(formatNumberWithSeparators(1234.56)).toBe("1,234.56");
        });

        it("should format small number without thousand separators", () => {
            expect(formatNumberWithSeparators(123)).toBe("123");
        });

        it("should format negative number with thousand separators", () => {
            expect(formatNumberWithSeparators(-1234.5)).toBe("-1,234.5");
        });

        it("should format zero", () => {
            expect(formatNumberWithSeparators(0)).toBe("0");
        });

        it("should return empty string for null", () => {
            expect(formatNumberWithSeparators(null)).toBe("");
        });

        it("should return empty string for undefined", () => {
            expect(formatNumberWithSeparators(undefined)).toBe("");
        });
    });

    describe("with custom separators", () => {
        const europeanSeparators: ISeparators = {
            thousand: " ",
            decimal: ",",
        };

        it("should format number with space as thousand separator", () => {
            expect(formatNumberWithSeparators(1234567, europeanSeparators)).toBe("1 234 567");
        });

        it("should format number with comma as decimal separator", () => {
            expect(formatNumberWithSeparators(1234.56, europeanSeparators)).toBe("1 234,56");
        });

        it("should format negative number with custom separators", () => {
            expect(formatNumberWithSeparators(-1234.5, europeanSeparators)).toBe("-1 234,5");
        });
    });

    describe("default separators fallback", () => {
        it("should use default separators when none provided", () => {
            expect(formatNumberWithSeparators(1234.56)).toBe("1,234.56");
        });
    });
});

describe("DEFAULT_SEPARATORS", () => {
    it("should have comma as thousand separator", () => {
        expect(DEFAULT_SEPARATORS.thousand).toBe(",");
    });

    it("should have period as decimal separator", () => {
        expect(DEFAULT_SEPARATORS.decimal).toBe(".");
    });
});

describe("shortenNumber", () => {
    describe("with K suffix", () => {
        it("should shorten 1000 to 1K", () => {
            expect(shortenNumber(1000)).toBe("1K");
        });

        it("should shorten 2000 to 2K", () => {
            expect(shortenNumber(2000)).toBe("2K");
        });

        it("should shorten 10000 to 10K", () => {
            expect(shortenNumber(10000)).toBe("10K");
        });

        it("should shorten 2500 to 2.5K", () => {
            expect(shortenNumber(2500)).toBe("2.5K");
        });

        it("should shorten 999900 to 999.9K", () => {
            expect(shortenNumber(999900)).toBe("999.9K");
        });

        it("should shorten 1500 to 1.5K", () => {
            expect(shortenNumber(1500)).toBe("1.5K");
        });

        it("should NOT shorten 1234 (not evenly divisible by 100)", () => {
            expect(shortenNumber(1234)).toBe("1,234");
        });

        it("should NOT shorten 999 (below 1000)", () => {
            expect(shortenNumber(999)).toBe("999");
        });
    });

    describe("with M suffix", () => {
        it("should shorten 1000000 to 1M", () => {
            expect(shortenNumber(1000000)).toBe("1M");
        });

        it("should shorten 2000000 to 2M", () => {
            expect(shortenNumber(2000000)).toBe("2M");
        });

        it("should shorten 2500000 to 2.5M", () => {
            expect(shortenNumber(2500000)).toBe("2.5M");
        });

        it("should shorten 999900000 to 999.9M", () => {
            expect(shortenNumber(999900000)).toBe("999.9M");
        });

        it("should shorten 1500000 to 1.5M", () => {
            expect(shortenNumber(1500000)).toBe("1.5M");
        });

        it("should NOT shorten 1234567 (not evenly divisible by 100000)", () => {
            expect(shortenNumber(1234567)).toBe("1,234,567");
        });
    });

    describe("with B suffix", () => {
        it("should shorten 1000000000 to 1B", () => {
            expect(shortenNumber(1000000000)).toBe("1B");
        });

        it("should shorten 2000000000 to 2B", () => {
            expect(shortenNumber(2000000000)).toBe("2B");
        });

        it("should shorten 2500000000 to 2.5B", () => {
            expect(shortenNumber(2500000000)).toBe("2.5B");
        });

        it("should shorten 999900000000 to 999.9B", () => {
            expect(shortenNumber(999900000000)).toBe("999.9B");
        });

        it("should shorten 1500000000 to 1.5B", () => {
            expect(shortenNumber(1500000000)).toBe("1.5B");
        });

        it("should NOT shorten 1234567890 (not evenly divisible by 100000000)", () => {
            expect(shortenNumber(1234567890)).toBe("1,234,567,890");
        });
    });

    describe("negative numbers", () => {
        it("should shorten negative thousands", () => {
            expect(shortenNumber(-1000)).toBe("-1K");
        });

        it("should shorten negative millions", () => {
            expect(shortenNumber(-2000000)).toBe("-2M");
        });

        it("should shorten negative billions", () => {
            expect(shortenNumber(-3000000000)).toBe("-3B");
        });

        it("should NOT shorten negative numbers not evenly divisible", () => {
            expect(shortenNumber(-1234)).toBe("-1,234");
        });
    });

    describe("edge cases", () => {
        it("should return empty string for null", () => {
            expect(shortenNumber(null)).toBe("");
        });

        it("should return empty string for undefined", () => {
            expect(shortenNumber(undefined)).toBe("");
        });

        it("should format zero without shortening", () => {
            expect(shortenNumber(0)).toBe("0");
        });

        it("should format small numbers without shortening", () => {
            expect(shortenNumber(100)).toBe("100");
            expect(shortenNumber(500)).toBe("500");
            expect(shortenNumber(999)).toBe("999");
        });
    });

    describe("with custom separators", () => {
        const europeanSeparators: ISeparators = {
            thousand: " ",
            decimal: ",",
        };

        it("should shorten with custom thousand separator", () => {
            expect(shortenNumber(1000, europeanSeparators)).toBe("1K");
        });

        it("should shorten with custom decimal separator", () => {
            expect(shortenNumber(2500, europeanSeparators)).toBe("2,5K");
        });

        it("should use custom separators when not shortening", () => {
            expect(shortenNumber(1234, europeanSeparators)).toBe("1 234");
        });

        it("should shorten millions with custom separators", () => {
            expect(shortenNumber(2500000, europeanSeparators)).toBe("2,5M");
        });

        it("should shorten billions with custom separators", () => {
            expect(shortenNumber(2500000000, europeanSeparators)).toBe("2,5B");
        });
    });

    describe("default separators fallback", () => {
        it("should use default separators when none provided", () => {
            expect(shortenNumber(1000)).toBe("1K");
            expect(shortenNumber(2500)).toBe("2.5K");
        });
    });

    describe("boundary values", () => {
        it("should handle exact boundary for K (1000)", () => {
            expect(shortenNumber(1000)).toBe("1K");
        });

        it("should handle exact boundary for M (1000000)", () => {
            expect(shortenNumber(1000000)).toBe("1M");
        });

        it("should handle exact boundary for B (1000000000)", () => {
            expect(shortenNumber(1000000000)).toBe("1B");
        });

        it("should handle value just below K boundary (900)", () => {
            expect(shortenNumber(900)).toBe("900");
        });

        it("should handle value just below M boundary (900000)", () => {
            expect(shortenNumber(900000)).toBe("900K");
        });

        it("should handle value just below B boundary (900000000)", () => {
            expect(shortenNumber(900000000)).toBe("900M");
        });
    });
});
