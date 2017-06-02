import flatten = require('lodash/flatten');
import compact = require('lodash/compact');
import { Afm, Sorting, Transformation } from '@gooddata/data-layer';

import * as VisObj from './model/VisualizationObject';

const getMeasureId = (n: number, isPoP?: boolean): string => `m${n + 1}${isPoP ? '_pop' : ''}`;

function convertBaseAttributeFilter(filter) {
    const items = filter.listAttributeFilter.default.attributeElements.map((el) => {
        return el.split('=')[1]; // pick ID from URL: /gdc/md/obj/1/elements?id=1
    });

    const selectionType = filter.listAttributeFilter.default.negativeSelection ? 'notIn' : 'in';
    return {
        id: filter.listAttributeFilter.displayForm,
        [selectionType]: items
    };
}

function convertMeasureAttributeFilters(measure: VisObj.IMeasure): Afm.IMeasureAttributeFilter[] {
    return measure.measure.measureFilters.map(convertBaseAttributeFilter) as Afm.IMeasureAttributeFilter[];
}

function convertMeasureAfm(measure: VisObj.IMeasure, index: number, popAttribute?: string): Afm.IMeasure[] {
    const showInPercent = measure.measure.showInPercent ? { showInPercent: true } : {};
    const aggregation = measure.measure.aggregation ? { aggregation: measure.measure.aggregation } : {};
    const filters = compact(convertMeasureAttributeFilters(measure));
    const filtersProp = filters.length ? { filters } : {};
    const measures: Afm.IMeasure[] = [
        {
            id: getMeasureId(index),
            definition: {
                baseObject: {
                    id: measure.measure.objectUri
                },
                ...aggregation,
                ...showInPercent,
                ...filtersProp
            }
        }
    ];

    if (measure.measure.showPoP) {
        const popMeasure: Afm.IMeasure = {
            id: getMeasureId(index, true),
            definition: {
                baseObject: {
                    lookupId: getMeasureId(index)
                },
                popAttribute: {
                    id: popAttribute
                }
            }
        };

        measures.push(popMeasure);
    }

    return measures;
}

function convertAttribute(attribute: VisObj.ICategory): Afm.IAttribute {
    return {
        id: attribute.category.displayForm,
        type: attribute.category.type
    };
}

function convertDateFilter(filter: VisObj.IEmbeddedDateFilter): Afm.IDateFilter {
    return {
        type: 'date',
        id: filter.dateFilter.dataset,
        between: [
            (filter.dateFilter.from as string),
            (filter.dateFilter.to as string)
        ],
        granularity: filter.dateFilter.granularity.split('.')[2]
    };
}

function convertAttributeFilter(filter: VisObj.IEmbeddedListAttributeFilter): Afm.IAttributeFilter {
    const baseFilter = convertBaseAttributeFilter(filter);
    if (!baseFilter) {
        return null;
    }

    return {
        type: 'attribute',
        ...baseFilter
    } as Afm.IAttributeFilter;
}

function convertFilter(filter: VisObj.EmbeddedFilter): Afm.IFilter {
    if ((filter as VisObj.IEmbeddedDateFilter).dateFilter) {
        return convertDateFilter(filter as VisObj.IEmbeddedDateFilter);
    }

    return convertAttributeFilter(filter as VisObj.IEmbeddedListAttributeFilter);
}

function convertMeasureTransformation(measure: VisObj.IMeasure, index: number): Transformation.IMeasure[] {
    const measures: Transformation.IMeasure[] = [
        {
            id: getMeasureId(index),
            title: measure.measure.title,
            format: measure.measure.format
        }
    ];
    if (measure.measure.showPoP) {
        measures.push({
            id: getMeasureId(index, true),
            title: `${measure.measure.title} - previous year`
        });
    }
    return measures;
}

function convertSortingTransformation(visObj: VisObj.IVisualizationObject): Sorting.ISort[] {
    const measureSorting = visObj.buckets.measures.map((measure, index) => {
        if (!measure.measure.sort) {
            return null;
        }

        return {
            column: getMeasureId(index, measure.measure.sort.sortByPoP),
            direction: measure.measure.sort.direction
        };
    });

    const attributesSorting = visObj.buckets.categories.map((category) => {
        if (!category.category.sort) {
            return null;
        }

        return {
            column: category.category.displayForm,
            direction: category.category.sort
        };
    });

    return compact([...measureSorting, ...attributesSorting]);
}

function getPoPAttribute(resolver: DisplayFormResolver, visObj: VisObj.IVisualizationObject) {
    const category = visObj.buckets.categories[0];

    if (category && category.category.type === 'date') {
        return resolver(category.category.attribute);
    }

    const filter: VisObj.IEmbeddedDateFilter = (visObj.buckets.filters as VisObj.IEmbeddedDateFilter[])
        .find((f): f is VisObj.IEmbeddedDateFilter => {
            return !!f.dateFilter;
        });

    if (filter) {
        return resolver(filter.dateFilter.attribute);
    }

    return null;
}

function convertAFM(visObj: VisObj.IVisualizationObject, resolver: DisplayFormResolver): Afm.IAfm {
    const attributes = visObj.buckets.categories.map(convertAttribute);
    const attrProp = attributes.length ? { attributes } : {};

    const popAttribute = getPoPAttribute(resolver, visObj);
    const measures = flatten(visObj.buckets.measures.map((measure, index) => {
        return convertMeasureAfm(measure, index, popAttribute);
    }));
    const measuresProp = measures.length ? { measures } : {};

    const filters = compact(visObj.buckets.filters.map(convertFilter));
    const filtersProp = filters.length ? { filters } : {};

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp
    };
}

function convertTransformation(visObj: VisObj.IVisualizationObject): Transformation.ITransformation {
    const sorting = convertSortingTransformation(visObj);
    const sortProp = sorting.length ? { sorting } : {};

    const measuresTransformation = flatten(visObj.buckets.measures.map(convertMeasureTransformation));
    const measuresTransformationProp = measuresTransformation.length ? { measures: measuresTransformation } : {};

    const stackingAttributes = visObj.buckets.categories
        .filter((category) => category.category.collection === 'stack')
        .map((category) => ({
            id: category.category.displayForm
        }));
    const stackingProp = stackingAttributes.length ?
        { buckets: [{ attributes: stackingAttributes, name: 'stacks' } ]} :
        {};

    return {
        ...measuresTransformationProp,
        ...stackingProp,
        ...sortProp
    };
}

export interface IConvertedAFM {
    afm: Afm.IAfm;
    transformation: Transformation.ITransformation;
    type: VisObj.VisualizationType;
}

export interface IAttributesMap {
    [x: string]: string;
}

type DisplayFormResolver = (uri: string) => string;

function makeDisplayFormUriResolver(attributesMap: IAttributesMap): DisplayFormResolver {
    return (uri: string) => {
        return attributesMap[uri];
    };
}

export function toAFM(visObj: VisObj.IVisualizationObject, attributesMap: IAttributesMap): IConvertedAFM {
    return {
        type: visObj.type,

        afm: convertAFM(visObj, makeDisplayFormUriResolver(attributesMap)),

        transformation: convertTransformation(visObj)
    };
}
