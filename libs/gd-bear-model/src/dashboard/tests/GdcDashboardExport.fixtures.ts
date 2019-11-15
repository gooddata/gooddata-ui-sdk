// (C) 2019 GoodData Corporation
import { GdcDashboardExport } from "../GdcDashboardExport";

export const attributeFilter: GdcDashboardExport.IAttributeFilter = {
    attributeFilter: {
        displayForm: "/uri/attr",
        negativeSelection: true,
        attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
    },
};
export const dateFilter: GdcDashboardExport.IDateFilter = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.date",
    },
};
