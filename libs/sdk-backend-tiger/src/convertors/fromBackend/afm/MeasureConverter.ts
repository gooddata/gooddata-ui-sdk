// (C) 2024 GoodData Corporation

import {
    IMeasure,
    objRefToString,
    isSimpleMeasureFilter,
    ArithmeticMeasureOperator,
    MeasureAggregation,
} from "@gooddata/sdk-model";
import {
    MeasureItem,
    ArithmeticMeasureDefinition,
    InlineMeasureDefinition,
    SimpleMeasureDefinition,
    PopDatasetMeasureDefinition,
    PopDateMeasureDefinition,
} from "@gooddata/api-client-tiger";
import { toObjRef } from "../ObjRefConverter.js";
import { convertFilter } from "./FilterConverter.js";

const isArithmeticMeasureDefinition = (definition: unknown): definition is ArithmeticMeasureDefinition => {
    return (definition as ArithmeticMeasureDefinition).arithmeticMeasure !== undefined;
};

const isInlineMeasureDefinition = (definition: unknown): definition is InlineMeasureDefinition => {
    return (definition as InlineMeasureDefinition).inline !== undefined;
};

const isPopDatasetMeasureDefinition = (definition: unknown): definition is PopDatasetMeasureDefinition => {
    return (definition as PopDatasetMeasureDefinition).previousPeriodMeasure !== undefined;
};

const isPopDateMeasureDefinition = (definition: unknown): definition is PopDateMeasureDefinition => {
    return (definition as PopDateMeasureDefinition).overPeriodMeasure !== undefined;
};

const isSimpleMeasureDefinition = (definition: unknown): definition is SimpleMeasureDefinition => {
    return (definition as SimpleMeasureDefinition).measure !== undefined;
};

export const convertMeasure = (measure: MeasureItem): IMeasure => {
    const { definition } = measure;
    if (isArithmeticMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers:
                            definition.arithmeticMeasure.measureIdentifiers.map(objRefToString),
                        operator:
                            definition.arithmeticMeasure.operator.toLowerCase() as ArithmeticMeasureOperator,
                    },
                },
            },
        };
    } else if (isInlineMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    inlineDefinition: {
                        maql: definition.inline.maql,
                    },
                },
            },
        };
    } else if (isPopDatasetMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: objRefToString(definition.previousPeriodMeasure.measureIdentifier),
                        popAttribute: toObjRef(definition.previousPeriodMeasure.dateDatasets[0].dataset),
                    },
                },
            },
        };
    } else if (isPopDateMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    previousPeriodMeasure: {
                        measureIdentifier: objRefToString(definition.overPeriodMeasure.measureIdentifier),
                        dateDataSets: definition.overPeriodMeasure.dateAttributes.map((attr) => ({
                            dataSet: toObjRef(attr.attribute),
                            periodsAgo: attr.periodsAgo,
                        })),
                    },
                },
            },
        };
    } else if (isSimpleMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    measureDefinition: {
                        item: toObjRef(definition.measure.item),
                        aggregation: definition.measure.aggregation?.toLowerCase() as MeasureAggregation,
                        filters: definition.measure.filters?.map(convertFilter).filter(isSimpleMeasureFilter),
                        computeRatio: definition.measure.computeRatio,
                    },
                },
            },
        };
    } else {
        throw new Error(`Unknown Tiger measure type`);
    }
};
