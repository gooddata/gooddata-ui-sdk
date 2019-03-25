// (C) 2007-2018 GoodData Corporation
import compact = require('lodash/compact');
import get = require('lodash/get');
import { AFM, VisualizationObject } from '@gooddata/typings';
import IArithmeticMeasureDefinition = VisualizationObject.IArithmeticMeasureDefinition;
import IMeasure = VisualizationObject.IMeasure;
import IMeasureDefinition = VisualizationObject.IMeasureDefinition;
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;
import IPoPMeasureDefinition = VisualizationObject.IPoPMeasureDefinition;
import IPreviousPeriodMeasureDefinition = VisualizationObject.IPreviousPeriodMeasureDefinition;
import { convertVisualizationObjectFilter } from './FilterConverter';

const MeasureConverter = {
    convertMeasure,
    getFormat
};

export default MeasureConverter;

function convertMeasure(measure: IMeasure): AFM.IMeasure {
    const { measure: { definition } } = measure;

    const convertedDefinition = convertMeasureDefinition(definition);

    const format = getFormat(measure);
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
    } else if (VisualizationObject.isArithmeticMeasureDefinition(definition)) {
        return convertArithmeticMeasureDefinition(definition);
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

function convertArithmeticMeasureDefinition(definition: IArithmeticMeasureDefinition)
    : AFM.IArithmeticMeasureDefinition {
    const { arithmeticMeasure } = definition;
    return {
        arithmeticMeasure: {
            measureIdentifiers: arithmeticMeasure.measureIdentifiers.slice(),
            operator: arithmeticMeasure.operator
        }
    };
}

function getFormat(measure: IMeasure): string | undefined {
    const { measure: { definition } } = measure;
    const measureFormat = get(measure.measure, 'format');

    if (VisualizationObject.isArithmeticMeasureDefinition(definition)) {
        if (definition.arithmeticMeasure.operator === 'change') {
            return '#,##0.00%';
        }
    }

    const predefinedFormat = VisualizationObject.isMeasureDefinition(definition)
        ? getPredefinedFormat(definition)
        : undefined;

    return predefinedFormat || measureFormat;
}

function getPredefinedFormat(definition: IMeasureDefinition): string | null {
    const { measureDefinition } = definition;
    // should we prefer format defined on measure? If so, fix computeRatio format in AD
    return measureDefinition.computeRatio
        ? '#,##0.00%'
        : (measureDefinition.aggregation === 'count'
            ? '#,##0'
            : null);
}
