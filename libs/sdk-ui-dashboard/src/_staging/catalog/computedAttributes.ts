// (C) 2026 GoodData Corporation

import { partition } from "lodash-es";

import { type IAnalyticalBackend, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type IComputedAttributeMetadataObject,
    type ObjRef,
    catalogComputedAttributeAsCatalogAttribute,
    isComputedAttributeRef,
} from "@gooddata/sdk-model";

/**
 * Merges plain and computed catalog attributes into one alphabetical list.
 *
 * The catalog holds the two as separate lists, each sorted on its own; a plain concatenation
 * would strand every computed attribute at the tail of a picker instead of filing it in among
 * the attributes. The merge is a stable insert: the plain attributes keep exactly the order the
 * catalog delivered them in (they are never compared with each other), and each computed
 * attribute is filed in by a locale-aware title comparison.
 *
 * @internal
 */
export function mergeAttributesWithComputed(
    attributes: ICatalogAttribute[],
    computedAttributes: ICatalogComputedAttribute[],
    locale?: string,
): ICatalogAttribute[] {
    if (computedAttributes.length === 0) {
        return attributes;
    }

    const collator = new Intl.Collator(locale);
    const adaptedComputed = computedAttributes
        .map(catalogComputedAttributeAsCatalogAttribute)
        .sort((a, b) => collator.compare(a.attribute.title, b.attribute.title));

    const merged: ICatalogAttribute[] = [];
    let computedIdx = 0;
    for (const attribute of attributes) {
        while (
            computedIdx < adaptedComputed.length &&
            collator.compare(adaptedComputed[computedIdx].attribute.title, attribute.attribute.title) < 0
        ) {
            merged.push(adaptedComputed[computedIdx]);
            computedIdx++;
        }
        merged.push(attribute);
    }
    merged.push(...adaptedComputed.slice(computedIdx));

    return merged;
}

/**
 * Splits the refs into those pointing at computed attributes and the rest. A computed attribute's
 * fabricated display form shares the computed attribute's own ref, so a computed-attribute-typed
 * display form ref must resolve through the computedAttributes service, never through labels.
 *
 * @internal
 */
export function partitionComputedAttributeRefs(refs: ObjRef[]): {
    computedAttributeRefs: ObjRef[];
    otherRefs: ObjRef[];
} {
    const [computedAttributeRefs, otherRefs] = partition(refs, isComputedAttributeRef);

    return { computedAttributeRefs, otherRefs };
}

// A ref that resolves to one of these statuses is treated as missing rather than as a failure:
// the computed attribute was deleted (404), the user must not see it (403), or the backend refuses
// computed-attribute requests altogether because the enableComputedAttributes setting is off (400).
const COMPUTED_ATTRIBUTES_UNAVAILABLE_STATUSES = [400, 403, 404];

function isHttpResponseError(reason: unknown): reason is { response: { status: number } } {
    return typeof (reason as { response?: { status?: unknown } } | undefined)?.response?.status === "number";
}

/**
 * Whether the error signals that computed attributes are not available (disabled, missing or not
 * visible) as opposed to a genuine failure (network, server, authentication). Loads degrading to
 * "no computed attributes" must do so only for the former and rethrow the latter.
 *
 * @internal
 */
export function isComputedAttributesUnavailableError(reason: unknown): boolean {
    // Most backend paths convert errors to the SPI shape, but the catalog loaders can surface the
    // raw HTTP error, so both shapes are recognized.
    const status = isUnexpectedResponseError(reason)
        ? reason.httpStatus
        : isHttpResponseError(reason)
          ? reason.response.status
          : undefined;

    return status !== undefined && COMPUTED_ATTRIBUTES_UNAVAILABLE_STATUSES.includes(status);
}

/**
 * Loads computed attributes for the given refs from the backend. Refs whose computed attribute is
 * missing or forbidden are silently dropped - callers treat whatever is not returned as missing,
 * mirroring how the label-based lookups behave. Any other failure (network, server, authentication)
 * is rethrown so it does not masquerade as incomplete metadata.
 *
 * @internal
 */
export async function loadComputedAttributesByRefs(
    backend: IAnalyticalBackend,
    workspace: string,
    refs: ObjRef[],
): Promise<IComputedAttributeMetadataObject[]> {
    if (!refs.length) {
        return [];
    }

    const service = backend.workspace(workspace).computedAttributes();
    const results = await Promise.allSettled(refs.map((ref) => service.getComputedAttribute(ref)));

    const unexpectedFailure = results.find(
        (result): result is PromiseRejectedResult =>
            result.status === "rejected" && !isComputedAttributesUnavailableError(result.reason),
    );
    if (unexpectedFailure) {
        throw unexpectedFailure.reason;
    }

    return results
        .filter(
            (result): result is PromiseFulfilledResult<IComputedAttributeMetadataObject> =>
                result.status === "fulfilled",
        )
        .map((result) => result.value);
}
