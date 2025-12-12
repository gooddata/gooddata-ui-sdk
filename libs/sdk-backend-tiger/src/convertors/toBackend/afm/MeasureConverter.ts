// (C) 2007-2025 GoodData Corporation

import { compact } from "lodash-es";
import { InvariantError } from "ts-invariant";

import {
    type ArithmeticMeasureDefinition,
    type ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum,
    type FilterDefinitionForSimpleMeasure,
    type InlineMeasureDefinition,
    type MeasureDefinition,
    type MeasureItem,
    type PopDatasetMeasureDefinition,
    type PopDateMeasureDefinition,
    type SimpleMeasureDefinition,
    type SimpleMeasureDefinitionMeasureAggregationEnum,
} from "@gooddata/api-client-tiger";
import {
    type ArithmeticMeasureOperator,
    type IArithmeticMeasureDefinition,
    type IInlineMeasureDefinition,
    type IMeasure,
    type IMeasureDefinition,
    type IMeasureDefinitionType,
    type IPoPMeasureDefinition,
    type IPreviousPeriodMeasureDefinition,
    type MeasureAggregation,
    isArithmeticMeasureDefinition,
    isInlineMeasureDefinition,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
} from "@gooddata/sdk-model";

import { convertFilter } from "./FilterConverter.js";
import {
    toAttributeQualifier,
    toDateDataSetQualifier,
    toFactQualifier,
    toLocalIdentifier,
} from "../ObjRefConverter.js";

export function convertMeasure(measure: IMeasure): MeasureItem {
    const {
        measure: { definition },
    } = measure;

    const convertedDefinition = convertMeasureDefinition(definition);

    const format = getFormat(measure);
    const formatProp = format ? { format } : {};

    const alias = measure.measure.alias ? measure.measure.alias : measure.measure.title;
    const aliasProp = alias ? { alias } : {};

    return {
        localIdentifier: measure.measure.localIdentifier,
        definition: convertedDefinition,
        ...aliasProp,
        ...formatProp,
    };
}

function convertMeasureDefinition(definition: IMeasureDefinitionType): MeasureDefinition {
    if (isMeasureDefinition(definition)) {
        return convertSimpleMeasureDefinition(definition);
    } else if (isPoPMeasureDefinition(definition)) {
        return convertPopMeasureDefinition(definition);
    } else if (isPreviousPeriodMeasureDefinition(definition)) {
        return convertPreviousPeriodMeasureDefinition(definition);
    } else if (isArithmeticMeasureDefinition(definition)) {
        return convertArithmeticMeasureDefinition(definition);
    } else if (isInlineMeasureDefinition(definition)) {
        return convertInlineMeasureDefinition(definition);
    } else {
        throw Error("The measure definition is not supported: " + JSON.stringify(definition));
    }
}

function convertAggregation(
    aggregation?: MeasureAggregation,
): SimpleMeasureDefinitionMeasureAggregationEnum | undefined {
    if (!aggregation) {
        return undefined;
    }
    if (aggregation === "sum") {
        return "SUM";
    }
    if (aggregation === "avg") {
        return "AVG";
    }
    if (aggregation === "count") {
        return "COUNT";
    }
    if (aggregation === "approximate_count") {
        return "APPROXIMATE_COUNT";
    }
    if (aggregation === "max") {
        return "MAX";
    }
    if (aggregation === "median") {
        return "MEDIAN";
    }
    if (aggregation === "min") {
        return "MIN";
    }

    return "RUNSUM";
}

function convertSimpleMeasureDefinition({ measureDefinition }: IMeasureDefinition): SimpleMeasureDefinition {
    const filters: FilterDefinitionForSimpleMeasure[] = measureDefinition.filters
        ? (compact(
              measureDefinition.filters.map((filter) => convertFilter(filter)),
          ) as FilterDefinitionForSimpleMeasure[]) // measureDefinition.filters is IMeasureFilter, it contains only date and attribute filter, equally result contains this subset, it corresponds to type FilterDefinitionForSimpleMeasure
        : [];
    const filtersProp = filters.length ? { filters } : {};

    const aggregation = convertAggregation(measureDefinition.aggregation);
    const aggregationProp = aggregation ? { aggregation } : {};

    const computeRatio = measureDefinition.computeRatio;
    const computeRatioProp = computeRatio ? { computeRatio } : {};

    const measureRef = measureDefinition.item;

    return {
        measure: {
            item: toFactQualifier(measureRef),
            ...filtersProp,
            ...aggregationProp,
            ...computeRatioProp,
        },
    };
}

function convertPopMeasureDefinition({
    popMeasureDefinition,
}: IPoPMeasureDefinition): PopDateMeasureDefinition {
    const attributeRef = popMeasureDefinition.popAttribute;

    return {
        overPeriodMeasure: {
            measureIdentifier: toLocalIdentifier(popMeasureDefinition.measureIdentifier),
            dateAttributes: [
                {
                    attribute: toAttributeQualifier(attributeRef),
                    periodsAgo: 1,
                },
            ],
        },
    };
}

function convertPreviousPeriodMeasureDefinition({
    previousPeriodMeasure,
}: IPreviousPeriodMeasureDefinition): PopDatasetMeasureDefinition {
    return {
        previousPeriodMeasure: {
            measureIdentifier: toLocalIdentifier(previousPeriodMeasure.measureIdentifier),
            dateDatasets: previousPeriodMeasure.dateDataSets.map((dateDataSet) => {
                const datasetRef = dateDataSet.dataSet;

                return {
                    dataset: toDateDataSetQualifier(datasetRef),
                    periodsAgo: dateDataSet.periodsAgo,
                };
            }),
        },
    };
}

function convertArithmeticMeasureOperator(
    operator: ArithmeticMeasureOperator,
): ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum {
    switch (operator) {
        case "sum":
            return "SUM";
        case "difference":
            return "DIFFERENCE";
        case "multiplication":
            return "MULTIPLICATION";
        case "ratio":
            return "RATIO";
        case "change":
            return "CHANGE";
        default:
            throw new InvariantError(`Unknown arithmetic measure operator "${operator}"`);
    }
}

function convertArithmeticMeasureDefinition({
    arithmeticMeasure,
}: IArithmeticMeasureDefinition): ArithmeticMeasureDefinition {
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.map(toLocalIdentifier),
            operator: convertArithmeticMeasureOperator(arithmeticMeasure.operator),
        },
    };
}

function convertInlineMeasureDefinition({
    inlineDefinition,
}: IInlineMeasureDefinition): InlineMeasureDefinition {
    return {
        inline: {
            maql: inlineDefinition.maql,
        },
    };
}

function getFormat(measure: IMeasure): string | undefined {
    const {
        measure: { definition },
    } = measure;
    const measureFormat = measure.measure.format;

    if (isArithmeticMeasureDefinition(definition) && definition.arithmeticMeasure.operator === "change") {
        return "#,##0.00%";
    }

    const predefinedFormat = isMeasureDefinition(definition) ? getPredefinedFormat(definition) : undefined;

    return predefinedFormat || measureFormat;
}

function getPredefinedFormat({ measureDefinition }: IMeasureDefinition): string | null {
    // should we prefer format defined on measure? If so, fix computeRatio format in AD
    return measureDefinition.computeRatio
        ? "#,##0.00%"
        : measureDefinition.aggregation === "count"
          ? "#,##0"
          : null;
}
