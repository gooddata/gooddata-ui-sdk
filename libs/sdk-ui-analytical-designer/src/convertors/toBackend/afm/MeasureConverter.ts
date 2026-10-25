// (C) 2007-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type IArithmeticMeasureDefinition,
    type IMeasure,
    type IMeasureDefinition,
    type IMeasureDefinitionType,
    type IPoPMeasureDefinition,
    type IPreviousPeriodMeasureDefinition,
    type MeasureAggregation,
    isArithmeticMeasureDefinition,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
} from "@gooddata/sdk-model";

import {
    type MeasureAggregation as BearMeasureAggregation,
    type FilterItem,
    type IArithmeticMeasureDefinition as IBearArithmeticMeasureDefinition,
    type IMeasure as IBearMeasure,
    type IPopMeasureDefinition as IBearPopMeasureDefinition,
    type IPreviousPeriodMeasureDefinition as IBearPreviousPeriodMeasureDefinition,
    type ISimpleMeasureDefinition,
    type MeasureDefinition,
} from "../../../typings/bear/bearTypes.js";
import { toBearRef } from "../ObjRefConverter.js";

import { DEFAULT_INTEGER_FORMAT, DEFAULT_PERCENTAGE_FORMAT } from "./constants.js";
import { convertMeasureFilter } from "./FilterConverter.js";

export function convertMeasure(measure: IMeasure): IBearMeasure {
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

export function convertAggregation(aggregation?: MeasureAggregation): BearMeasureAggregation | undefined {
    if (aggregation === "approximate_count") {
        // Bear doesn't support approximate_count so transparently fallback to exact count.
        return "count";
    }
    return aggregation;
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
    } else {
        throw Error("The measure definition is not supported: " + JSON.stringify(definition));
    }
}

function convertSimpleMeasureDefinition({ measureDefinition }: IMeasureDefinition): ISimpleMeasureDefinition {
    const filters: FilterItem[] = measureDefinition.filters
        ? compact(measureDefinition.filters.map(convertMeasureFilter))
        : [];
    const filtersProp = filters.length ? { filters } : {};

    const aggregation = convertAggregation(measureDefinition.aggregation);
    const aggregationProp = aggregation ? { aggregation } : {};

    const computeRatio = measureDefinition.computeRatio;
    const computeRatioProp = computeRatio ? { computeRatio } : {};

    return {
        measure: {
            item: toBearRef(measureDefinition.item),
            ...filtersProp,
            ...aggregationProp,
            ...computeRatioProp,
        },
    };
}

function convertPopMeasureDefinition({
    popMeasureDefinition,
}: IPoPMeasureDefinition): IBearPopMeasureDefinition {
    return {
        popMeasure: {
            measureIdentifier: popMeasureDefinition.measureIdentifier,
            popAttribute: toBearRef(popMeasureDefinition.popAttribute),
        },
    };
}

function convertPreviousPeriodMeasureDefinition({
    previousPeriodMeasure,
}: IPreviousPeriodMeasureDefinition): IBearPreviousPeriodMeasureDefinition {
    return {
        previousPeriodMeasure: {
            measureIdentifier: previousPeriodMeasure.measureIdentifier,
            dateDataSets: previousPeriodMeasure.dateDataSets.map((dateDataSet) => ({
                dataSet: toBearRef(dateDataSet.dataSet),
                periodsAgo: dateDataSet.periodsAgo,
            })),
        },
    };
}

function convertArithmeticMeasureDefinition({
    arithmeticMeasure,
}: IArithmeticMeasureDefinition): IBearArithmeticMeasureDefinition {
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.slice(),
            operator: arithmeticMeasure.operator,
        },
    };
}

function getFormat({ measure: { definition, format } }: IMeasure): string | undefined {
    if (format) {
        return format;
    }

    const isArithmeticMeasureChange =
        isArithmeticMeasureDefinition(definition) && definition.arithmeticMeasure.operator === "change";

    if (isArithmeticMeasureChange) {
        return DEFAULT_PERCENTAGE_FORMAT;
    }

    if (isMeasureDefinition(definition)) {
        const { measureDefinition } = definition;
        if (measureDefinition.computeRatio) {
            return DEFAULT_PERCENTAGE_FORMAT;
        }
        if (measureDefinition.aggregation === "count") {
            return DEFAULT_INTEGER_FORMAT;
        }
    }

    return undefined;
}
