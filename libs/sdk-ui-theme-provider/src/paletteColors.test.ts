// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type PublisherThemePaletteReferenceV2 } from "@gooddata/sdk-model";

import { setCssProperties } from "./cssProperties.js";
import { paletteCssVariable, paletteDefaultColor } from "./paletteColors.js";
import { prepareTheme } from "./ThemeProvider/prepareTheme.js";

describe("paletteCssVariable", () => {
    it("names the variable the provider writes a complementary step to", () => {
        const theme = prepareTheme({
            palette: { complementary: { c9: "#000000", c3: "#333333", c0: "#ffffff" } },
        });
        const element = document.createElement("div");

        setCssProperties(theme, false, true, element);

        expect(
            element.style.getPropertyValue(paletteCssVariable({ type: "complementary", step: "c3" })),
        ).toBe("#333333");
    });
});

describe("paletteDefaultColor", () => {
    const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/;

    it.each([
        ...(["primary", "success", "error", "warning", "info"] as const).map(
            (family): PublisherThemePaletteReferenceV2 => ({ type: "family", family }),
        ),
        ...(["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"] as const).map(
            (step): PublisherThemePaletteReferenceV2 => ({ type: "complementary", step }),
        ),
    ])("gives %j a color a chart can draw", (reference) => {
        expect(paletteDefaultColor(reference)).toMatch(HEX);
    });

    it("gives info the primary color, as the stylesheet does", () => {
        expect(paletteDefaultColor({ type: "family", family: "info" })).toBe(
            paletteDefaultColor({ type: "family", family: "primary" }),
        );
    });

    it("reads the colors the default stylesheet is generated from", () => {
        expect(paletteDefaultColor({ type: "family", family: "error" })).toBe("#e54d42");
        expect(paletteDefaultColor({ type: "complementary", step: "c3" })).toBe("#dde4eb");
    });
});
