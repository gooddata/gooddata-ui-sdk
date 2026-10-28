// (C) 2026 GoodData Corporation

import { type PublisherThemePaletteReferenceV2 } from "@gooddata/sdk-model";

import { paletteBaseThemeVariables } from "./variablesSpec/theme/palette-base.js";
import { paletteComplementaryThemeVariables } from "./variablesSpec/theme/palette-complementary.js";

/**
 * The CSS variable the theme writes the palette color to.
 *
 * @internal
 */
export function paletteCssVariable(reference: PublisherThemePaletteReferenceV2): string {
    if (reference.type === "complementary") {
        // The provider numbers these by key position; getComplementaryPalette keeps c0 to c9 in order.
        return `--gd-palette-complementary-${reference.step.slice(1)}`;
    }
    return `--gd-palette-${reference.family}-base`;
}

const PALETTE_DEFAULTS = new Map<string, string | null>(
    [...paletteBaseThemeVariables, ...paletteComplementaryThemeVariables].map(
        ({ variableName, defaultValue }) => [variableName, defaultValue],
    ),
);

/**
 * The color the platform draws for the palette color where the theme states none, as the default
 * stylesheet does.
 *
 * @internal
 */
export function paletteDefaultColor(reference: PublisherThemePaletteReferenceV2): string {
    // Info's stylesheet default is primary's variable, which a chart cannot read.
    if (reference.type === "family" && reference.family === "info") {
        return paletteDefaultColor({ type: "family", family: "primary" });
    }
    const variable = paletteCssVariable(reference);
    const color = PALETTE_DEFAULTS.get(variable);
    if (color === undefined || color === null) {
        throw new Error(`The theme variables state no default for ${variable}.`);
    }
    return color;
}
