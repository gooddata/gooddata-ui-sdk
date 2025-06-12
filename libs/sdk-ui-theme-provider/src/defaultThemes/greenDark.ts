// (C) 2024 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const greenDarkTheme: IThemeDefinition = {
    type: "theme",
    title: "Green dark",
    theme: {
        palette: {
            primary: {
                base: "#1DB954",
            },
            complementary: {
                c0: "#000",
                c1: "#262626",
                c2: "#323333",
                c3: "#3F403F",
                c4: "#585958",
                c5: "#707370",
                c6: "#898C89",
                c7: "#A1A6A2",
                c8: "#BABFBA",
                c9: "#D2D9D3",
            },
        },
        typography: {
            font: "url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4AMP6lQ.woff2)",
            fontBold: "url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2)",
        },
        dashboards: {
            filterBar: {
                borderColor: "#000",
            },
            content: {
                kpiWidget: {
                    borderRadius: "4",
                    backgroundColor: "#262626",
                },
            },
        },
    },
};
