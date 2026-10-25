// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { type IBucketItemMetricFilter } from "./bucket_item_filter.js";

/**
 * The MD-OBJECT family (saved-insight content, `lastSavedObject`, save/compare currency). The shapes
 * ARE the bear visualization-object family in `typings/bear/bearTypes.ts` (`IBucket`, `BucketItem`,
 * `IVisualizationObjectContent`, …) and consumers type against those directly.
 *
 * Not to be confused with the typings/buckets.ts STATE family — same shapes, different owners.
 */

// a type literal (not an interface) so it satisfies IRawBucketItem's index signature — the MD → state
// transform's items land in the raw buckets subtree
export type IBucketItem = {
    type: string;
    alias?: string;
    localIdentifier: string;
    aggregation?: string;
    granularity?: string;
    filters: IBucketItemMetricFilter[];
    showInPercent?: boolean;
    attribute?: string;
    identifier?: string;
    masterLocalIdentifier?: string;
    /** a derived measure's comparison kind (models/metadata.ts#transformDerivedMeasure) */
    overTimeComparisonType?: OverTimeComparisonType;
    /** an arithmetic measure's operands (models/metadata.ts#transformArithmeticMeasure) */
    operandLocalIdentifiers?: string[];
    showOnSecondaryAxis?: boolean;
    isTotalMeasure?: boolean;
    isThresholdMeasure?: boolean;
    isKdaDisabled?: boolean;
    operator?: string;
    format?: string;
    dfRef?: ObjRef;
};
