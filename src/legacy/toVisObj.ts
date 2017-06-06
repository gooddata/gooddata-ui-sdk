import partial = require('lodash/partial');
import { AdapterUtils, Afm, Transformation, Uri } from '@gooddata/data-layer';

import * as VisObj from './model/VisualizationObject';
import { IHeader } from '../interfaces/Header';

function convertMeasureFilter(): VisObj.IEmbeddedListAttributeFilter {
    return {
        listAttributeFilter: {
            attribute: 'attribute',
            displayForm: 'displayForm',
            default: {
                negativeSelection: false,
                attributeElements: []
            }
        }
    };
}

function getLookupId(measure: Afm.IMeasure): string {
    return (measure.definition.baseObject as Afm.ILookupObject).lookupId;
}

const EmptyMeasure: Afm.IMeasure = {
    id: '___not_found___',
    definition: {
        baseObject: {
            id: '___not_found___'
        }
    }
};

function getMeasureTitle(transformation: Transformation.ITransformation, measure: Afm.IMeasure): string {
    const id = getLookupId(measure) || measure.id;

    const { title } = AdapterUtils.getMeasureAdditionalInfo(transformation, id);

    return title || measure.id;
}

function getAttributeSorting(
    transformation: Transformation.ITransformation,
    attribute: Afm.IAttribute
): { sort: VisObj.SortDirection } {
    const sorting = AdapterUtils.getSorting(transformation).find((s) => s.column === attribute.id);

    if (!sorting) {
        return null;
    }

    return { sort: (sorting.direction as VisObj.SortDirection) };
}

function getMeasureSorting(
    transformation: Transformation.ITransformation,
    measure: Afm.IMeasure
): { sort: VisObj.IMeasureSort } {
    const sorting = AdapterUtils.getSorting(transformation)
        .find((s) => (s.column === getLookupId(measure) || s.column === measure.id));

    if (!sorting) {
        return null;
    }

    return {
        sort: {
            direction: (sorting.direction as VisObj.SortDirection),
            sortByPoP: getLookupId(measure) && sorting.column !== getLookupId(measure) || false
        }
    };
}

function getMeasureFormat(transformation: Transformation.ITransformation, measure: Afm.IMeasure): { format?: string } {
    const id = getLookupId(measure) || measure.id;

    const { format } = AdapterUtils.getMeasureAdditionalInfo(transformation, id);

    return format ? { format } : {};
}

function findMeasure(afm: Afm.IAfm, id: string): Afm.IMeasure {
    return afm.measures.find((m) => m.id === id);
}

function getBaseObjectId(measure: Afm.IMeasure): string {
    return (measure.definition.baseObject as Afm.ISpecificObject).id;
}

function getReferencedObjectId(afm: Afm.IAfm, measure: Afm.IMeasure): string {
    const id = (measure.definition.baseObject as Afm.ILookupObject).lookupId;

    return getBaseObjectId(findMeasure(afm, id));
}

function getObjectId(afm: Afm.IAfm, measure: Afm.IMeasure): string {
    return getBaseObjectId(measure) || getReferencedObjectId(afm, measure);
}

function getMeasureType(aggregation: string = ''): VisObj.MeasureType {
    switch (aggregation.toLowerCase()) {
        case 'count':
            return 'attribute';
        case '':
            return 'metric';
        default:
            return 'fact';
    }
}

function convertMeasure(
    transformation: Transformation.ITransformation,
    afm: Afm.IAfm,
    measure: Afm.IMeasure
): VisObj.IMeasure {
    const filters = measure.definition.filters || [];
    const sorting = getMeasureSorting(transformation, measure) || {};
    const aggregation = measure.definition.aggregation ?
        { aggregation: measure.definition.aggregation } : {};
    const format = getMeasureFormat(transformation, measure) || {};

    return {
        measure: {
            measureFilters: filters.map(convertMeasureFilter),
            objectUri: getObjectId(afm, measure),
            showInPercent: Boolean(measure.definition.showInPercent),
            showPoP: Boolean(measure.definition.popAttribute),
            title: getMeasureTitle(transformation, measure),
            type: getMeasureType(measure.definition.aggregation),
            ...format,
            ...aggregation,
            ...sorting
        }
    };
}

