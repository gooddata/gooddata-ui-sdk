// (C) 2019 GoodData Corporation
import {
    VisualizationObjectDateFilter,
    VisualizationObjectFilter,
    IVisualizationObjectArithmeticMeasureDefinition,
    IVisualizationObjectAttribute,
    IVisualizationObjectMeasure,
    VisualizationObjectMeasureDefinitionType,
    IVisualizationObjectMeasureValueFilter,
} from "../GdcVisualizationObject.js";

export const attribute: IVisualizationObjectAttribute = {
    visualizationAttribute: {
        localIdentifier: "m1",
        displayForm: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const simpleMeasure: IVisualizationObjectMeasure = {
    measure: {
        localIdentifier: "m1",
        definition: {
            measureDefinition: {
                item: {
                    uri: "/gdc/mock/measure",
                },
            },
        },
    },
};
export const simpleMeasureDefinition: VisualizationObjectMeasureDefinitionType = {
    measureDefinition: {
        item: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const arithmeticMeasureDefinition: IVisualizationObjectArithmeticMeasureDefinition = {
    arithmeticMeasure: {
        measureIdentifiers: ["/gdc/mock/measure"],
        operator: "sum",
    },
};
export const popMeasureDefinition: VisualizationObjectMeasureDefinitionType = {
    popMeasureDefinition: {
        measureIdentifier: "m1",
        popAttribute: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const previousPeriodMeasureDefinition: VisualizationObjectMeasureDefinitionType = {
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
export const positiveAttributeFilter: VisualizationObjectFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/attribute",
        },
        in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const negativeAttributeFilter: VisualizationObjectFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/date",
        },
        notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const relativeDateFilter: VisualizationObjectFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "/gdc/mock/date",
        },
        granularity: "GDC.time.year",
        from: -1,
        to: -1,
    },
};
export const absoluteDateFilter: VisualizationObjectDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/mock/date",
        },
        from: "2017-06-12",
        to: "2018-07-11",
    },
};
export const measureValueFilter: IVisualizationObjectMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            uri: "/gdc/mock/date",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 42,
            },
        },
    },
};
