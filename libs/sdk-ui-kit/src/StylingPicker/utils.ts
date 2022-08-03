// (C) 2022 GoodData Corporation

import { idRef, IThemeDefinition } from "@gooddata/sdk-model";

/**
 * Dummy theme metadata object which represents the default colors of GD.
 *
 * This object is used as default when rendering theme as a sequence of colored elements in styling
 * picker. It's properties are also used as defaults when some custom theme is missing a crucial
 * property for the same rendering purposes.
 *
 * @internal
 */
export const defaultThemeMetadataObject: IThemeDefinition = {
    id: "default-theme",
    ref: idRef("default-theme"),
    uri: "",
    type: "theme",
    description: "",
    production: false,
    deprecated: false,
    unlisted: false,
    title: "Indigo",
    theme: {
        palette: {
            primary: {
                base: "#14b2e2",
            },
            complementary: {
                c0: "#fff",
                c1: "#303442",
                c7: "#778491",
                c8: "#464e56",
                c9: "#000",
            },
        },
    },
};

/**
 * This function transforms a theme metadata object into an array of colors which is used
 * to render the theme in styling picker. When provided theme object is missing some properties,
 * defaults are taken from the {@link defaultThemeMetadataObject}.
 *
 * @internal
 */
export const getColorsPreviewFromTheme = (themeDef: IThemeDefinition): string[] => {
    const { theme } = themeDef;
    const { theme: defaultTheme } = defaultThemeMetadataObject;

    const color1 =
        theme.dashboards?.navigation?.backgroundColor ||
        theme.palette?.complementary?.c1 ||
        defaultTheme.palette.complementary.c1;
    const color2 =
        theme.dashboards?.content?.backgroundColor ||
        theme.palette?.complementary?.c0 ||
        defaultTheme.palette.complementary.c0;
    const color3 = theme.palette?.primary?.base || defaultTheme.palette.primary.base;
    const color4 =
        theme.dashboards?.content?.kpiWidget?.kpi?.primaryMeasureColor ||
        theme.palette?.complementary?.c9 ||
        defaultTheme.palette.complementary.c9;
    const color5 =
        theme.dashboards?.title?.color ||
        theme.palette?.complementary?.c8 ||
        defaultTheme.palette.complementary.c8;
    const color6 = theme.palette?.complementary?.c7 || defaultTheme.palette.complementary.c7;

    return [color1, color2, color3, color4, color5, color6];
};