function isStacking(transformation: Transformation.ITransformation, attribute: Afm.IAttribute): boolean {
    return (transformation.buckets || []).some((bucket) => {
        return bucket.name === 'stacks' &&
            (bucket.attributes || []).some((attr) => attr.id === attribute.id);
    });
}

function getAttributeDisplayForm(attribute, headers: IHeader[]) {
    if (Uri.isUri(attribute.id)) {
        return attribute.id;
    }
    return headers.find((header) => header.id === attribute.id).uri;
}

function convertAttribute(transformation, headers: IHeader[] = [], attribute: Afm.IAttribute): VisObj.ICategory {
    const sorting = getAttributeSorting(transformation, attribute) || {};

    const collection = isStacking(transformation, attribute) ? 'stack' : 'attribute';

    return {
        category: {
            collection,
            displayForm: getAttributeDisplayForm(attribute, headers),
            type: attribute.type,
            ...sorting
        }
    };
}

function isNotReferencedMeasure(measures: Afm.IMeasure[], measure: Afm.IMeasure): boolean {
    const popMeasure = measures.find((m) => Boolean(m.definition.popAttribute)) || EmptyMeasure;

    return measure.id !== getLookupId(popMeasure);
}

function isDateFilter(filter: Afm.IFilter): filter is Afm.IDateFilter {
    return filter.type === 'date';
}

function isPositiveAttributeFilter(filter: Afm.IAttributeFilter): filter is Afm.IPositiveAttributeFilter {
    return !!(filter as Afm.IPositiveAttributeFilter).in;
}

function isNegativeAttributeFilter(filter: Afm.IAttributeFilter): filter is Afm.INegativeAttributeFilter {
    return !!(filter as Afm.INegativeAttributeFilter).notIn;
}

function convertFilter(filter: Afm.IFilter): VisObj.EmbeddedFilter {
    if (isDateFilter(filter)) {
        const [from, to] = filter.between;

        return {
            dateFilter: {
                type: 'relative',
                from,
                to,
                dataset: filter.id,
                granularity: `GDC.time.${filter.granularity}`
            }
        } as VisObj.IEmbeddedDateFilter;
    }

    if (isPositiveAttributeFilter(filter)) {
        const attributeFilter: Afm.IPositiveAttributeFilter = filter;

        return {
            listAttributeFilter: {
                displayForm: attributeFilter.id,
                default: {
                    negativeSelection: false,
                    attributeElements: attributeFilter.in
                }
            }
        } as VisObj.IEmbeddedListAttributeFilter;
    }

    if (isNegativeAttributeFilter(filter)) {
        const attributeFilter: Afm.INegativeAttributeFilter = filter;

        return {
            listAttributeFilter: {
                displayForm: attributeFilter.id,
                default: {
                    negativeSelection: true,
                    attributeElements: attributeFilter.notIn
                }
            }
        } as VisObj.IEmbeddedListAttributeFilter;
    }
}

export function toVisObj(
    type: VisObj.VisualizationType,
    Afm: Afm.IAfm,
    transformation: Transformation.ITransformation,
    resultHeaders: IHeader[] = []
): VisObj.IVisualizationObject {
    const normalized = AdapterUtils.normalizeAfm(Afm);

    return {
        type,

        buckets: {
            measures: normalized.measures
                .filter(partial(isNotReferencedMeasure, normalized.measures))
                .map(partial(convertMeasure, transformation, normalized)),

            categories: normalized.attributes.map(partial(convertAttribute, transformation, resultHeaders)),

            filters: normalized.filters.map(convertFilter)
        }
    };
}
