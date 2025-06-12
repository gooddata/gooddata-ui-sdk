// (C) 2024 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const indigoDarkTheme: IThemeDefinition = {
    type: "theme",
    title: "Indigo dark",
    theme: {
        palette: {
            primary: {
                base: "#14B2E2",
            },
            complementary: {
                c0: "#09131B",
                c1: "#122330",
                c5: "#4A6C89",
                c9: "#F0F8FF",
            },
        },
        dashboards: {
            content: {
                widget: {
                    backgroundColor: "#122330",
                },
            },
        },
    },
};
