// (C) 2019 GoodData Corporation
import {
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
} from "@gooddata/sdk-model";
import { IExecutionDefinition } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import SparkMD5 from "spark-md5";
import {
    attributeFingerprint,
    dimensionFingerprint,
    filterFingerprint,
    measureFingerprint,
    sortFingerprint,
} from "./fingerprints";

/**
 * Creates new, empty execution definition for the provided workspace.
 *
 * @param workspace - workspace to calculate on
 * @returns always new instance
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
 */
export function newDefFromInsight(workspace: string, insight: IInsight): IExecutionDefinition {
    const def = newDefFromBuckets(workspace, insightBuckets(insight));

    // TODO: add sorts
    return defWithFilters(def, insightFilters(insight));
}

/**
 * Creates new execution definition by merging new filters into an existing definition.
 *
 * @param def - existing definition
 * @param filters - array of filters to add to definition
 * @returns always new instance
 */
export function defWithFilters(def: IExecutionDefinition, filters?: IFilter[]): IExecutionDefinition {
    if (!filters || isEmpty(filters)) {
        return def;
    }

    // TODO: adapt our existing filter merging logic

    return {
        ...def,
        filters: def.filters.concat(filters),
    };
}

/**
 * Creates new execution definition by merging new sort items into an existing definition.
 *
 * @param def - existing definition
 * @param sorts - array of sort items to add to definition
 * @returns always new instance
 */
export function defWithSorts(def: IExecutionDefinition, sorts?: SortItem[]): IExecutionDefinition {
    if (!sorts || isEmpty(sorts)) {
        return def;
    }

    return {
        ...def,
        sortBy: def.sortBy.concat(sorts),
    };
}

/**
 * Creates new execution definition by slapping the provided dimensions on top of the definition.
 *
 * @param def - existing definition
 * @param dimensions - dimensions
 * @returns always new instance
 */
export function defWithDimensions(
    def: IExecutionDefinition,
    dimensions?: IDimension[],
): IExecutionDefinition {
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
 * @param def
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

    hasher.append(def.workspace);
    def.attributes.map(attributeFingerprint).forEach(hasher.append);
    def.measures.map(measureFingerprint).forEach(hasher.append);
    def.filters.map(filterFingerprint).forEach(hasher.append);
    def.sortBy.map(sortFingerprint).forEach(hasher.append);
    def.dimensions.map(dimensionFingerprint).forEach(hasher.append);

    return hasher.end();
}
