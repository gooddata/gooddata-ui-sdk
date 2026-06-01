// (C) 2026 GoodData Corporation

import { type AccessGranteeDetail } from "./index.js";

/**
 * Catalog object kinds that support per-object access management.
 *
 * @alpha
 */
export type ObjectPermissionsObjectKind = "attribute" | "fact" | "label";

/**
 * Tests whether the provided value is an {@link ObjectPermissionsObjectKind}.
 *
 * @param k - value to test
 * @alpha
 */
export const isObjectPermissionsObjectKind = (k: unknown): k is ObjectPermissionsObjectKind => {
    return k === "attribute" || k === "fact" || k === "label";
};

/**
 * Current access state for a single object: a flat list of grants. Grants reuse
 * the shared {@link AccessGranteeDetail} union.
 *
 * @alpha
 */
export interface IObjectAccessList {
    grants: AccessGranteeDetail[];
}
