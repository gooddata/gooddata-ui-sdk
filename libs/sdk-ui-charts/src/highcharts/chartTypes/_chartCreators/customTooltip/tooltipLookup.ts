// (C) 2026 GoodData Corporation

/**
 * Builds a deterministic point key from a Highcharts drill intersection.
 *
 * Format matches the key produced by {@link buildLookupTable} in
 * `@gooddata/sdk-ui-vis-commons`, so a Highcharts point hover resolves against
 * the precomputed lookup.
 */

import { type IDrillEventIntersectionElement, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { buildKeySegment, joinKeySegments } from "@gooddata/sdk-ui-vis-commons";

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
