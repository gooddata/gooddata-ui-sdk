// (C) 2007-2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { Granularities } from "../../constants/granularities";

export const relativeDateFilter: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            identifier: "date filter",
        },
        from: 0,
        to: 0,
        granularity: Granularities.MONTH,
    },
};

export const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            identifier: "date filter",
        },
        from: "from",
        to: "to",
    },
};

export const positiveAttributeFilter: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            identifier: "positive filter",
        },
        in: ["uri1", "uri2"],
    },
};

export const positiveAttributeFilterEmpty: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            identifier: "empty positive filter",
        },
        in: [],
    },
};

export const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            identifier: "negative filter",
        },
        notIn: ["uri1", "uri2"],
    },
};

export const negativeAttributeFilterEmpty: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            identifier: "empty negative filter",
        },
        notIn: [],
    },
};

export const afm: AFM.IAfm = {
    filters: [
        {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: "filter",
                },
                in: ["1", "2", "3"],
            },
        },
    ],
};

export const afmEmptyFilters: AFM.IAfm = {
    filters: [],
};
