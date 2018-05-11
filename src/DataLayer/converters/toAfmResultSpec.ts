// (C) 2007-2018 GoodData Corporation
import compact = require('lodash/compact');
import flatMap = require('lodash/flatMap');
import get = require('lodash/get');
import { AFM, VisualizationObject } from '@gooddata/typings';

function convertAttribute(attribute: VisualizationObject.IVisualizationAttribute, idx: number): AFM.IAttribute {
    const alias = attribute.visualizationAttribute.alias;
    const aliasProp = alias ? { alias } : {};
    return {
        displayForm: attribute.visualizationAttribute.displayForm,
        localIdentifier: attribute.visualizationAttribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp
    };
}

function convertAFM(visualizationObject: VisualizationObject.IVisualizationObjectContent)
    : AFM.IAfm {

    const attributes: AFM.IAttribute[] = getAttributes(visualizationObject.buckets).map(convertAttribute);
    const attrProp = attributes.length ? { attributes } : {};

    const measures: AFM.IMeasure[] = getMeasures(visualizationObject.buckets)
        .map(convertMeasure);
    const measuresProp = measures.length ? { measures } : {};

    const filters: AFM.CompatibilityFilter[] = visualizationObject.filters
        ? compact(visualizationObject.filters.map(convertVisualizationObjectFilter))
        : [];
    const filtersProp = filters.length ? { filters } : {};

    const nativeTotals = convertNativeTotals(visualizationObject);
    const nativeTotalsProp = nativeTotals.length ? { nativeTotals } : {};

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
        ...nativeTotalsProp
    };
}

function convertMeasure(measure: VisualizationObject.IMeasure): AFM.IMeasure {
    let convertedDefinition;
    let alias;
    let formatProp = {};

    if (VisualizationObject.isMeasureDefinition(measure.measure.definition)) {
        const measureDefinition = measure.measure.definition.measureDefinition;

        const filters: AFM.FilterItem[] = measureDefinition.filters
            ? compact(measureDefinition.filters.map(convertVisualizationObjectFilter)) : [];
        const filtersProp = filters.length ? { filters } : {};

        const aggregation = measureDefinition.aggregation;
        const aggregationProp = aggregation ? { aggregation } : {};

        const computeRatio = measureDefinition.computeRatio;
        const computeRatioProp = computeRatio ? { computeRatio } : {};

        alias = measure.measure.alias ? measure.measure.alias : measure.measure.title;

        // should we prefer format defined on measure? If so, fix computeRatio format in AD
        formatProp = computeRatio
            ? { format: '#,##0.00%' }
            : (aggregation === 'count' ? { format: '#,##0' } : {});

        convertedDefinition = {
            measure: {
                item: measureDefinition.item,
                ...filtersProp,
                ...aggregationProp,
                ...computeRatioProp
            }
        };
    } else {
        const popDefinition = measure.measure.definition.popMeasureDefinition;
        alias = `${measure.measure.alias ? measure.measure.alias : measure.measure.title}`;

        convertedDefinition = {
            popMeasure: {
                measureIdentifier: popDefinition.measureIdentifier,
                popAttribute: popDefinition.popAttribute
            }
        };
    }

    const aliasProp = alias ? { alias } : {};

    return {
        localIdentifier: measure.measure.localIdentifier,
        definition: convertedDefinition,
        ...aliasProp,
        ...formatProp
    };
}

function convertVisualizationObjectFilter(
    filter: VisualizationObject.VisualizationObjectFilter
): AFM.FilterItem | null {
    if (VisualizationObject.isAttributeFilter(filter)) {
        if (!VisualizationObject.isPositiveAttributeFilter(filter)) {
            if (!filter.negativeAttributeFilter.notIn.length) {
                return null;
            }
        }

        return filter;
    }

    if (VisualizationObject.isAbsoluteDateFilter(filter)) {
        const absoluteDateFilter = filter.absoluteDateFilter;

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

    const relativeDateFilter = filter.relativeDateFilter;

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

function getMeasures(buckets: VisualizationObject.IBucket[]): VisualizationObject.IMeasure[] {
    return buckets.reduce((result: VisualizationObject.IMeasure[], bucket: VisualizationObject.IBucket) => {
        const measureItems: VisualizationObject.IMeasure[] = bucket.items.filter(VisualizationObject.isMeasure);

        return result.concat(measureItems);
    }, []);
}

function convertNativeTotals(visObj: VisualizationObject.IVisualizationObjectContent): AFM.INativeTotalItem[] {

    const nativeTotals = flatMap(visObj.buckets, (bucket => bucket.totals || [])).filter(total => total.type === 'nat');

    return nativeTotals.map(total => ({
        measureIdentifier: total.measureIdentifier,
        attributeIdentifiers: []
    }));
}

function getAttributes(buckets: VisualizationObject.IBucket[]): VisualizationObject.IVisualizationAttribute[] {
    return buckets.reduce(
        (result: VisualizationObject.IVisualizationAttribute[], bucket: VisualizationObject.IBucket) => {
            const items: VisualizationObject.IVisualizationAttribute[] =
                bucket.items.filter(VisualizationObject.isAttribute);

            return result.concat(items);
    }, []);
}

function convertSorting(visObj: VisualizationObject.IVisualizationObjectContent): AFM.SortItem[] {
    if (visObj.properties) {
        let properties = {};
        try {
            properties = JSON.parse(visObj.properties);
        } catch {
            // tslint:disable-next-line:no-console
            console.error('Properties contains invalid JSON string.');
        }

        const sorts: AFM.SortItem[] = get(properties, 'sortItems', []);
        return sorts ? sorts : [];
    }

    return [];
}

function convertResultSpec(
    visObj: VisualizationObject.IVisualizationObjectContent
): AFM.IResultSpec {
    const sorts = convertSorting(visObj);
    // Workaround because we can handle only 1 sort item for now
    const sortsProp = sorts.length ? { sorts: sorts.slice(0, 1) } : {};

    return {
        ...sortsProp
    };
}

export interface IConvertedAFM {
    afm: AFM.IAfm;
    resultSpec: AFM.IResultSpec;
}

/**
 * Converts visualizationObject to afm and resultSpec
 *
 * @method toAfmResultSpec
 * @param {VisualizationObject.IVisualizationObjectContent} visObj
 * @returns {IConvertedAFM}
 */
export function toAfmResultSpec(visObj: VisualizationObject.IVisualizationObjectContent): IConvertedAFM {
    const afm = convertAFM(visObj);
    return {
        afm,
        resultSpec: convertResultSpec(visObj)
    };
}
