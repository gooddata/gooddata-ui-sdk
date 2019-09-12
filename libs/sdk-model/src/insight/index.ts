// (C) 2019 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import intersection from "lodash/intersection";
import { SortEntityIds, sortEntityIds, SortItem } from "../base/sort";
import {
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function insightBucket(insight: IInsight, idOrFun: string | BucketPredicate): IBucket | undefined {
    return bucketsFind(insight.insight.buckets, idOrFun);
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightBuckets(insight: IInsight, ...ids: string[]): IBucket[] {
    return bucketsById(insight.insight.buckets, ...ids);
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightMeasures(insight: IInsight): IMeasure[] {
    return bucketsMeasures(insight.insight.buckets);
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightHasMeasures(insight: IInsight): boolean {
    return insightMeasures(insight).length > 0;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightAttributes(insight: IInsight): IAttribute[] {
    return bucketsAttributes(insight.insight.buckets);
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightHasAttributes(insight: IInsight): boolean {
    return insightAttributes(insight).length > 0;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightHasDataDefined(insight: IInsight): boolean {
    return (
        insight.insight.buckets.length > 0 && (insightHasMeasures(insight) || insightHasAttributes(insight))
    );
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightFilters(insight: IInsight): IFilter[] {
    return insight.insight.filters;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightSorts(insight: IInsight): SortItem[] {
    const attributeIds = insightAttributes(insight).map(attributeId);
    const measureIds = insightMeasures(insight).map(measureId);

    function contains(arr1: string[], arr2: string[]): boolean {
        return intersection(arr1, arr2).length === arr2.length;
    }

    const filteredSorts = insight.insight.sorts.filter(s => {
        const entities: SortEntityIds = sortEntityIds(s);

        return (
            contains(attributeIds, entities.attributeIdentifiers) &&
            contains(measureIds, entities.measureIdentifiers)
        );
    });

    return filteredSorts;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightTotals(insight: IInsight): ITotal[] {
    return bucketsTotals(insight.insight.buckets);
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export function insightProperties(insight: IInsight): VisualizationProperties {
    return insight.insight.properties;
}
