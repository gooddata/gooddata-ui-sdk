// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import partition = require("lodash/partition");
import unionBy = require("lodash/unionBy");
import SparkMD5 from "spark-md5";
import {
    dimensionTotals,
    filterQualifierValue,
    IAttribute,
    IAttributeFilter,
    IBucket,
    IDateFilter,
    IDimension,
    IFilter,
    IMeasure,
    isAttributeFilter,
    ITotal,
    SortItem,
} from "..";
import {
    attributeFingerprint,
    dimensionFingerprint,
    filterFingerprint,
    measureFingerprint,
    sortFingerprint,
} from "./fingerprints";

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
 * Function transforming a list of buckets (with attributes and measures) into execution dimension descriptors.
 *
 * @public
 */
export type DimensionGenerator = (buckets: IBucket[]) => IDimension[];

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

function separateFiltersByType(filters: IFilter[]): [IAttributeFilter[], IDateFilter[]] {
    return partition(filters, isAttributeFilter);
}

function mergeFilters(originalFilters: IFilter[], addedFilters: IFilter[] | undefined): IFilter[] {
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
}

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
 * Gets totals from particular dimension in the provided execution definition.
 *
 * @param def - definition to get totals from
 * @param dimIdx - dimension index
 * @returns empty list if no definition or dimension with the provided index not defined or if there are no
 *  totals in the dimension
 * @public
 */
export function defTotals(def: IExecutionDefinition, dimIdx: number): ITotal[] {
    if (!def || !def.dimensions[dimIdx]) {
        return [];
    }

    return dimensionTotals(def.dimensions[dimIdx]);
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
