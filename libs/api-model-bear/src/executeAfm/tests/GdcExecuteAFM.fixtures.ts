// (C) 2019-2020 GoodData Corporation
import { GdcExecuteAFM as AFM } from "../GdcExecuteAFM";

export const expressionFilter: AFM.CompatibilityFilter = {
    expression: {
        value: "MAQL",
    },
};

export const relativeDateFilter: AFM.CompatibilityFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "/gdc/mock/ds",
        },
        granularity: "gram",
        from: -10,
        to: 0,
    },
};
export const absoluteDateFilter: AFM.CompatibilityFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/mock/ds",
        },
        from: "1",
        to: "2",
    },
};
export const negativeAttributeFilter: AFM.CompatibilityFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/date",
        },
        notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const positiveAttributeFilter: AFM.CompatibilityFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/attribute",
        },
        in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const measureValueFilter: AFM.CompatibilityFilter = {
    measureValueFilter: {
        measure: {
            uri: "/gdc/mock/date",
        },
    },
};
export const rankingFilter: AFM.CompatibilityFilter = {
    rankingFilter: {
        measures: [{ localIdentifier: "m1" }],
        value: 5,
        operator: "TOP",
    },
};
export const identifierObjectQualifier: AFM.ObjQualifier = {
    identifier: "id",
};
export const uriObjectQualifier: AFM.ObjQualifier = {
    uri: "/gdc/mock/id",
};
export const simpleMeasureDefinition: AFM.ISimpleMeasureDefinition = {
    measure: {
        item: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const arithmeticMeasureDefinition: AFM.IArithmeticMeasureDefinition = {
    arithmeticMeasure: {
        measureIdentifiers: ["/gdc/mock/measure"],
        operator: "sum",
    },
};
export const popMeasureDefinition: AFM.IPopMeasureDefinition = {
    popMeasure: {
        measureIdentifier: "m1",
        popAttribute: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const previousPeriodMeasureDefinition: AFM.IPreviousPeriodMeasureDefinition = {
    previousPeriodMeasure: {
        measureIdentifier: "m1",
        dateDataSets: [
            {
                dataSet: {
                    uri: "/gdc/mock/date",
                },
                periodsAgo: 1,
            },
        ],
    },
};
export const attributeSortItem: AFM.IAttributeSortItem = {
    attributeSortItem: {
        direction: "asc",
        attributeIdentifier: "a1",
    },
};
export const measureSortItem: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};
export const attributeLocatorItem: AFM.IAttributeLocatorItem = {
    attributeLocatorItem: {
        attributeIdentifier: "a1",
        element: "element",
    },
};
export const measureLocatorItem: AFM.IMeasureLocatorItem = {
    measureLocatorItem: {
        measureIdentifier: "m1",
    },
};
