// (C) 2024 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const pompelmoLightTheme: IThemeDefinition = {
    type: "theme",
    title: "Pompelmo light",
    theme: {
        palette: {
            primary: {
                base: "#FF6868",
            },
            error: {
                base: "#d13049",
            },
            success: {
                base: "#25a953",
            },
            warning: {
                base: "#FF9546",
            },
            complementary: {
                c0: "#FFFFFF",
                c1: "#F2F0F0",
                c9: "#585555",
            },
        },
        typography: {
            font: "url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4AMP6lQ.woff2)",
            fontBold: "url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2)",
        },
        button: {
            borderRadius: "6",
            dropShadow: true,
        },
        modal: {
            title: {
                color: "#585555",
                lineColor: "#DFE0E5",
            },
            borderColor: "#ffffff",
            borderRadius: "6",
            borderWidth: "2",
            dropShadow: true,
            outsideBackgroundColor: "#F2F0F0",
        },
        analyticalDesigner: {
            title: {
                color: "#585555",
            },
        },
        dashboards: {
            title: {
                color: "#585555",
                backgroundColor: "#F2F0F0",
                borderColor: "#D1BEBE",
            },
            navigation: {
                title: {
                    color: "#D1BEBE",
                },
                borderColor: "#D1BEBE",
                item: {
                    color: "#D1BEBE",
                    hoverColor: "#FF6868",
                    selectedColor: "#585555",
                    selectedBackgroundColor: "#F2F0F0",
                },
                backgroundColor: "#261D1D",
            },
            filterBar: {
                filterButton: {
                    backgroundColor: "#F2F0F0",
                },
                backgroundColor: "#F2F0F0",
                borderColor: "#D1BEBE",
            },
            section: {
                title: {
                    color: "#585555",
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
                        primaryMeasureColor: "#261D1D",
                        secondaryInfoColor: "#736767",
                    },
                    borderColor: "#fff",
                    borderRadius: "6",
                    borderWidth: "1",
                    backgroundColor: "#fff",
                    dropShadow: false,
                },
                widget: {
                    title: {
                        color: "#101010",
                        textAlign: "center",
                    },
                    borderColor: "#ffffff",
                    borderRadius: "6",
                    borderWidth: "2",
                    dropShadow: false,
                },
                backgroundColor: "#F2F0F0",
            },
        },
    },
};
