// (C) 2024 GoodData Corporation
import { type IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const redLightTheme: IThemeDefinition = {
    type: "theme",
    title: "Red light",
    theme: {
        palette: {
            primary: {
                base: "#D00008",
            },
            error: {
                base: "#FF0000",
            },
            success: {
                base: "#25a953",
            },
            warning: {
                base: "#FF9546",
            },
            complementary: {
                c0: "#F2F0F0",
                c9: "#666262",
            },
        },
        typography: {
            font: "url(https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJfbwhTIfFd3A.woff2)",
            fontBold:
                "url(https://fonts.gstatic.com/s/crimsontext/v19/wlppgwHKFkZgtmSR3NB0oRJX1C1GDNNQ9rJPfw.woff2)",
        },
        button: {
            borderRadius: "18",
            dropShadow: false,
        },
        modal: {
            title: {
                color: "#666262",
                lineColor: "#C9C3C3",
            },
            borderColor: "#C9C3C3",
            borderRadius: "6",
            borderWidth: "1",
            dropShadow: false,
            outsideBackgroundColor: "#FFFFFF",
        },
        analyticalDesigner: {
            title: {
                color: "#666262",
            },
        },
        dashboards: {
            title: {
                color: "#666262",
                backgroundColor: "#F2F0F0",
                borderColor: "#F2F0F0",
            },
            navigation: {
                title: {
                    color: "#666262",
                },
                borderColor: "#C9C3C3",
                item: {
                    color: "#8C8787",
                    hoverColor: "#D00008",
                    selectedColor: "#666262",
                    selectedBackgroundColor: "#E3E1E1",
                },
                backgroundColor: "#E3E1E1",
            },
            filterBar: {
                filterButton: {
                    backgroundColor: "#F2F0F0",
                },
                backgroundColor: "#F2F0F0",
                borderColor: "#C9C3C3",
            },
            section: {
                title: {
                    color: "#666262",
                    lineColor: "#F2F0F0",
                },
                description: {
                    color: "#999EA5",
                },
            },
            content: {
                kpiWidget: {
                    title: {
                        color: "#736767",
                        textAlign: "center",
                    },
                    kpi: {
                        primaryMeasureColor: "#333131",
                    },
                    borderColor: "#F2F0F0",
                    borderRadius: "6",
                    borderWidth: "1",
                    backgroundColor: "#F2F0F0",
                    dropShadow: false,
                },
                widget: {
                    title: {
                        color: "#101010",
                        textAlign: "center",
                    },
                    borderColor: "#F2F0F0",
                    borderRadius: "6",
                    borderWidth: "2",
                    dropShadow: false,
                },
            },
        },
    },
};
