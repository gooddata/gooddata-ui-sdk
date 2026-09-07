// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { normalizeCssVariableValue } from "./validate.js";

describe("normalizeCssVariableValue", () => {
    it("normalizes 6-digit hex to rgba", () => {
        expect(normalizeCssVariableValue("#e8f7fc")).toBe("rgba(232,247,252,1)");
    });

    it("normalizes 8-digit hex to rgba with rounded alpha", () => {
        expect(normalizeCssVariableValue("#e8f7fc80")).toBe("rgba(232,247,252,0.5)");
    });

    it("normalizes rgb() without alpha to rgba() with alpha 1", () => {
        expect(normalizeCssVariableValue("rgb(232, 247, 252)")).toBe("rgba(232,247,252,1)");
    });

    it("rounds fractional color channels emitted by sass 1.79+", () => {
        expect(normalizeCssVariableValue("rgb(231.5, 247.3, 252.1)")).toBe("rgba(232,247,252,1)");
        expect(normalizeCssVariableValue("rgba(217.8806818182, 242.8375, 250.4193181818, 0.5)")).toBe(
            "rgba(218,243,250,0.5)",
        );
    });

    it("treats sass fractional output and the hex specification as equal", () => {
        expect(normalizeCssVariableValue("rgb(231.5, 247.3, 252.1)")).toBe(
            normalizeCssVariableValue("#e8f7fc"),
        );
    });

    it("restores stripped leading zero without mangling decimals inside numbers", () => {
        expect(normalizeCssVariableValue("rgba(0, 0, 0, .5)")).toBe("rgba(0,0,0,0.5)");
        expect(normalizeCssVariableValue(".5rem")).toBe("0.5rem");
        expect(normalizeCssVariableValue("rgb(217.88, 242.84, 250.42)")).toBe("rgba(218,243,250,1)");
    });

    it("normalizes colors nested inside var() fallbacks", () => {
        expect(
            normalizeCssVariableValue(
                "var(--gd-palette-complementary-1-from-theme, var(--gd-palette-primary-dimmed, rgb(231.5, 247.3, 252.1)))",
            ),
        ).toBe(
            "var(--gd-palette-complementary-1-from-theme,var(--gd-palette-primary-dimmed,rgba(232,247,252,1)))",
        );
    });

    it("normalizes named colors", () => {
        expect(normalizeCssVariableValue("white")).toBe("rgba(255,255,255,1)");
        expect(normalizeCssVariableValue("var(--gd-x, transparent)")).toBe("var(--gd-x,rgba(0,0,0,0))");
    });
});
