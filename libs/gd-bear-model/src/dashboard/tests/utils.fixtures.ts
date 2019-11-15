// (C) 2019 GoodData Corporation
import { GdcDashboardExport } from "../GdcDashboardExport";

export const relativeDateFilter: GdcDashboardExport.FilterContextItem = {
    dateFilter: {
        type: "relative",
        from: -11,
        to: 0,
        granularity: "GDC.time.month",
    },
};

export const absoluteDateFilter: GdcDashboardExport.FilterContextItem = {
    dateFilter: {
        type: "absolute",
        from: "2019-08-06",
        to: "2019-08-08",
        granularity: "GDC.time.month",
    },
};

export const attributeFilter: GdcDashboardExport.FilterContextItem = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
    },
};

export const dateFilterWithUndefinedRange: GdcDashboardExport.FilterContextItem = {
    dateFilter: {
        type: "relative",
        from: undefined,
        to: undefined,
        granularity: "GDC.time.month",
    },
};
