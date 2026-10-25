// (C) 2026 GoodData Corporation

import { type IOpenAsReportUiConfig } from "@gooddata/sdk-ui";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { type IRawBuckets } from "../../typings/buckets.js";
import { getSortItemIdentifiers } from "../../utils/visualization_properties.js";
import { getBucketItemLocalIdentifiersInBuckets } from "../buckets/buckets_read_helpers.js";
import { sanitizeInitializedProperties } from "../properties/properties_helpers.js";

import { type IExtendedReferencePointState } from "./extended_reference_point_state.js";

/**
 * Narrow pure operations over `data.extendedReferencePoint`.
 *
 * The subtree holds what the pluggable-visualization round trip answered. Almost nothing edits it
 * from the AD side — the exception is the sort-item validation below, which every buckets mutation
 * runs, and which was a `(state) => State` transformer on `services/buckets_service.ts`.
 *
 * It lives with the ERP rather than with the buckets because the ERP is what it ANSWERS: the buckets
 * only supply the validity set. `buckets` is taken whole rather than as a pre-computed identifier list
 * so the caller cannot pass the wrong set — the derived read it needs is one call away and shared with
 * every other consumer (the 4.10 one-implementation rule).
 */

/**
 * Drops the sort items that no longer name a bucket item.
 *
 * A sort item survives when ANY of the identifiers it references is still in the buckets. That is
 * deliberately permissive: an attribute-area sort references a measure and an attribute, and the sort
 * stays meaningful while either of them is there.
 *
 * Absence handling is reproduced exactly, and it is the subtle part. The extended reference point
 * stays ABSENT until a plug viz reports one, and this transformer is nevertheless called on such
 * states (the removal chain and the bucket-filters reducer both run it unconditionally):
 *
 * - the READ defaults to `[]` only for an ABSENT key: a `sortItems` key present and set to
 *   `undefined` is answered as `undefined` and the `.filter` below then throws. That is deliberate —
 *   converting it into a silent empty list would mask a malformed round-trip payload;
 * - the WRITE creates the missing intermediates, so an undefined extended reference point becomes
 *   `{ properties: { sortItems: [] } }` and no caller has to materialize the container first.
 */
export function validateVisualizationProperties(
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    buckets: IRawBuckets,
): IExtendedReferencePointState {
    const sortItems = extendedReferencePoint?.properties?.sortItems ?? [];
    const validLocalIdentifiers = getBucketItemLocalIdentifiersInBuckets(buckets);

    const newSortItems = sortItems.filter((sortItem) => {
        const identifiers = getSortItemIdentifiers(sortItem);
        return validLocalIdentifiers.some((localIdentifier) => identifiers.includes(localIdentifier));
    });

    // The filter always allocates, so this always writes; both containers are MATERIALIZED when
    // absent, which is what lets an undefined extended reference point become
    // `{ properties: { sortItems: [] } }` without any caller seeding it first.
    return {
        ...extendedReferencePoint,
        properties: { ...extendedReferencePoint?.properties, sortItems: newSortItems },
    };
}

/**
 * `VIS_PROPERTIES_INITIALIZED`'s extended-reference-point half — a plain leaf case: this subtree is
 * the only foreign one the trigger writes, and it reads nothing but its own value and the payload.
 *
 * The stored `properties` are always dropped first, then re-written when the sanitized push kept
 * anything — the properties RULE is the properties domain's ({@link sanitizeInitializedProperties}).
 * An absent extended reference point is materialized only when there is something to store, and a
 * push that changes nothing answers the ORIGINAL reference.
 */
export function initializeVisualizationProperties(
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    supportedProperties: IVisualizationProperties,
): IExtendedReferencePointState | undefined {
    const validProperties = sanitizeInitializedProperties(supportedProperties);

    let next = extendedReferencePoint;
    // TRUTHY, not existence, which is what the readers below rely on
    if (next?.properties) {
        const { properties: _dropped, ...withoutProperties } = next;
        next = withoutProperties;
    }

    if (validProperties && next?.properties !== validProperties) {
        next = { ...next, properties: validProperties };
    }

    return next;
}

/**
 * `OPEN_AS_REPORT_TOGGLED` — a leaf case: two primitive writes into the uiConfig, nothing else.
 * The missing intermediates are MATERIALIZED (the ERP may be absent before the first plug-viz
 * answer), and a repeated toggle with the same answer returns the same state.
 */
export function toggleOpenAsReport(
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    { supported, warningMessage }: IOpenAsReportUiConfig,
): IExtendedReferencePointState {
    const openAsReport = extendedReferencePoint?.uiConfig?.openAsReport;
    if (
        extendedReferencePoint &&
        openAsReport?.supported === supported &&
        openAsReport?.warningMessage === warningMessage
    ) {
        return extendedReferencePoint;
    }

    return {
        ...extendedReferencePoint,
        uiConfig: {
            ...extendedReferencePoint?.uiConfig,
            openAsReport: { ...openAsReport, supported, warningMessage },
        },
    } as IExtendedReferencePointState;
}
