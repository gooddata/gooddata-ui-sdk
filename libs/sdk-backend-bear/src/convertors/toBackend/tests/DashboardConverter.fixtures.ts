// (C) 2019-2020 GoodData Corporation
import { IDashboard, IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-backend-spi";

const createObjectMeta = (id: string) => {
    const uri = `/gdc/md/obj/${id}`;
    return {
        uri,
        identifier: id,
        description: "",
        title: id,
        updated: "2020-05-05 10:10:10",
        created: "2020-05-05 00:00:00",
        ref: {
            uri,
        },
    };
};

export const dashboardFilterContext: IFilterContext = {
    ...createObjectMeta("filterContext"),
    filters: [
        {
            attributeFilter: {
                attributeElements: [{ identifier: "attrId", uri: "/gdc/md/attrId" }],
                displayForm: {
                    uri: "/gdc/md/displayForm",
                },
                negativeSelection: false,
            },
            dateFilter: {
                granularity: "GDC.time.month",
                type: "relative",
                from: -12,
                to: -2,
                attribute: {
                    uri: "/attrId",
                },
                dataSet: {
                    uri: "/dataSet",
                },
            },
        },
    ],
};

export const dashboardTempFilterContext: ITempFilterContext = {
    filters: [
        {
            attributeFilter: {
                attributeElements: [{ identifier: "attrId", uri: "/gdc/md/attrId" }],
                displayForm: {
                    uri: "/gdc/md/displayForm",
                },
                negativeSelection: false,
            },
            dateFilter: {
                granularity: "GDC.time.month",
                type: "relative",
                from: -12,
                to: -2,
                attribute: {
                    uri: "/attrId",
                },
                dataSet: {
                    uri: "/dataSet",
                },
            },
        },
    ],
    created: "2020-05-05 00:00:00",
    ref: {
        uri: "/tempFilterContext",
    },
    uri: "/tempFilterContext",
};

export const emptyDashboard: IDashboard = {
    ...createObjectMeta("emptyDashboard"),
    filterContext: undefined,
};

export const dashboardWithFilterContext: IDashboard = {
    ...createObjectMeta("dashboardWithFilterContext"),
    filterContext: dashboardFilterContext,
};

export const dashboardWithTempFilterContext: IDashboard = {
    ...createObjectMeta("dashboardWithTempFilterContext"),
    filterContext: dashboardTempFilterContext,
};

export const widgetHeadline: IWidget = {
    ...createObjectMeta("widgetHeadline"),
    ignoreDashboardFilters: [],
    insight: {
        uri: "/headline",
    },
    type: "insight",
    drills: [],
};

export const widgetBarChart: IWidget = {
    ...createObjectMeta("widgetBarChart"),
    ignoreDashboardFilters: [],
    insight: {
        uri: "/barChart",
    },
    type: "insight",
    drills: [],
};

export const widgetKpi: IWidget = {
    ...createObjectMeta("widgetKpi"),
    ignoreDashboardFilters: [],
    kpi: {
        comparisonDirection: "growIsGood",
        comparisonType: "lastYear",
        metric: {
            uri: "/measure",
        },
    },
    type: "kpi",
    drills: [],
};

export const dashboardWithLayout: IDashboard = {
    ...emptyDashboard,
    layout: {
        type: "fluidLayout",
        rows: [
            {
                columns: [
                    {
                        size: {
                            xl: {
                                widthAsGridColumnsCount: 12,
                            },
                        },
                        content: widgetHeadline,
                    },
                    {
                        size: {
                            xl: {
                                widthAsGridColumnsCount: 6,
                            },
                        },
                        content: widgetKpi,
                    },
                    {
                        size: {
                            xl: {
                                widthAsGridColumnsCount: 2,
                            },
                        },
                        content: widgetBarChart,
                    },
                ],
            },
        ],
    },
};

export const dashboardWithExtendedDateFilterConfig: IDashboard = {
    ...emptyDashboard,
    dateFilterConfig: {
        filterName: "Extended filter",
        mode: "readonly",
        hideGranularities: ["GDC.time.quarter"],
        addPresets: {
            relativePresets: [
                {
                    from: -6,
                    granularity: "GDC.time.month",
                    localIdentifier: "plus_minus_6_months",
                    to: 6,
                    type: "relativePreset",
                    visible: true,
                    name: "+/- 6 months",
                },
            ],
        },
    },
};
