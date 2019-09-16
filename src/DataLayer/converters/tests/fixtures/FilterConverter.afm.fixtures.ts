// (C) 2007-2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { Granularities } from "../../../constants/granularities";

export const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "ds",
        },
        from: "2016-01-01",
        to: "2017-01-01",
    },
};

export const absoluteDateFilterWithIdentifier: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            identifier: "ds",
        },
        from: "2016-01-01",
        to: "2017-01-01",
    },
};

export const relativeDateFilter: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "ds",
        },
        granularity: Granularities.DATE,
        from: -10,
        to: 0,
    },
};

export const relativeDateFilterWithIdentifier: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            identifier: "ds",
        },
        granularity: Granularities.DATE,
        from: -10,
        to: 0,
    },
};

export const positiveAttrFilter: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "df",
        },
        in: ["a?id=1", "a?id=2"],
    },
};

export const negativeAttrFilter: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "df",
        },
        notIn: ["a?id=1", "a?id=2"],
    },
};

export const comparisonMeasureValueFilter: AFM.IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 50,
            },
        },
    },
};

export const rangeMeasureValueFilter: AFM.IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            range: {
                operator: "BETWEEN",
                from: 10,
                to: 100,
            },
        },
    },
};
