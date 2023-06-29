// (C) 2007-2022 GoodData Corporation
import {
    ArithmeticMeasureDefinition,
    ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum,
    FilterDefinitionForSimpleMeasure,
    MeasureDefinition,
    MeasureItem,
    PopDatasetMeasureDefinition,
    InlineMeasureDefinition,
    PopDateMeasureDefinition,
    SimpleMeasureDefinition,
    SimpleMeasureDefinitionMeasureAggregationEnum,
} from "@gooddata/api-client-tiger";
import {
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IMeasure,
    IMeasureDefinition,
    IMeasureDefinitionType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IInlineMeasureDefinition,
    isArithmeticMeasureDefinition,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isInlineMeasureDefinition,
    MeasureAggregation,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import { InvariantError } from "ts-invariant";
import {
    toDateDataSetQualifier,
    toFactQualifier,
    toLocalIdentifier,
    toAttributeQualifier,
} from "../ObjRefConverter.js";
import { convertFilter } from "./FilterConverter.js";

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
        return SimpleMeasureDefinitionMeasureAggregationEnum.SUM;
    }
    if (aggregation === "avg") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.AVG;
    }
    if (aggregation === "count") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.COUNT;
    }
    if (aggregation === "approximate_count") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.APPROXIMATE_COUNT;
    }
    if (aggregation === "max") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.MAX;
    }
    if (aggregation === "median") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.MEDIAN;
    }
    if (aggregation === "min") {
        return SimpleMeasureDefinitionMeasureAggregationEnum.MIN;
    }

    return SimpleMeasureDefinitionMeasureAggregationEnum.RUNSUM;
}

function convertSimpleMeasureDefinition(definition: IMeasureDefinition): SimpleMeasureDefinition {
    const { measureDefinition } = definition;

    const filters: FilterDefinitionForSimpleMeasure[] = measureDefinition.filters
        ? (compact(measureDefinition.filters.map(convertFilter)) as FilterDefinitionForSimpleMeasure[]) // measureDefinition.filters is IMeasureFilter, it contains only date and attribute filter, equally result contains this subset, it corresponds to type FilterDefinitionForSimpleMeasure
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

function convertPopMeasureDefinition(definition: IPoPMeasureDefinition): PopDateMeasureDefinition {
    const { popMeasureDefinition } = definition;
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

function convertPreviousPeriodMeasureDefinition(
    definition: IPreviousPeriodMeasureDefinition,
): PopDatasetMeasureDefinition {
    const { previousPeriodMeasure } = definition;

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
            return ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.SUM;
        case "difference":
            return ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.DIFFERENCE;
        case "multiplication":
            return ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.MULTIPLICATION;
        case "ratio":
            return ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.RATIO;
        case "change":
            return ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.CHANGE;
        default:
            throw new InvariantError(`Unknown arithmetic measure operator "${operator}"`);
    }
}

function convertArithmeticMeasureDefinition(
    definition: IArithmeticMeasureDefinition,
): ArithmeticMeasureDefinition {
    const { arithmeticMeasure } = definition;
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.map(toLocalIdentifier),
            operator: convertArithmeticMeasureOperator(arithmeticMeasure.operator),
        },
    };
}

function convertInlineMeasureDefinition(definition: IInlineMeasureDefinition): InlineMeasureDefinition {
    const { inlineDefinition } = definition;

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

function getPredefinedFormat(definition: IMeasureDefinition): string | null {
    const { measureDefinition } = definition;
    // should we prefer format defined on measure? If so, fix computeRatio format in AD
    return measureDefinition.computeRatio
        ? "#,##0.00%"
        : measureDefinition.aggregation === "count"
        ? "#,##0"
        : null;
}
