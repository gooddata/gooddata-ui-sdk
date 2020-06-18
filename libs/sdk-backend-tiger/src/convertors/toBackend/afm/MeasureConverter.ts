// (C) 2007-2020 GoodData Corporation
import {
    IArithmeticMeasureDefinition,
    IMeasure,
    IMeasureDefinition,
    IMeasureDefinitionType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isArithmeticMeasureDefinition,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    MeasureAggregation,
} from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/gd-tiger-client";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import {
    toDateDataSetQualifier,
    toFactQualifier,
    toDisplayFormQualifier,
    toLocalIdentifier,
} from "../ObjRefConverter";
import compact = require("lodash/compact");
import get = require("lodash/get");

export function convertMeasure(measure: IMeasure): ExecuteAFM.IMeasure {
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

function convertMeasureDefinition(definition: IMeasureDefinitionType): ExecuteAFM.MeasureDefinition {
    if (isMeasureDefinition(definition)) {
        return convertSimpleMeasureDefinition(definition);
    } else if (isPoPMeasureDefinition(definition)) {
        return convertPopMeasureDefinition(definition);
    } else if (isPreviousPeriodMeasureDefinition(definition)) {
        return convertPreviousPeriodMeasureDefinition(definition);
    } else if (isArithmeticMeasureDefinition(definition)) {
        return convertArithmeticMeasureDefinition(definition);
    } else {
        throw Error("The measure definition is not supported: " + JSON.stringify(definition));
    }
}

function convertAggregation(
    aggregation?: MeasureAggregation,
): ExecuteAFM.SimpleMeasureAggregation | undefined {
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

function convertSimpleMeasureDefinition(definition: IMeasureDefinition): ExecuteAFM.ISimpleMeasureDefinition {
    const { measureDefinition } = definition;

    const filters: ExecuteAFM.FilterItem[] = measureDefinition.filters
        ? compact(measureDefinition.filters.map(convertVisualizationObjectFilter))
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

function convertPopMeasureDefinition(
    definition: IPoPMeasureDefinition,
): ExecuteAFM.IOverPeriodMeasureDefinition {
    const { popMeasureDefinition } = definition;
    const attributeRef = popMeasureDefinition.popAttribute;

    return {
        overPeriodMeasure: {
            measureIdentifier: toLocalIdentifier(popMeasureDefinition.measureIdentifier),
            dateAttributes: [
                {
                    attribute: toDisplayFormQualifier(attributeRef),
                    periodsAgo: 1,
                },
            ],
        },
    };
}

function convertPreviousPeriodMeasureDefinition(
    definition: IPreviousPeriodMeasureDefinition,
): ExecuteAFM.IPreviousPeriodMeasureDefinition {
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

function convertArithmeticMeasureDefinition(
    definition: IArithmeticMeasureDefinition,
): ExecuteAFM.IArithmeticMeasureDefinition {
    const { arithmeticMeasure } = definition;
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.map(toLocalIdentifier),
            operator: arithmeticMeasure.operator,
        },
    };
}

function getFormat(measure: IMeasure): string | undefined {
    const {
        measure: { definition },
    } = measure;
    const measureFormat = get(measure.measure, "format");

    if (isArithmeticMeasureDefinition(definition)) {
        if (definition.arithmeticMeasure.operator === "change") {
            return "#,##0.00%";
        }
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
