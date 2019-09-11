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
    ITotal,
    SortItem,
} from "@gooddata/sdk-model";
import { IExecutionDefinition } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";

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
        totals: [],
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
 * Creates new execution definition by merging new totals into an existing definition.
 *
 * @param def - existing definition
 * @param totals - array of totals
 * @returns always new instance
 */
export function defWithTotals(def: IExecutionDefinition, totals?: ITotal[]): IExecutionDefinition {
    if (!totals || isEmpty(totals)) {
        return def;
    }

    return {
        ...def,
        totals,
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
 * @param _def
 */
export function defFingerprint(_def: IExecutionDefinition): string {
    // TODO: finish this
    return "haluz";
}
