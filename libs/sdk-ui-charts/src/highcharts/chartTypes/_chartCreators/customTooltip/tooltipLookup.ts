// (C) 2026 GoodData Corporation

/**
 * Builds a deterministic point key from a Highcharts drill intersection.
 *
 * Format matches the key produced by {@link buildLookupTable} in
 * `@gooddata/sdk-ui-vis-commons`, so a Highcharts point hover resolves against
 * the precomputed lookup.
 */

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ISeparators } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import {
    type IResolvedReferenceValues,
    type ITooltipExecutionMeta,
    buildKeySegment,
    buildLookupTable,
    joinKeySegments,
} from "@gooddata/sdk-ui-vis-commons";

import { type IIdentifierMapping } from "./identifierMapping.js";

export function buildPointKey(intersection: IDrillEventIntersectionElement[]): string {
    const parts: string[] = [];

    for (const element of intersection) {
        if (isDrillIntersectionAttributeItem(element.header)) {
            const dfId = element.header.attributeHeader.identifier;
            const uri = element.header.attributeHeaderItem.uri ?? "";
            parts.push(buildKeySegment(dfId, uri));
        }
    }

    return joinKeySegments(parts);
}

/**
 * Builds a per-point lookup from the chart's OWN dataView, keyed the same way as
 * {@link buildPointKey}. The hovered point's drill intersection carries only its
 * own series measure; this resolves EVERY in-chart metric at a given point, so a
 * sibling-series metric or a null cell renders correctly ("No data") instead of
 * "could not be retrieved" (F1-2510). Only measures are mapped — labels already
 * resolve from the drill intersection.
 */
export function buildChartReferenceLookup(
    dataView: IDataView,
    identifierMapping: IIdentifierMapping,
    separators?: ISeparators,
): Map<string, IResolvedReferenceValues> {
    const measureIdMap: Record<string, string> = {};
    for (const [localId, mapping] of Object.entries(identifierMapping.measures)) {
        measureIdMap[localId] = mapping.ldmId;
    }
    const meta: ITooltipExecutionMeta = { measureIdMap, labelCountMap: {}, labelIdMap: {} };
    return buildLookupTable(dataView, meta, separators);
}
