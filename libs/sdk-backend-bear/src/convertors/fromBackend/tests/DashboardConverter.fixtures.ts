// (C) 2019-2021 GoodData Corporation

import {
    GdcDashboard,
    GdcFilterContext,
    GdcMetadata,
    GdcVisualizationWidget,
    GdcKpi,
    GdcVisualizationObject,
    GdcVisualizationClass,
} from "@gooddata/api-model-bear";
import { BearDashboardDependency } from "../DashboardConverter/index.js";

const createObjectMeta = (id: string): GdcMetadata.IObjectMeta => ({
    identifier: id,
    uri: `/gdc/md/obj/${id}`,
    summary: "",
    title: id,
    updated: "2020-05-05 10:10:10",
    created: "2020-05-05 00:00:00",
});

export const filterContext: GdcFilterContext.IWrappedFilterContext = {
    filterContext: {
        content: {
            filters: [
                {
                    attributeFilter: {
                        attributeElements: ["/test", "/test2"],
                        displayForm: "/displayForm",
                        negativeSelection: false,
                        localIdentifier: "parent",
                    },
                },
                {
                    attributeFilter: {
                        attributeElements: ["/test3", "/test4"],
                        displayForm: "/displayForm34",
                        negativeSelection: false,
                        filterElementsBy: [
                            {
                                filterLocalIdentifier: "parent",
                                over: {
                                    attributes: ["attribute/uri"],
                                },
                            },
                        ],
                        localIdentifier: "child",
                    },
                },
                {
                    dateFilter: {
                        granularity: "GDC.time.month",
                        type: "relative",
                        attribute: "testAttr",
                        from: "-10",
                        to: "0",
                    },
                },
            ],
        },
        meta: createObjectMeta("filterContext"),
    },
};

export const exportFilterContext: GdcFilterContext.IWrappedFilterContext = {
    filterContext: {
        content: {
            filters: [],
        },
        meta: createObjectMeta("exportFilterContext"),
    },
};

export const exportTempFilterContext: GdcFilterContext.IWrappedTempFilterContext = {
    tempFilterContext: {
        filters: [],
        created: "2020-05-05 00:00:00",
        uri: "/tempFilterContext",
    },
};

export const emptyDashboard: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [],
        },
        meta: createObjectMeta("emptyDashboard"),
    },
};
export const emptyDashboardDependencies: BearDashboardDependency[] = [];

export const dashboardWithFilterContext: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [],
            filterContext: filterContext.filterContext.meta.uri,
        },
        meta: createObjectMeta("dashboardWithFilterContext"),
    },
};
export const dashboardWithFilterContextDependencies: BearDashboardDependency[] = [filterContext];

export const dashboardWithExportFilterContextDependencies: BearDashboardDependency[] = [
    filterContext,
    exportFilterContext,
];

export const dashboardWithExportTempFilterContextDependencies: BearDashboardDependency[] = [
    filterContext,
    exportTempFilterContext,
];

const visualizationClassHeadline: GdcVisualizationClass.IVisualizationClassWrapped = {
    visualizationClass: {
        content: {
            checksum: "local",
            icon: "local:headline",
            orderIndex: 6,
            iconSelected: "local:headline.selected",
            url: "local:headline",
        },
        meta: {
            flags: ["preloaded"],
            author: "gdc/account/profile/userId",
            uri: "/gdc/md/projectId/obj/headline",
            tags: "",
            created: "2018-02-12 17:21:02",
            identifier: "gdc.visualization.headline",
            deprecated: "0",
            summary: "",
            isProduction: 1,
            title: "Headline",
            category: "visualizationClass",
            updated: "2020-05-21 15:25:44",
            contributor: "gdc/account/profile/userId",
        },
    },
};

const visualizationClassBarChart: GdcVisualizationClass.IVisualizationClassWrapped = {
    visualizationClass: {
        content: {
            checksum: "local",
            icon: "local:bar",
            orderIndex: 2,
            iconSelected: "local:bar.selected",
            url: "local:bar",
        },
        meta: {
            flags: ["preloaded"],
            author: "gdc/account/profile/userId",
            uri: "/gdc/md/projectId/obj/barChart",
            tags: "",
            created: "2018-01-23 13:22:46",
            identifier: "gdc.visualization.bar",
            deprecated: "0",
            summary: "",
            isProduction: 1,
            title: "Bar chart",
            category: "visualizationClass",
            updated: "2020-05-21 15:25:44",
            contributor: "gdc/account/profile/userId",
        },
    },
};

export const visualizationClasses = [visualizationClassHeadline, visualizationClassBarChart];

export const visualizationHeadline: GdcVisualizationObject.IVisualization = {
    visualizationObject: {
        content: {
            buckets: [],
            visualizationClass: {
                uri: visualizationClassHeadline.visualizationClass.meta.uri!,
            },
        },
        meta: createObjectMeta("visualizationHeadline"),
    },
};

export const visualizationBarChart: GdcVisualizationObject.IVisualization = {
    visualizationObject: {
        content: {
            buckets: [],
            visualizationClass: {
                uri: visualizationClassBarChart.visualizationClass.meta.uri!,
            },
        },
        meta: createObjectMeta("visualizationBarChart"),
    },
};

