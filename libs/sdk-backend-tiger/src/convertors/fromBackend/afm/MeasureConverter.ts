// (C) 2024-2025 GoodData Corporation

import {
    type ArithmeticMeasureDefinition,
    type InlineMeasureDefinition,
    type MeasureItem,
    type PopDatasetMeasureDefinition,
    type PopDateMeasureDefinition,
    type SimpleMeasureDefinition,
} from "@gooddata/api-client-tiger";
import {
    type ArithmeticMeasureOperator,
    type IMeasure,
    type MeasureAggregation,
    isSimpleMeasureFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { convertFilter } from "./FilterConverter.js";
import { toObjRef } from "../ObjRefConverter.js";

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
                    previousPeriodMeasure: {
                        measureIdentifier: objRefToString(definition.previousPeriodMeasure.measureIdentifier),
                        dateDataSets: definition.previousPeriodMeasure.dateDatasets.map((attr) => ({
                            dataSet: toObjRef(attr.dataset),
                            periodsAgo: attr.periodsAgo,
                        })),
                    },
                },
            },
        };
    } else if (isPopDateMeasureDefinition(definition)) {
        return {
            measure: {
                localIdentifier: measure.localIdentifier,
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: objRefToString(definition.overPeriodMeasure.measureIdentifier),
                        popAttribute: toObjRef(definition.overPeriodMeasure.dateAttributes[0].attribute),
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
