// (C) 2019 GoodData Corporation
import {
    attributeFingerprint,
    AttributeOrMeasure,
    bucketsAttributes,
    bucketsMeasures,
    IBucket,
    IDimension,
    IFilter,
    IInsight,
    insightBuckets,
    insightFilters,
    isAttribute,
    isMeasure,
    SortItem,
    measureFingerprint,
    filterFingerprint,
    sortFingerprint,
    dimensionFingerprint,
    IAttribute,
    IMeasure,
    isAttributeFilter,
    IAttributeFilter,
    IDateFilter,
    filterQualifierValue,
} from "@gooddata/sdk-model";
import isEmpty = require("lodash/isEmpty");
import partition = require("lodash/partition");
import unionBy = require("lodash/unionBy");
import SparkMD5 from "spark-md5";

/*
 * TODO: SDK8: revisit whether this is the right location
 *  it does appear like that to me; it does not fit the model package as it is not about the domain model but
 *  rather part of the interface with the backend.
 */

/**
 * Execution definition contains 100% complete description of what will the execution compute and how will
 * the resulting data look like.
 *
 * @public
 */
export interface IExecutionDefinition {
    readonly workspace: string;
    readonly buckets: IBucket[];
    readonly attributes: IAttribute[];
    readonly measures: IMeasure[];
    readonly filters: IFilter[];
    readonly sortBy: SortItem[];
    readonly dimensions: IDimension[];
}

/**
 * Creates new, empty execution definition for the provided workspace.
 *
 * @param workspace - workspace to calculate on
 * @returns always new instance
 * @public
 */
export function emptyDef(workspace: string): IExecutionDefinition {
    return {
        workspace,
        buckets: [],
        attributes: [],
        measures: [],
        dimensions: [],
        filters: [],
        sortBy: [],
    };
}

/**
 * Creates a new execution definition for workspace and a set of attributes and measures.
 *
 * @param workspace - workspace to calculate on
 * @param items - mix of attributes and measures
 * @returns always new instance
 * @public
 */
export function newDefFromItems(workspace: string, items: AttributeOrMeasure[]): IExecutionDefinition {
    return {
        ...emptyDef(workspace),
        attributes: items.filter(isAttribute),
        measures: items.filter(isMeasure),
    };
}

/**
 * Creates a new execution definition for workspace and a set of buckets. Attributes and measures from all the buckets
 * are distributed into attributes and measures in the definition in 'natural' order. Items are placed into respective
 * arrays in the order in which they appear in the buckets. Items from first bucket appear before items from
 * second bucket and so on.
 *
 * @param workspace - workspace to calculate on
 * @param buckets - buckets
 * @returns always new instance
 * @public
 */
export function newDefFromBuckets(workspace: string, buckets: IBucket[]): IExecutionDefinition {
    return {
        ...emptyDef(workspace),
        buckets,
        attributes: bucketsAttributes(buckets),
        measures: bucketsMeasures(buckets),
    };
}

/**
 * Creates a new execution definition for workspace and an insight:
 *
 * - Attributes and measures from insight's buckets are distributed into definition attributes and measures
 *   in natural order.
 * - Insight filters are added into definition
 * - Insight sorts are added into definition
 * - Insight totals are added into definition
 *
 * @param workspace - workspace to calculate on
 * @param insight - insight to create definition for
 * @returns always new instance
 * @public
 */
export function newDefFromInsight(workspace: string, insight: IInsight): IExecutionDefinition {
    const def = newDefFromBuckets(workspace, insightBuckets(insight));

    // TODO: add sorts
    return defWithFilters(def, insightFilters(insight));
}

// TODO: where to place these helper functions?
const separateFiltersByType = (filters: IFilter[]): [IAttributeFilter[], IDateFilter[]] => {
    return partition(filters, isAttributeFilter);
};

const mergeFilters = (originalFilters: IFilter[], addedFilters: IFilter[] | undefined): IFilter[] => {
    if (!addedFilters || !addedFilters.length) {
        return originalFilters;
    }

    const [originalAttributeFilters, originalDateFilters] = separateFiltersByType(originalFilters);
    const [addedAttributeFilters, addedDateFilters] = separateFiltersByType(addedFilters);

    // concat attribute filters
    const attributeFilters = [...originalAttributeFilters, ...addedAttributeFilters];

    // merge date filters by date dataset qualifier
    // added date filters should win, so they are specified first, unionBy prefers items from the first argument
    const dateFilters = unionBy(addedDateFilters, originalDateFilters, filterQualifierValue);

    return [...attributeFilters, ...dateFilters];
};

/**
 * Creates new execution definition by merging new filters into an existing definition.
 *
 * @param def - existing definition
 * @param filters - array of filters to add to definition
 * @returns always new instance
 * @public
 */
export function defWithFilters(def: IExecutionDefinition, filters?: IFilter[]): IExecutionDefinition {
    if (!filters || isEmpty(filters)) {
        return def;
    }

    return {
        ...def,
        filters: mergeFilters(def.filters, filters),
    };
}

/**
 * Creates new execution definition by merging new sort items into an existing definition.
 *
 * @param def - existing definition
 * @param sortBy - array of sort items to add to definition
 * @returns always new instance
 * @public
 */
export function defSetSorts(def: IExecutionDefinition, sortBy?: SortItem[]): IExecutionDefinition {
    if (!sortBy || isEmpty(sortBy)) {
        return def;
    }

    return {
        ...def,
        sortBy,
    };
}

/**
 * Creates new execution definition by slapping the provided dimensions on top of the definition.
 *
 * @param def - existing definition
 * @param dimensions - dimensions
 * @returns always new instance
 * @public
 */
export function defSetDimensions(def: IExecutionDefinition, dimensions?: IDimension[]): IExecutionDefinition {
    if (!dimensions || isEmpty(dimensions)) {
        return def;
    }

    return {
        ...def,
        dimensions,
    };
}

/**
 * Calculates fingerprint for the execution definition.
 * @param def - execution definition
 * @public
 */
export function defFingerprint(def: IExecutionDefinition): string {
    const hasher = new SparkMD5();

    /*
     * Simple approach to construct exec definition fingerprint; the main drawback is that it completely
     * disregards that ordering of some array elements does not impact the results of the actual execution.
     *
     * - attributes, measures, filters, sortby and totals should be sorted first and then fingerprinted.
     * - dimensions must be fingerprinted in the defined order
     *
     * This simple approach can lead to 'false negatives' => code says executions are different while in
     * fact are the same. This does not lead to functional issues as the bear can deal with that and will
     * reuse cached and all. The only drawback is frontend cache misses.
     */

    const hashFun = hasher.append.bind(hasher);

    hasher.append(def.workspace);
    def.attributes.map(attributeFingerprint).forEach(hashFun);
    def.measures.map(measureFingerprint).forEach(hashFun);
    def.filters.map(filterFingerprint).forEach(hashFun);
    def.sortBy.map(sortFingerprint).forEach(hashFun);
    def.dimensions.map(dimensionFingerprint).forEach(hashFun);

    return hasher.end();
}
