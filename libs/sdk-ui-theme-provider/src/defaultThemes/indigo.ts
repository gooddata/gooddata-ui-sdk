// (C) 2019-2025 GoodData Corporation
import { IThemeDefinition } from "@gooddata/sdk-model";

/**
 * Indigo theme still does not match default scss (because of inconsistent variables),
 * but feel free to use for exploration to see the differences.
 *
 * @internal
 */
export const indigoTheme: IThemeDefinition = {
    type: "theme",
    title: "Indigo",
    theme: {
        palette: {
            error: {
                base: "#e54d42",
            },
            info: {
                base: "#14b2e2",
            },
            primary: {
                base: "#14b2e2",
            },
            success: {
                base: "#00c18d",
            },
            warning: {
                base: "#f18600",
            },
            complementary: {
                c0: "#fff",
                c1: "#f5f8fa",
                c2: "#ebeff4",
                c3: "#dde4eb",
                c4: "#ccd8e2",
                c5: "#b0beca",
                c6: "#94a1ad",
                c7: "#6d7680",
                c8: "#464e56",
                c9: "#000",
            },
        },
        button: {
            borderRadius: "3px",
            dropShadow: true,
            textCapitalization: false,
        },
        tooltip: {
            backgroundColor: "rgba(70, 78, 86, 0.95)",
            color: "#fff",
        },
        modal: {
            borderColor: "#dde4eb",
            borderRadius: "3px",
            borderWidth: "0",
            dropShadow: true,
            outsideBackgroundColor: "#eff1f3",
            title: {
                color: "#000",
                lineColor: "#dde4eb",
            },
        },
        chart: {
            axisColor: "#ccd6eb",
            axisLabelColor: "#6d7680",
            axisValueColor: "#94a1ad",
            backgroundColor: "#fff",
            gridColor: "#ebebeb",
            legendValueColor: "#6d7680",
            tooltipBackgroundColor: "rgba(255, 255, 255, 0.95)",
            tooltipBorderColor: "rgba(201, 213, 224, 0.7)",
            tooltipLabelColor: "#000",
            tooltipValueColor: "#000",
        },
        table: {
            backgroundColor: "#fff",
            gridColor: "rgba(176, 190, 202, 0.5",
            headerHoverBackgroundColor: "#e8f7fc",
            headerLabelColor: "#464e56",
            hoverBackgroundColor: "rgba(109, 118, 128, 0.1)",
            loadingIconColor: "#94a1ad",
            nullValueColor: "#94a1ad",
            subtotalBackgroundColor: "rgba(176, 190, 202, 0.1)",
            totalBackgroundColor: "rgba(176, 190, 202, 0.2)",
            totalValueColor: "#000",
            valueColor: "#464e56",
        },
        kpi: {
            primaryMeasureColor: "#000",
            secondaryInfoColor: "rgba(176, 190, 202, 0.5)",
        },
        analyticalDesigner: {
            title: {
                color: "#464e56",
            },
        },
        dashboards: {
            content: {
                backgroundColor: "#fff",
                kpiWidget: {
                    backgroundColor: "#fff",
                    borderColor: "transparent",
                    borderRadius: "15px",
                    borderWidth: "2px",
                    dropShadow: false,
                    kpi: {
                        primaryMeasureColor: "#6d7680",
                        secondaryInfoColor: "#94a1ad",
                    },
                    title: {
                        color: "#464e56",
                        textAlign: "center",
                    },
                },
                widget: {
                    backgroundColor: "#fff",
                    borderColor: "transparent",
                    borderRadius: "15px",
                    borderWidth: "2px",
                    dropShadow: false,
                    title: {
                        color: "#464e56",
                        textAlign: "center",
                    },
                },
            },
            filterBar: {
                backgroundColor: "#fff",
                borderColor: "#dde4eb",
                filterButton: {
                    backgroundColor: "transparent",
                },
            },
            navigation: {
                backgroundColor: "#303442",
                borderColor: "rgba(148, 161, 173, 0.2)",
                title: {
                    color: "#94a1ad",
                },
                item: {
                    color: "#94a1ad",
                    hoverColor: "#fff",
                    selectedColor: "#fff",
                    selectedBackgroundColor: "#131c28",
                },
            },
            section: {
                description: {
                    color: "#94a1ad",
                },
                title: {
                    color: "#464e56",
                    lineColor: "#dde4eb",
                },
            },
            title: {
                backgroundColor: "#fff",
                color: "#464e56",
                borderColor: "#dde4eb",
            },
        },
    },
};
