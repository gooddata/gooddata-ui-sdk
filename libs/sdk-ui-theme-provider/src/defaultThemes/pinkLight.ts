// (C) 2024 GoodData Corporation
import { type IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const pinkLightTheme: IThemeDefinition = {
    type: "theme",
    title: "Pink light",
    theme: {
        palette: {
            primary: {
                base: "#ED26B7",
            },
            error: {
                base: "#e54d42",
            },
            success: {
                base: "#00c18d",
            },
            warning: {
                base: "#f4d521",
            },
        },
        typography: {
            font: "url(https://fonts.gstatic.com/s/lato/v23/S6uyw4BMUTPHjx4wXiWtFCc.woff2)",
            fontBold: "url(https://fonts.gstatic.com/s/lato/v23/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2)",
        },
        button: {
            borderRadius: "100",
            dropShadow: false,
        },
        analyticalDesigner: {
            title: {
                color: "#1C0D3F",
            },
        },
        dashboards: {
            content: {
                kpiWidget: {
                    title: {
                        color: "#f2f4f6B2",
                        textAlign: "center",
                    },
                    kpi: {
                        primaryMeasureColor: "#fff",
                        secondaryInfoColor: "#f2f4f6B2",
                    },
                    borderRadius: "6",
                    borderWidth: "1",
                    backgroundColor: "#1c0d3f",
                    dropShadow: false,
                },
            },
            title: {
                color: "#1C0D3F",
                backgroundColor: "#fff",
                borderColor: "#DFE4E8",
            },
            navigation: {
                backgroundColor: "#1C0D3F",
                title: {
                    color: "#fff",
                },
                item: {
                    color: "#BFC9D1",
                    hoverColor: "#fff",
                    selectedColor: "#fff",
                    selectedBackgroundColor: "#FFFFFF1A",
                },
            },
            filterBar: {
                filterButton: {
                    backgroundColor: "#F2F4F6",
                },
                backgroundColor: "#fff",
                borderColor: "#DFE4E8",
            },
            section: {
                title: {
                    color: "#1c0d3f",
                    lineColor: "#DFE4E8",
                },
            },
        },
    },
};
