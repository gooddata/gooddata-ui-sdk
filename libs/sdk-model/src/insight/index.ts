// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import intersection = require("lodash/intersection");
import { SortEntityIds, sortEntityIds, SortItem } from "../base/sort";
import {
    anyBucket,
    BucketPredicate,
    bucketsAttributes,
    bucketsById,
    bucketsFind,
    bucketsMeasures,
    bucketsTotals,
    IBucket,
} from "../buckets";
import { IFilter } from "../filter";
import { IMeasure, measureId } from "../measure";
import { attributeId, IAttribute } from "../attribute";
import { ITotal } from "../base/totals";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IInsight {
    insight: {
        identifier: string;
        uri?: string;
        title: string;
        visualizationClassIdentifier: string;
        buckets: IBucket[];
        filters: IFilter[];
        sorts: SortItem[];
        properties: VisualizationProperties;
    };
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IVisualizationClass {
    visualizationClass: {
        identifier: string;
        uri?: string;
        title: string;
        url: string;
        icon: string;
        iconSelected: string;
        checksum: string;
        orderIndex?: number;
    };
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export type VisualizationProperties = {
    [key: string]: any;
};

//
// Type guards
//

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function isInsight(obj: any): obj is IInsight {
    return !isEmpty(obj) && (obj as IInsight).insight !== undefined;
}

//
// Functions
//

/**
 * Finds bucket matching the provided predicate in an insight.
 *
 * This function also provides convenience to find bucket by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchBucket predicate.
 *
 * @param insight - insight to work with
 * @param idOrFun - local identifier or bucket predicate
 * @returns undefined if none match
 * @public
 */
export function insightBucket(
    insight: IInsight,
    idOrFun: string | BucketPredicate = anyBucket,
): IBucket | undefined {
    return bucketsFind(insight.insight.buckets, idOrFun);
}

/**
 * Gets all buckets matching the provided ids from an insight. If no ids are provided, then all buckets are
 * returned
 *
 * @param insight - insight to work with
 * @param ids - local identifiers of buckets
 * @returns empty list if none match
 * @public
 */
export function insightBuckets(insight: IInsight, ...ids: string[]): IBucket[] {
    if (!ids || !ids.length) {
        return insight.insight.buckets;
    }

    return bucketsById(insight.insight.buckets, ...ids);
}

/**
 * Gets all measures used in the provided insight.
 *
 * @param insight - insight to work with
 * @returns empty if one
 * @public
 */
export function insightMeasures(insight: IInsight): IMeasure[] {
    return bucketsMeasures(insight.insight.buckets);
}

/**
 * Tests whether insight uses any measures.
 *
 * @param insight - insight to test
 * @returns true if any measures, false if not
 * @public
 */
export function insightHasMeasures(insight: IInsight): boolean {
    return insightMeasures(insight).length > 0;
}

/**
 * Gets all attributes used in the provided insight
 *
 * @param insight - insight to work with
 * @returns empty if none
 * @public
 */
export function insightAttributes(insight: IInsight): IAttribute[] {
    return bucketsAttributes(insight.insight.buckets);
}

/**
 * Tests whether insight uses any attributes
 *
 * @param insight - insight to test
 * @returns true if any measures, false if not
 * @public
 */
export function insightHasAttributes(insight: IInsight): boolean {
    return insightAttributes(insight).length > 0;
}

/**
 * Tests whether insight contains valid definition of data to visualise - meaning at least one attribute or
 * one measure is defined in the insight.
 *
 * @param insight - insight to test
 * @returns true if at least one measure or attribute, false if none
 * @public
 */
export function insightHasDataDefined(insight: IInsight): boolean {
    return (
        insight.insight.buckets.length > 0 && (insightHasMeasures(insight) || insightHasAttributes(insight))
    );
}

/**
 * Gets filters used in an insight.
 *
 * @param insight - insight to work with
 * @public
 */
export function insightFilters(insight: IInsight): IFilter[] {
    return insight.insight.filters;
}

/**
 * Gets sorting defined in the insight.
 *
 * Note: this function ensures that only sorts working on top of attributes and measures defined in the
 * insight will be returned. Any invalid entries will be stripped.
 *
 * @param insight - insight to get sorts from
 * @returns array of valid sorts
 * @public
 */
export function insightSorts(insight: IInsight): SortItem[] {
    const attributeIds = insightAttributes(insight).map(attributeId);
    const measureIds = insightMeasures(insight).map(measureId);

    function contains(arr1: string[], arr2: string[]): boolean {
        return intersection(arr1, arr2).length === arr2.length;
    }

    return insight.insight.sorts.filter(s => {
        const entities: SortEntityIds = sortEntityIds(s);

        return (
            contains(attributeIds, entities.attributeIdentifiers) &&
            contains(measureIds, entities.measureIdentifiers)
        );
    });
}

/**
 * Gets all totals defined in the insight
 *
 * @param insight - insight to get totals from
 * @returns empty if none
 * @public
 */
export function insightTotals(insight: IInsight): ITotal[] {
    return bucketsTotals(insight.insight.buckets);
}

/**
 * Gets visualization properties of an insight.
 *
 * @param insight - insight to get vis properties for
 * @returns empty object is no properties
 * @public
 */
export function insightProperties(insight: IInsight): VisualizationProperties {
    return insight.insight.properties;
}
