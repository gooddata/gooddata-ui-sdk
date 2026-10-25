// (C) 2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { canShareVisualization, idRef } from "@gooddata/sdk-model";

import { isHostedComponentSelector } from "../appMode/appMode.js";

import { enableVisualizationPermissions } from "./feature_flag_selector.js";
import { getIsEmbedded } from "./meta_selector.js";
import { canCreateNewVisualization, workspacePermissions } from "./permissions_selector.js";
import {
    getLastSavedReportIdentifier,
    getLastSavedReportPermissions,
    isReportSavedSelector,
} from "./report_selector.js";

export const insightPermissionsTarget = (identifier: string): IObjectPermissionsObject => ({
    kind: "insight",
    ref: idRef(identifier, "insight"),
});

export const insightAccessTarget = createSelector(
    isReportSavedSelector,
    getLastSavedReportIdentifier,
    (isSaved, identifier): IObjectPermissionsObject | undefined =>
        isSaved && identifier ? insightPermissionsTarget(identifier) : undefined,
);

// Embedded and dashboard-hosted editors leave sharing to their host.
export const canManageInsightAccess = createSelector(
    enableVisualizationPermissions,
    getIsEmbedded,
    isHostedComponentSelector,
    insightAccessTarget,
    getLastSavedReportPermissions,
    workspacePermissions,
    canCreateNewVisualization,
    (flagOn, isEmbedded, isHosted, target, permissions, workspacePermissions, canCreate): boolean => {
        if (!flagOn || isEmbedded || isHosted || !workspacePermissions) {
            return false;
        }
        return target ? canShareVisualization(permissions, workspacePermissions, flagOn) : canCreate;
    },
);
