// (C) 2025-2026 GoodData Corporation

import { type IInsightDefinition } from "@gooddata/sdk-model";

import {
    hasPushpinColorMeasure,
    hasPushpinSegmentAttribute,
    hasPushpinSizeMeasure,
    isPushpinClusteringEditable as isPushpinClusteringEditableInternal,
} from "../../utils/geoPushpinCompatibility.js";

/**
 * Checks whether the insight contains a non-empty size bucket.
 *
 * @internal
 */
export function hasSizeMeasure(insight: IInsightDefinition | undefined): boolean {
    return hasPushpinSizeMeasure(insight);
}

/**
 * Checks whether the insight contains a non-empty color bucket.
 *
 * @internal
 */
export function hasColorMeasure(insight: IInsightDefinition | undefined): boolean {
    return hasPushpinColorMeasure(insight);
}

/**
 * Checks whether the insight contains a non-empty segment bucket.
 *
 * @internal
 */
export function hasSegmentAttribute(insight: IInsightDefinition | undefined): boolean {
    return hasPushpinSegmentAttribute(insight);
}

/**
 * Checks whether pushpin clustering can be edited for the current insight configuration.
 *
 * @internal
 */
export function isPushpinClusteringEditable(
    insight: IInsightDefinition | undefined,
    shapeType?: Parameters<typeof isPushpinClusteringEditableInternal>[1],
): boolean {
    return isPushpinClusteringEditableInternal(insight, shapeType);
}
