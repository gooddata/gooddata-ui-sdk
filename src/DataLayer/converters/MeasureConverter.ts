// (C) 2007-2018 GoodData Corporation
import compact = require('lodash/compact');
import { AFM, VisualizationObject } from '@gooddata/typings';
import IMeasure = VisualizationObject.IMeasure;
import IMeasureDefinition = VisualizationObject.IMeasureDefinition;
import IPoPMeasureDefinition = VisualizationObject.IPoPMeasureDefinition;
import IPreviousPeriodMeasureDefinition = VisualizationObject.IPreviousPeriodMeasureDefinition;
import VisualizationObjectFilter = VisualizationObject.VisualizationObjectFilter;
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import VisualizationObjectAttributeFilter = VisualizationObject.VisualizationObjectAttributeFilter;
import IVisualizationObjectRelativeDateFilter = VisualizationObject.IVisualizationObjectRelativeDateFilter;
import IVisualizationObjectAbsoluteDateFilter = VisualizationObject.IVisualizationObjectAbsoluteDateFilter;

const MeasureConverter = {
    convertMeasure
};

export default MeasureConverter;

function convertMeasure(measure: IMeasure): AFM.IMeasure {
    const { measure: { definition } } = measure;

    const convertedDefinition = convertMeasureDefinition(definition);

    const format = convertMeasureDefinitionFormat(definition);
    const formatProp = format ? { format } : {};

    const alias = measure.measure.alias ? measure.measure.alias : measure.measure.title;
    const aliasProp = alias ? { alias } : {};

    return {
        localIdentifier: measure.measure.localIdentifier,
        definition: convertedDefinition,
        ...aliasProp,
        ...formatProp
    };
}

function convertMeasureDefinition(definition: IMeasureDefinitionType): AFM.MeasureDefinition {
    if (VisualizationObject.isMeasureDefinition(definition)) {
        return convertSimpleMeasureDefinition(definition);
    } else if (VisualizationObject.isPopMeasureDefinition(definition)) {
        return convertPopMeasureDefinition(definition);
    } else if (VisualizationObject.isPreviousPeriodMeasureDefinition(definition)) {
        return convertPreviousPeriodMeasureDefinition(definition);
    } else {
        throw Error('The measure definition is not supported: ' + JSON.stringify(definition));
    }
}

function convertSimpleMeasureDefinition(definition: IMeasureDefinition): AFM.ISimpleMeasureDefinition {
    const { measureDefinition } = definition;

    const filters: AFM.FilterItem[] = measureDefinition.filters
        ? compact(measureDefinition.filters.map(convertVisualizationObjectFilter)) : [];
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
            ...computeRatioProp
        }
    };
}

function convertVisualizationObjectFilter(filter: VisualizationObjectFilter): AFM.FilterItem | null {
    if (VisualizationObject.isAttributeFilter(filter)) {
        return convertAttributeFilter(filter);
    } else if (VisualizationObject.isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else {
        return convertRelativeDateFilter(filter);
    }
}

function convertAttributeFilter(filter: VisualizationObjectAttributeFilter): AFM.FilterItem | null {
    if (!VisualizationObject.isPositiveAttributeFilter(filter)) {
        if (!filter.negativeAttributeFilter.notIn.length) {
            return null;
        }
    }
    return filter;
}

function convertAbsoluteDateFilter(filter: IVisualizationObjectAbsoluteDateFilter): AFM.FilterItem | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    return {
        absoluteDateFilter: {
            dataSet: absoluteDateFilter.dataSet,
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to)
        }
    };
}

function convertRelativeDateFilter(filter: IVisualizationObjectRelativeDateFilter): AFM.FilterItem | null {
    const { relativeDateFilter } = filter;

    if (relativeDateFilter.from === undefined || !relativeDateFilter.to === undefined) {
        return null;
    }

    return {
        relativeDateFilter: {
            dataSet: relativeDateFilter.dataSet,
            granularity: relativeDateFilter.granularity,
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to)
        }
    };
}

function convertPopMeasureDefinition(definition: IPoPMeasureDefinition): AFM.IPopMeasureDefinition {
    const { popMeasureDefinition } = definition;
    return {
        popMeasure: {
            measureIdentifier: popMeasureDefinition.measureIdentifier,
            popAttribute: popMeasureDefinition.popAttribute
        }
    };
}

function convertPreviousPeriodMeasureDefinition(definition: IPreviousPeriodMeasureDefinition)
    : AFM.IPreviousPeriodMeasureDefinition {
    const { previousPeriodMeasure } = definition;
    return {
        previousPeriodMeasure: {
            measureIdentifier: previousPeriodMeasure.measureIdentifier,
            dateDataSets: previousPeriodMeasure.dateDataSets.map(dateDataSet => ({
                dataSet: dateDataSet.dataSet,
                periodsAgo: dateDataSet.periodsAgo
            }))
        }
    };
}

function convertMeasureDefinitionFormat(definition: IMeasureDefinitionType): string | null {
    if (VisualizationObject.isMeasureDefinition(definition)) {
        return convertSimpleMeasureDefinitionFormat(definition);
    }
    return null;
}

function convertSimpleMeasureDefinitionFormat(definition: IMeasureDefinition): string | null {
    const { measureDefinition } = definition;
    // should we prefer format defined on measure? If so, fix computeRatio format in AD
    return measureDefinition.computeRatio
        ? '#,##0.00%'
        : (measureDefinition.aggregation === 'count'
            ? '#,##0'
            : null);
}