export const visualizationWidgetHeadline: GdcVisualizationWidget.IWrappedVisualizationWidget = {
    visualizationWidget: {
        content: {
            ignoreDashboardFilters: [{ attributeFilterReference: { displayForm: "/gdc/md/displayForm" } }],
            visualization: visualizationHeadline.visualizationObject.meta.uri!,
            drills: [
                {
                    drillToDashboard: {
                        from: { drillFromMeasure: { localIdentifier: "m1" } },
                        target: "in-place",
                        toDashboard: "dashboardId",
                    },
                },
            ],
        },
        meta: createObjectMeta("visualizationWidgetHeadline"),
    },
};

export const visualizationWidgetBarChart: GdcVisualizationWidget.IWrappedVisualizationWidget = {
    visualizationWidget: {
        content: {
            ignoreDashboardFilters: [],
            visualization: visualizationBarChart.visualizationObject.meta.uri!,
            drills: [
                {
                    drillToVisualization: {
                        from: { drillFromMeasure: { localIdentifier: "m1" } },
                        target: "pop-up",
                        toVisualization: {
                            uri: "/targetVisualization",
                        },
                    },
                },
            ],
        },
        meta: createObjectMeta("visualizationWidgetBarChart"),
    },
};

export const kpiWidget: GdcKpi.IWrappedKPI = {
    kpi: {
        content: {
            ignoreDashboardFilters: [],
            comparisonDirection: "growIsGood",
            comparisonType: "previousPeriod",
            metric: "/measure",
            drillTo: {
                projectDashboard: "test",
                projectDashboardTab: "testTab",
            },
        },
        meta: createObjectMeta("kpiWidget"),
    },
};

export const dashboardWithoutLayout: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [
                visualizationWidgetBarChart.visualizationWidget.meta.uri!,
                kpiWidget.kpi.meta.uri!,
                visualizationWidgetHeadline.visualizationWidget.meta.uri!,
            ],
        },
        meta: createObjectMeta("dashboardWithFilterContext"),
    },
};
export const dashboardWithoutLayoutDependencies: BearDashboardDependency[] = [
    visualizationWidgetBarChart,
    visualizationBarChart,
    visualizationWidgetHeadline,
    visualizationHeadline,
    kpiWidget,
];

export const dashboardWithLayout: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [
                visualizationWidgetBarChart.visualizationWidget.meta.uri!,
                kpiWidget.kpi.meta.uri!,
                visualizationWidgetHeadline.visualizationWidget.meta.uri!,
            ],
            layout: {
                fluidLayout: {
                    rows: [
                        {
                            columns: [
                                {
                                    size: {
                                        xl: {
                                            width: 12,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: visualizationWidgetHeadline.visualizationWidget.meta
                                                    .uri!,
                                            },
                                        },
                                    },
                                },
                                {
                                    size: {
                                        xl: {
                                            width: 6,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: visualizationWidgetBarChart.visualizationWidget.meta
                                                    .uri!,
                                            },
                                        },
                                    },
                                },
                                {
                                    size: {
                                        xl: {
                                            width: 2,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: kpiWidget.kpi.meta.uri!,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        meta: createObjectMeta("dashboardWithFilterContext"),
    },
};

export const dashboardWithLayoutAndCustomGridHeight: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [
                visualizationWidgetBarChart.visualizationWidget.meta.uri!,
                kpiWidget.kpi.meta.uri!,
                visualizationWidgetHeadline.visualizationWidget.meta.uri!,
            ],
            layout: {
                fluidLayout: {
                    rows: [
                        {
                            columns: [
                                {
                                    size: {
                                        xl: {
                                            width: 12,
                                            height: 12,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: visualizationWidgetHeadline.visualizationWidget.meta
                                                    .uri!,
                                            },
                                        },
                                    },
                                },
                                {
                                    size: {
                                        xl: {
                                            width: 6,
                                            height: 6,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: visualizationWidgetBarChart.visualizationWidget.meta
                                                    .uri!,
                                            },
                                        },
                                    },
                                },
                                {
                                    size: {
                                        xl: {
                                            width: 2,
                                            height: 6,
                                        },
                                    },
                                    content: {
                                        widget: {
                                            qualifier: {
                                                uri: kpiWidget.kpi.meta.uri!,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        meta: createObjectMeta("dashboardWithFilterContext"),
    },
};

export const dashboardWithLayoutDependencies: BearDashboardDependency[] = [
    visualizationWidgetBarChart,
    visualizationBarChart,
    visualizationWidgetHeadline,
    visualizationHeadline,
    kpiWidget,
];

export const dashboardWithExtendedDateFilterConfig: GdcDashboard.IWrappedAnalyticalDashboard = {
    analyticalDashboard: {
        content: {
            widgets: [],
            dateFilterConfig: {
                filterName: "Filter",
                mode: "active",
                hideGranularities: ["GDC.time.month"],
            },
        },
        meta: createObjectMeta("dashboardWithExtendedDateFilterConfig"),
    },
};
