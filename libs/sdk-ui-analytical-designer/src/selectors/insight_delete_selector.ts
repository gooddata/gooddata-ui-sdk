// (C) 2026 GoodData Corporation

import { createSelector } from "reselect";

import { type AccessGranularPermission, canEditVisualization } from "@gooddata/sdk-model";

import { getIsReadOnlyMode } from "../store/embedding/embedding_selectors.js";

import { enableVisualizationPermissions } from "./feature_flag_selector.js";
import { canManageProject, workspacePermissions } from "./permissions_selector.js";

export const shouldLoadListedInsightPermissions = createSelector(
    getIsReadOnlyMode,
    enableVisualizationPermissions,
    canManageProject,
    (isReadOnly, flagOn, isAdmin) => !isReadOnly && flagOn && !isAdmin,
);

// Delete needs the same right as Save. AI suggestions carry no lock or permissions to decide on.
export const canDeleteListedInsight = createSelector(
    getIsReadOnlyMode,
    workspacePermissions,
    enableVisualizationPermissions,
    (isReadOnly, workspacePermissions, flagOn) =>
        (insight: { isRelated?: boolean; isLocked?: boolean; permissions?: AccessGranularPermission[] }) =>
            !isReadOnly &&
            !insight.isRelated &&
            !insight.isLocked &&
            !!workspacePermissions &&
            canEditVisualization(insight.permissions, workspacePermissions, flagOn),
);
