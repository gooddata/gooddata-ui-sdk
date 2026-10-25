// (C) 2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    type IWorkspacePermissions,
    canEditMetric,
    canCreateMetric as evaluateCanCreateMetric,
} from "@gooddata/sdk-model";

import { getMetricPermissionsByIdentifier } from "../store/catalog/catalog_selector.js";
import { type IAppState } from "../store/types.js";

import { enableMetricPermissions } from "./feature_flag_selector.js";
import { workspacePermissions } from "./permissions_selector.js";

/**
 * Kept out of permissions_selector, which mirrors the backend permissions and cannot import
 * feature_flag_selector without closing a cycle through bootstrap_selector.
 */
export const canCreateMetric = createSelector(
    workspacePermissions,
    enableMetricPermissions,
    (permissions, metricPermissionsEnabled) =>
        permissions ? evaluateCanCreateMetric(permissions, metricPermissionsEnabled) : false,
);

/**
 * Workspace permissions carrying canCreateMetric as the effective capability rather than the raw
 * backend permission, for anything that consumes the permissions object as a whole.
 */
export const effectiveWorkspacePermissions = createSelector(
    workspacePermissions,
    canCreateMetric,
    (permissions, canCreate): IWorkspacePermissions | null =>
        permissions ? { ...permissions, canCreateMetric: canCreate } : permissions,
);

/** Whether the metric a catalog item stands for may be edited. */
export function canEditCatalogMetric(state: IAppState, identifier: string | undefined): boolean {
    const permissions = effectiveWorkspacePermissions(state);
    if (permissions === null) {
        return false;
    }
    const enabled = enableMetricPermissions(state);
    const metricPermissions =
        enabled && identifier ? getMetricPermissionsByIdentifier(state).get(identifier) : undefined;
    return canEditMetric(metricPermissions, permissions, enabled);
}
