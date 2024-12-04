// (C) 2024 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const blueLightTheme: IThemeDefinition = {
    type: "theme",
    title: "Blue light",
    theme: {
        palette: {
            primary: {
                base: "#347EFF",
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
        },
        button: {
            borderRadius: "2",
            dropShadow: true,
        },
        modal: {
            title: {
                color: "#413C5E",
                lineColor: "#DFE0E5",
            },
            borderColor: "#ffffff",
            borderRadius: "6",
            borderWidth: "2",
            dropShadow: true,
            outsideBackgroundColor: "#DFE0E5",
        },
        tooltip: {
            color: "#FFFFFFCC",
            backgroundColor: "#413C5E",
        },
        analyticalDesigner: {
            title: {
                color: "#413C5E",
            },
        },
        dashboards: {
            title: {
                color: "#413C5E",
                backgroundColor: "#FFFFFF",
                borderColor: "#BFC4E0",
            },
            navigation: {
                title: {
                    color: "#413C5E",
                },
                borderColor: "#BFC4E0",
                item: {
                    color: "#413C5E",
                    hoverColor: "#2A80F8",
                    selectedColor: "#2A80F8",
                    selectedBackgroundColor: "#fff",
                },
                backgroundColor: "#F4F5FB",
            },
            filterBar: {
                filterButton: {
                    backgroundColor: "#FFFFFF",
                },
                backgroundColor: "#FFFFFF",
                borderColor: "#BFC4E0",
            },
            section: {
                title: {
                    color: "#413C5E",
                    lineColor: "#FFFFFF",
                },
                description: {
                    color: "#999EA5",
                },
            },
            content: {
                kpiWidget: {
                    title: {
                        color: "#413c5e",
                        textAlign: "center",
                    },
                    kpi: {
                        primaryMeasureColor: "#2a80f8",
                        secondaryInfoColor: "#413C5E99",
                    },
                    borderColor: "#2168E5",
                    borderRadius: "6",
                    borderWidth: "0",
                    backgroundColor: "#F4F5FB",
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
                backgroundColor: "#FFFFFF",
            },
        },
    },
};
