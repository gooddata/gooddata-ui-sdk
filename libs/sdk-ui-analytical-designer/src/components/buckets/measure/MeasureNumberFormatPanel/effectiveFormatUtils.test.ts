// (C) 2025-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IFormatPreset } from "@gooddata/sdk-ui-kit";

import { getEffectiveSelectedFormat } from "./effectiveFormatUtils.js";

describe("getEffectiveSelectedFormat", () => {
    const mockInheritPreset: IFormatPreset = {
        name: "Inherit",
        localIdentifier: "inherit",
        format: "$#,##0.00",
        previewNumber: 1000.12,
    };

    describe("priority 1: user-selected format", () => {
        it("should return selectedFormat when it is set", () => {
            const result = getEffectiveSelectedFormat(
                "#,##0.00", // user selected format
                "€#,##0.00", // metric's custom format
                mockInheritPreset, // inherit preset available
            );

            expect(result).toBe("#,##0.00");
        });

        it("should return selectedFormat even when defaultCustomFormat and inheritPreset are null", () => {
            const result = getEffectiveSelectedFormat("#,##0%", null, null);

            expect(result).toBe("#,##0%");
        });
    });

    describe("priority 2: metric's custom format", () => {
        it("should return defaultCustomFormat when selectedFormat is null", () => {
            const result = getEffectiveSelectedFormat(
                null, // no user selection
                "€#,##0.00", // metric's custom format
                mockInheritPreset, // inherit preset available
            );

            expect(result).toBe("€#,##0.00");
        });

        it("should return defaultCustomFormat when selectedFormat is null and no inherit preset", () => {
            const result = getEffectiveSelectedFormat(
                null, // no user selection
                "¥#,##0", // metric's custom format
                null, // no inherit preset
            );

            expect(result).toBe("¥#,##0");
        });
    });

    describe("priority 3: inherit preset format", () => {
        it("should return inheritPreset.format when selectedFormat and defaultCustomFormat are null", () => {
            const result = getEffectiveSelectedFormat(
                null, // no user selection
                null, // no custom format on metric
                mockInheritPreset, // inherit preset available
            );

            expect(result).toBe("$#,##0.00");
        });

        it("should handle inherit preset with null format (legacy non-CURRENCY inherit)", () => {
            const legacyInheritPreset: IFormatPreset = {
                name: "Inherit",
                localIdentifier: "inherit",
                format: null,
                previewNumber: 1000.12,
            };

            const result = getEffectiveSelectedFormat(null, null, legacyInheritPreset);

            expect(result).toBeNull();
        });
    });

    describe("priority 4: fallback to null", () => {
        it("should return null when all inputs are null", () => {
            const result = getEffectiveSelectedFormat(null, null, null);

            expect(result).toBeNull();
        });
    });

    describe("edge cases", () => {
        it("should treat empty string selectedFormat as a valid format", () => {
            // Empty string is technically a format (though unusual)
            const result = getEffectiveSelectedFormat("", "€#,##0.00", mockInheritPreset);

            // Empty string is not null, so it should be returned
            expect(result).toBe("");
        });

        it("should treat empty string defaultCustomFormat as falsy and skip to inherit", () => {
            const result = getEffectiveSelectedFormat(null, "", mockInheritPreset);

            // Empty string is falsy, so it should fall through to inheritPreset
            expect(result).toBe("$#,##0.00");
        });
    });
});
