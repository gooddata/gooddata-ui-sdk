// (C) 2026 GoodData Corporation

import { type IThemeComplementaryPalette, type IThemePalette } from "../../theme/index.js";

import { getPublisherThemeReferencePathV2 } from "./themeReference.js";

/**
 * A color family of the theme's platform palette: `primary`, `success`, `error`, `warning` or `info`.
 *
 * @alpha
 */
export type PublisherThemePaletteFamilyV2 = Exclude<keyof IThemePalette, "complementary">;

/**
 * A color of the theme's platform palette that a color value names.
 *
 * @remarks
 * `{theme.palette.<family>}` is the family's base color, where family is `primary`, `success`,
 * `error`, `warning` or `info`. `{theme.palette.complementary.c0}` to
 * `{theme.palette.complementary.c9}` are the complementary palette's steps.
 *
 * @alpha
 */
export type PublisherThemePaletteReferenceV2 =
    | { type: "family"; family: PublisherThemePaletteFamilyV2 }
    | { type: "complementary"; step: keyof IThemeComplementaryPalette };

type ComplementaryStep = keyof IThemeComplementaryPalette;

// Sound because each record lists exactly the members of its key union.
function keysOf<T extends string>(members: Record<T, true>): readonly T[] {
    return Object.keys(members) as T[];
}

// A family added to the theme's palette stops this compiling until it is listed: listing it widens the
// grammar the backend's validator has to accept too.
export const PUBLISHER_PALETTE_FAMILIES_V2 = keysOf<PublisherThemePaletteFamilyV2>({
    primary: true,
    success: true,
    error: true,
    warning: true,
    info: true,
});

export const PUBLISHER_COMPLEMENTARY_STEPS_V2 = keysOf<ComplementaryStep>({
    c0: true,
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: true,
    c6: true,
    c7: true,
    c8: true,
    c9: true,
});

function isOneOf<T extends string>(list: readonly T[], value: string | undefined): value is T {
    return (list as readonly (string | undefined)[]).includes(value);
}

/**
 * The palette color a color value references, such as `{theme.palette.info}`; undefined when the
 * value is not a palette reference.
 *
 * @alpha
 */
export function getPublisherThemePaletteReferenceV2(
    value: unknown,
): PublisherThemePaletteReferenceV2 | undefined {
    const [group, name, step, ...rest] = getPublisherThemeReferencePathV2(value) ?? [];
    if (group !== "palette" || rest.length > 0) {
        return undefined;
    }
    if (isOneOf(PUBLISHER_PALETTE_FAMILIES_V2, name)) {
        return step === undefined ? { type: "family", family: name } : undefined;
    }
    return name === "complementary" && isOneOf(PUBLISHER_COMPLEMENTARY_STEPS_V2, step)
        ? { type: "complementary", step }
        : undefined;
}
