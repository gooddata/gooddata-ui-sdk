// (C) 2021-2022 GoodData Corporation
import { mix } from "polished";
import { IThemeComplementaryPalette } from "@gooddata/sdk-model";

const COMPLEMENTARY_PALETTE_PREFIX = "c";

type IComplementaryPaletteKey = keyof IThemeComplementaryPalette;

const getShade = (palette: IThemeComplementaryPalette, index: number): string => {
    const paletteKeys = Object.keys(palette)
        .sort()
        .map((shade) => parseInt(shade.replace(COMPLEMENTARY_PALETTE_PREFIX, "")));

    const nearestPrevShadeKey = paletteKeys.filter((paletteKey) => paletteKey < index).slice(-1)[0] || 0;
    const nearestNextShadeKey = paletteKeys.filter((paletteKey) => paletteKey > index)[0] || 9;

    const shadesCount = nearestNextShadeKey - nearestPrevShadeKey;
    const mixStep = 1 / shadesCount;

    const nearestPrevShade =
        palette[`${COMPLEMENTARY_PALETTE_PREFIX}${nearestPrevShadeKey}` as IComplementaryPaletteKey] ||
        "#fff";
    const nearestNextShade =
        palette[`${COMPLEMENTARY_PALETTE_PREFIX}${nearestNextShadeKey}` as IComplementaryPaletteKey] ||
        "#000";

    return mix(mixStep * (nearestNextShadeKey - index), nearestPrevShade, nearestNextShade);
};

/**
 * Completes provided complementary palette with missing shades by mixing nearest known shades
 *
 * @internal
 */
export const getComplementaryPalette = (palette: IThemeComplementaryPalette): IThemeComplementaryPalette => {
    return {
        c0: palette.c0,
        c1: palette.c1 ?? getShade(palette, 1),
        c2: palette.c2 ?? getShade(palette, 2),
        c3: palette.c3 ?? getShade(palette, 3),
        c4: palette.c4 ?? getShade(palette, 4),
        c5: palette.c5 ?? getShade(palette, 5),
        c6: palette.c6 ?? getShade(palette, 6),
        c7: palette.c7 ?? getShade(palette, 7),
        c8: palette.c8 ?? getShade(palette, 8),
        c9: palette.c9,
    };
};
