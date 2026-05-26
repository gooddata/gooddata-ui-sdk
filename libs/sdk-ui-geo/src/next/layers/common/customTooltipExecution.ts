// (C) 2026 GoodData Corporation

import {
    type IAttribute,
    type IExecutionDefinition,
    attributeDisplayFormRef,
    isAttribute,
    isIdentifierRef,
    isUriRef,
} from "@gooddata/sdk-model";
import { type IResolvedReferenceValues, type ITooltipExecutionBundle } from "@gooddata/sdk-ui-vis-commons";

import { type JsonValue } from "../../utils/guards.js";

import { parseTooltipPayload } from "./tooltipUtils.js";

/**
 * Returns the lookup key for a hovered feature in the same format
 * `buildLookupTable` produces — or `null` if the feature lacks the data
 * needed to build a stable key.
 *
 * @internal
 */
export type BuildFeatureKey = (properties: GeoJSON.GeoJsonProperties) => string | null;

/**
 * @internal
 */
export interface IGeoLayerCustomTooltipExecution extends ITooltipExecutionBundle {
    buildFeatureKey: BuildFeatureKey;
}

/**
 * Lives here (not in the hook file) to break a circular import with
 * `adapterTypes.ts`.
 *
 * @internal
 */
export interface IGeoLayerTooltipLookup {
    lookup: Map<string, IResolvedReferenceValues>;
    buildFeatureKey: BuildFeatureKey;
}

/**
 * Returned localIdentifiers follow `bucketNames` order — both the row dim and
 * the hover-time key segment order rely on it.
 *
 * @internal
 */
export function getAttributeLocalIdsFromBuckets(
    definition: IExecutionDefinition,
    bucketNames: readonly string[],
): string[] {
    const localIds: string[] = [];
    for (const bucketName of bucketNames) {
        const bucket = definition.buckets.find((b) => b.localIdentifier === bucketName);
        if (!bucket) {
            continue;
        }
        for (const item of bucket.items) {
            if (isAttribute(item)) {
                localIds.push(item.attribute.localIdentifier);
            }
        }
    }
    return localIds;
}

/**
 * Narrow a tooltip attribute payload (e.g. `feature.properties.locationName`)
 * to its identifying fields. `attrId === undefined` signals "no stable key for
 * this feature" — callers compare against the expected layer attribute id.
 *
 * Reuses `parseTooltipPayload` so the JSON-string-or-object handling stays in
 * one place (MapLibre stringifies complex GeoJSON property values when they
 * round-trip through `queryRenderedFeatures`).
 *
 * @internal
 */
export function readAttrIdentity(payload: JsonValue | undefined): { attrId?: string; uri: string } {
    // Pushpin call sites read from GeoJsonProperties (e.g. `properties["locationName"]`),
    // where a missing key yields `undefined` at runtime. The `any` type from
    // @types/geojson hides that from TS, but we want the function to short-circuit
    // safely rather than crash inside parseTooltipPayload.
    if (payload === undefined) {
        return { uri: "" };
    }
    const parsed = parseTooltipPayload(payload);
    return { attrId: parsed?.attrId, uri: parsed?.uri ?? "" };
}

/**
 * URI refs return `undefined` — the tooltip-execution backend path can't
 * resolve uriRef display forms, so the caller must skip that layer.
 * For payload bookkeeping that accepts either ref kind, use {@link getAttributeRefId}.
 *
 * @internal
 */
export function getAttributeIdRefIdentifier(attribute: IAttribute | undefined): string | undefined {
    if (!attribute) {
        return undefined;
    }
    const ref = attributeDisplayFormRef(attribute);
    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }
    return undefined;
}

/**
 * Returns identifier for idRef, uri for uriRef — a stable key for feature
 * payloads whichever ref kind the layer uses.
 *
 * @internal
 */
export function getAttributeRefId(attribute: IAttribute | undefined): string | undefined {
    if (!attribute) {
        return undefined;
    }
    const ref = attributeDisplayFormRef(attribute);
    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }
    if (isUriRef(ref)) {
        return ref.uri;
    }
    return undefined;
}
