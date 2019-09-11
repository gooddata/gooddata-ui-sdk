// (C) 2007-2018 GoodData Corporation
import compact from "lodash/compact";
import get from "lodash/get";
import { ExecuteAFM } from "@gooddata/typings";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import {
    IArithmeticMeasureDefinition,
    IMeasure,
    IMeasureDefinition,
    IMeasureDefinitionType,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isMeasureDefinition,
    isPoPMeasure,
    isArithmeticMeasure,
    isPreviousPeriodMeasure,
} from "@gooddata/sdk-model";

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
    } else if (isPoPMeasure(definition)) {
        return convertPopMeasureDefinition(definition);
    } else if (isPreviousPeriodMeasure(definition)) {
        return convertPreviousPeriodMeasureDefinition(definition);
    } else if (isArithmeticMeasure(definition)) {
        return convertArithmeticMeasureDefinition(definition);
    } else {
        throw Error("The measure definition is not supported: " + JSON.stringify(definition));
    }
}

function convertSimpleMeasureDefinition(definition: IMeasureDefinition): ExecuteAFM.ISimpleMeasureDefinition {
    const { measureDefinition } = definition;

    const filters: ExecuteAFM.FilterItem[] = measureDefinition.filters
        ? compact(measureDefinition.filters.map(convertVisualizationObjectFilter))
        : [];
    const filtersProp = filters.length ? { filters } : {};

    const aggregation = measureDefinition.aggregation;
    const aggregationProp = aggregation ? { aggregation } : {};

    const computeRatio = measureDefinition.computeRatio;
    const computeRatioProp = computeRatio ? { computeRatio } : {};

    return {
        measure: {
            item: measureDefinition.item,
            ...filtersProp,
            ...aggregationProp,
            ...computeRatioProp,
        },
    };
}

function convertPopMeasureDefinition(definition: IPoPMeasureDefinition): ExecuteAFM.IPopMeasureDefinition {
    const { popMeasureDefinition } = definition;
    return {
        popMeasure: {
            measureIdentifier: popMeasureDefinition.measureIdentifier,
            popAttribute: popMeasureDefinition.popAttribute,
        },
    };
}

function convertPreviousPeriodMeasureDefinition(
    definition: IPreviousPeriodMeasureDefinition,
): ExecuteAFM.IPreviousPeriodMeasureDefinition {
    const { previousPeriodMeasure } = definition;
    return {
        previousPeriodMeasure: {
            measureIdentifier: previousPeriodMeasure.measureIdentifier,
            dateDataSets: previousPeriodMeasure.dateDataSets.map(dateDataSet => ({
                dataSet: dateDataSet.dataSet,
                periodsAgo: dateDataSet.periodsAgo,
            })),
        },
    };
}

function convertArithmeticMeasureDefinition(
    definition: IArithmeticMeasureDefinition,
): ExecuteAFM.IArithmeticMeasureDefinition {
    const { arithmeticMeasure } = definition;
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.slice(),
            operator: arithmeticMeasure.operator,
        },
    };
}

function getFormat(measure: IMeasure): string | undefined {
    const {
        measure: { definition },
    } = measure;
    const measureFormat = get(measure.measure, "format");

    if (isArithmeticMeasure(definition)) {
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
