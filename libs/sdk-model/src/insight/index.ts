// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import intersection = require("lodash/intersection");
import { SortEntityIds, sortEntityIds, SortItem } from "../base/sort";
import { anyBucket, BucketPredicate, IBucket } from "../buckets";
import { IFilter } from "../filter";
import { IMeasure, measureId } from "../measure";
import { attributeLocalId, IAttribute } from "../attribute";
import { ITotal } from "../base/totals";
import {
    bucketsAttributes,
    bucketsById,
    bucketsFind,
    bucketsMeasures,
    bucketsTotals,
} from "../buckets/bucketArray";

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
    if (!insight) {
        return;
    }

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
    if (!insight) {
        return [];
    }

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
    if (!insight) {
        return [];
    }

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
    if (!insight) {
        return false;
    }

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
    if (!insight) {
        return [];
    }

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
    if (!insight) {
        return false;
    }

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
    if (!insight) {
        return false;
    }

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
    if (!insight) {
        return [];
    }

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
    if (!insight) {
        return [];
    }

    const attributeIds = insightAttributes(insight).map(attributeLocalId);
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
    if (!insight) {
        return [];
    }

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
    if (!insight) {
        return {};
    }

    return insight.insight.properties;
}

/**
 * Gets visualization class identifier of an insight.
 *
 * @param insight - insight to get vis properties for
 * @public
 */
export function insightVisualizationClassIdentifier(insight: IInsight): string {
    return insight.insight.visualizationClassIdentifier;
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different properties.
 *
 * @param insight - insight to work with
 * @param properties - new properties to have on the new insight
 * @returns always new instance
 * @public
 */
export function insightWithProperties(insight: IInsight, properties: VisualizationProperties): IInsight {
    return {
        insight: {
            ...insight.insight,
            properties,
        },
    };
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different sorts.
 *
 * @param insight - insight to work with
 * @param sorts - new sorts to apply
 * @returns always new instance
 * @public
 */
export function insightWithSorts(insight: IInsight, sorts: SortItem[]): IInsight {
    return {
        insight: {
            ...insight.insight,
            sorts,
        },
    };
}

//
// Visualization class functions
//

/**
 * For given visualization class, return URL where the vis assets are stored.
 *
 * @param vc - visualization class
 * @returns never null, never empty
 * @public
 */
export function visClassUrl(vc: IVisualizationClass): string {
    return vc.visualizationClass.url;
}
