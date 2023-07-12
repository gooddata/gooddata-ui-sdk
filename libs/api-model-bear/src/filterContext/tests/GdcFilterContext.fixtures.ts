// (C) 2019 GoodData Corporation
import { IFilterContextAttributeFilter, IFilterContextDateFilter } from "../GdcFilterContext.js";

export const attributeFilter: IFilterContextAttributeFilter = {
    attributeFilter: {
        displayForm: "/uri/attr",
        negativeSelection: true,
        attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
    },
};
export const dateFilter: IFilterContextDateFilter = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.date",
    },
};
