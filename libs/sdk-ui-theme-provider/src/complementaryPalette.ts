// (C) 2021 GoodData Corporation
import { mix } from "polished";
import { IThemeComplementaryPalette } from "@gooddata/sdk-backend-spi";

const COMPLEMENTARY_PALETTE_PREFIX = "shade";

type IComplementaryPaletteKey = keyof IThemeComplementaryPalette;

const getShade = (palette: IThemeComplementaryPalette, index: number): string => {
    const paletteKeys = Object.keys(palette).map((shade) =>
        parseInt(shade.replace(COMPLEMENTARY_PALETTE_PREFIX, "")),
    );

    const nearestPrevShadeKey = paletteKeys.filter((paletteKey) => paletteKey < index).slice(-1)[0] || 0;
    const nearestNextShadeKey = paletteKeys.filter((paletteKey) => paletteKey > index)[0] || 9;

    const shadesCount = nearestNextShadeKey - nearestPrevShadeKey;
    const mixStep = 1 / shadesCount;

    const nearestPrevShade = palette[`shade${nearestPrevShadeKey}` as IComplementaryPaletteKey] || "#fff";
    const nearestNextShade = palette[`shade${nearestNextShadeKey}` as IComplementaryPaletteKey] || "#000";

    return mix(mixStep * (nearestNextShadeKey - index), nearestPrevShade, nearestNextShade);
};

/**
 * Completes provided complementary palette with missing shades by mixing nearest known shades
 *
 * @internal
 */
export const getComplementaryPalette = (palette: IThemeComplementaryPalette): IThemeComplementaryPalette => {
    return {
        shade0: palette.shade0,
        shade1: palette.shade1 || getShade(palette, 1),
        shade2: palette.shade2 || getShade(palette, 2),
        shade3: palette.shade3 || getShade(palette, 3),
        shade4: palette.shade4 || getShade(palette, 4),
        shade5: palette.shade5 || getShade(palette, 5),
        shade6: palette.shade6 || getShade(palette, 6),
        shade7: palette.shade7 || getShade(palette, 7),
        shade8: palette.shade8 || getShade(palette, 8),
        shade9: palette.shade9,
    };
};
