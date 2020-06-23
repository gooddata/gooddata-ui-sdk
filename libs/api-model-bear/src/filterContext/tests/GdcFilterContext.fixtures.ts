// (C) 2019 GoodData Corporation
import { GdcFilterContext } from "../GdcFilterContext";

export const attributeFilter: GdcFilterContext.IAttributeFilter = {
    attributeFilter: {
        displayForm: "/uri/attr",
        negativeSelection: true,
        attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
    },
};
export const dateFilter: GdcFilterContext.IDateFilter = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.date",
    },
};
