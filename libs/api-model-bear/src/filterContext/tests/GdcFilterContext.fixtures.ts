// (C) 2019 GoodData Corporation
import { IAttributeFilter, IDateFilter } from "../GdcFilterContext.js";

export const attributeFilter: IAttributeFilter = {
    attributeFilter: {
        displayForm: "/uri/attr",
        negativeSelection: true,
        attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
    },
};
export const dateFilter: IDateFilter = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.date",
    },
};
