// (C) 2019-2020 GoodData Corporation
import {
    CompatibilityFilter,
    IArithmeticMeasureDefinition,
    IAttributeLocatorItem,
    IAttributeSortItem,
    ILocalIdentifierQualifier,
    IMeasureLocatorItem,
    IMeasureSortItem,
    IPopMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    ISimpleMeasureDefinition,
    ObjQualifier,
} from "../GdcExecuteAFM.js";

export const expressionFilter: CompatibilityFilter = {
    expression: {
        value: "MAQL",
    },
};

export const relativeDateFilter: CompatibilityFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "/gdc/mock/ds",
        },
        granularity: "gram",
        from: -10,
        to: 0,
    },
};
export const absoluteDateFilter: CompatibilityFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/mock/ds",
        },
        from: "1",
        to: "2",
    },
};
export const negativeAttributeFilter: CompatibilityFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/date",
        },
        notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const positiveAttributeFilter: CompatibilityFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/attribute",
        },
        in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const measureValueFilter: CompatibilityFilter = {
    measureValueFilter: {
        measure: {
            uri: "/gdc/mock/date",
        },
    },
};
export const rankingFilter: CompatibilityFilter = {
    rankingFilter: {
        measures: [{ localIdentifier: "m1" }],
        value: 5,
        operator: "TOP",
    },
};
export const identifierObjectQualifier: ObjQualifier = {
    identifier: "id",
};
export const uriObjectQualifier: ObjQualifier = {
    uri: "/gdc/mock/id",
};
export const localIdentifierQualifier: ILocalIdentifierQualifier = {
    localIdentifier: "localId",
};
export const simpleMeasureDefinition: ISimpleMeasureDefinition = {
    measure: {
        item: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const arithmeticMeasureDefinition: IArithmeticMeasureDefinition = {
    arithmeticMeasure: {
        measureIdentifiers: ["/gdc/mock/measure"],
        operator: "sum",
    },
};
export const popMeasureDefinition: IPopMeasureDefinition = {
    popMeasure: {
        measureIdentifier: "m1",
        popAttribute: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const previousPeriodMeasureDefinition: IPreviousPeriodMeasureDefinition = {
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
export const attributeSortItem: IAttributeSortItem = {
    attributeSortItem: {
        direction: "asc",
        attributeIdentifier: "a1",
    },
};
export const measureSortItem: IMeasureSortItem = {
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
export const attributeLocatorItem: IAttributeLocatorItem = {
    attributeLocatorItem: {
        attributeIdentifier: "a1",
        element: "element",
    },
};
export const measureLocatorItem: IMeasureLocatorItem = {
    measureLocatorItem: {
        measureIdentifier: "m1",
    },
};
