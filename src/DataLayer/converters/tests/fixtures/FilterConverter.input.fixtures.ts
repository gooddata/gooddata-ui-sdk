// (C) 2007-2019 GoodData Corporation

import { VisualizationObject } from "@gooddata/typings";
import { Granularities } from "../../../constants/granularities";

export const absoluteDateFilter: VisualizationObject.IVisualizationObjectAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "ds",
        },
        from: "2016-01-01",
        to: "2017-01-01",
    },
};

export const absoluteDateFilterWithIdentifier: VisualizationObject.IVisualizationObjectAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            identifier: "ds",
        },
        from: "2016-01-01",
        to: "2017-01-01",
    },
};

export const absoluteDateFilterWithoutRange: VisualizationObject.IVisualizationObjectAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "ds",
        },
    },
};

export const relativeDateFilter: VisualizationObject.IVisualizationObjectRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "ds",
        },
        granularity: Granularities.DATE,
        from: -10,
        to: 0,
    },
};

export const relativeDateFilterWithIdentifier: VisualizationObject.IVisualizationObjectRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            identifier: "ds",
        },
        granularity: Granularities.DATE,
        from: -10,
        to: 0,
    },
};

export const relativeDateFilterWithoutRange: VisualizationObject.IVisualizationObjectRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "ds",
        },
        granularity: Granularities.DATE,
    },
};

export const positiveAttrFilter: VisualizationObject.IVisualizationObjectPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "df",
        },
        in: ["a?id=1", "a?id=2"],
    },
};

export const negativeAttrFilter: VisualizationObject.IVisualizationObjectNegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "df",
        },
        notIn: ["a?id=1", "a?id=2"],
    },
};

export const negativeAttrFilterWithoutElements: VisualizationObject.IVisualizationObjectNegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "df",
        },
        notIn: [],
    },
};

export const comparisonMeasureValueFilter: VisualizationObject.IMeasureValueFilter = {
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

export const rangeMeasureValueFilter: VisualizationObject.IMeasureValueFilter = {
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
