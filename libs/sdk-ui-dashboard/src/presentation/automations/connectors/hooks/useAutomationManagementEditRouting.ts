// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { buildAutomationUrl, navigate, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectExternalRecipient,
    selectIsEmbedded,
    selectSettings,
} from "../../../../model/store/config/configSelectors.js";
import { selectDashboardId } from "../../../../model/store/meta/metaSelectors.js";
import { computeUseHostRoute } from "../../shared/utils/automationUtils.js";

/**
 * Handles cross-dashboard edit routing for automation management dialogs.
 *
 * When the automation belongs to a different dashboard, navigates there directly.
 * Otherwise falls back to `onLocalEdit`.
 *
 * @internal
 */
export function useAutomationManagementEditRouting(
    onLocalEdit: (automation: IAutomationMetadataObject) => void,
): (automation: IAutomationMetadataObject) => void {
    const workspace = useWorkspaceStrict();
    const dashboardId = useDashboardSelector(selectDashboardId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const settings = useDashboardSelector(selectSettings);
    const useHostRoute = computeUseHostRoute(settings);

    return useCallback(
        (automation: IAutomationMetadataObject) => {
            const targetDashboardId = automation.dashboard?.id;

            if (targetDashboardId && targetDashboardId !== dashboardId) {
                navigate(
                    buildAutomationUrl({
                        workspaceId: workspace,
                        dashboardId: targetDashboardId,
                        automationId: automation.id,
                        isEmbedded,
                        useHostRoute,
                        queryParams: externalRecipientOverride
                            ? { recipient: externalRecipientOverride }
                            : undefined,
                    }),
                );
                return;
            }
            onLocalEdit(automation);
        },
        [onLocalEdit, dashboardId, workspace, isEmbedded, useHostRoute, externalRecipientOverride],
    );
}
