// (C) 2019 GoodData Corporation
import { GdcVisualizationObject } from "../GdcVisualizationObject";
import IMeasure = GdcVisualizationObject.IMeasure;
import IAttribute = GdcVisualizationObject.IAttribute;
import DateFilter = GdcVisualizationObject.DateFilter;
import Filter = GdcVisualizationObject.Filter;
import IMeasureDefinitionType = GdcVisualizationObject.IMeasureDefinitionType;
import IArithmeticMeasureDefinition = GdcVisualizationObject.IArithmeticMeasureDefinition;
import IMeasureValueFilter = GdcVisualizationObject.IMeasureValueFilter;

export const attribute: IAttribute = {
    visualizationAttribute: {
        localIdentifier: "m1",
        displayForm: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const simpleMeasure: IMeasure = {
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
export const simpleMeasureDefinition: IMeasureDefinitionType = {
    measureDefinition: {
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
export const popMeasureDefinition: IMeasureDefinitionType = {
    popMeasureDefinition: {
        measureIdentifier: "m1",
        popAttribute: {
            uri: "/gdc/mock/measure",
        },
    },
};
export const previousPeriodMeasureDefinition: IMeasureDefinitionType = {
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
export const positiveAttributeFilter: Filter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/attribute",
        },
        in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const negativeAttributeFilter: Filter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "/gdc/mock/date",
        },
        notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
    },
};
export const relativeDateFilter: Filter = {
    relativeDateFilter: {
        dataSet: {
            uri: "/gdc/mock/date",
        },
        granularity: "GDC.time.year",
        from: -1,
        to: -1,
    },
};
export const absoluteDateFilter: DateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/mock/date",
        },
        from: "2017-06-12",
        to: "2018-07-11",
    },
};
export const measureValueFilter: IMeasureValueFilter = {
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
