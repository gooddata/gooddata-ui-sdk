// (C) 2025-2026 GoodData Corporation

import { type ObjRef, type ObjRefInScope, isLocalIdRef, localIdRef } from "@gooddata/sdk-model";

/**
 * Utility functions for converting dimensionality between different formats used in the application.
 *
 * The application uses three different dimensionality formats:
 * - AD format: Array\<string | ObjRef\> where strings are local identifiers
 * - SDK Model format: Array<ObjRefInScope> (localIdRef or ObjRef)
 * - UI Filters format: IDimensionalityItem[] (includes title and type metadata)
 */

/**
 * Converts dimensionality from AD format to SDK Model format.
 * AD format uses strings for local identifiers, SDK Model uses localIdRef objects.
 *
 * @param items - Dimensionality in AD format (string | ObjRef)[]
 * @returns Dimensionality in SDK Model format ObjRefInScope[] or undefined if empty
 */
export const toSdkModelDimensionality = (
    items: Array<string | ObjRef> | undefined,
): ObjRefInScope[] | undefined => {
    if (!items?.length) {
        return undefined;
    }
    return items.map((item) => (typeof item === "string" ? localIdRef(item) : item));
};

/**
 * Converts dimensionality from SDK Model format to AD format.
 * SDK Model uses localIdRef objects, AD format uses strings for local identifiers.
 *
 * @param items - Dimensionality in SDK Model format ObjRefInScope[]
 * @returns Dimensionality in AD format (string | ObjRef)[] or undefined if empty
 */
export const fromSdkModelDimensionality = (
    items: ObjRefInScope[] | undefined,
): Array<string | ObjRef> | undefined => {
    if (!items?.length) {
        return undefined;
    }
    return items.map((item) => (isLocalIdRef(item) ? item.localIdentifier : item));
};
