// (C) 2019-2023 GoodData Corporation
import { IAttributeFilter, IDateFilter } from "../GdcFilterContext.js";

export const relativeDateFilter: IDateFilter = {
    dateFilter: {
        type: "relative",
        from: "-11",
        to: "0",
        granularity: "GDC.time.month",
    },
};

export const absoluteDateFilter: IDateFilter = {
    dateFilter: {
        type: "absolute",
        from: "2019-08-06",
        to: "2019-08-08",
        granularity: "GDC.time.month",
    },
};

export const attributeFilter: IAttributeFilter = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
    },
};

export const singleSelectionAttributeFilter: IAttributeFilter = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750"],
    },
};

export const dependentAttributeFilter: IAttributeFilter = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
        localIdentifier: "locId1",
        filterElementsBy: [
            {
                filterLocalIdentifier: "locId2",
                over: {
                    attributes: ["connectiong/attribute"],
                },
            },
        ],
    },
};

export const dateFilterWithUndefinedRange: IDateFilter = {
    dateFilter: {
        type: "relative",
        from: undefined,
        to: undefined,
        granularity: "GDC.time.month",
    },
};
