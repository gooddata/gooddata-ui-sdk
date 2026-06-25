// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef } from "react";

import {
    type IAutomationMetadataObject,
    type IInsight,
    type IWidget,
    type ObjRef,
    isInsightWidget,
    isWidget,
} from "@gooddata/sdk-model";

import { saveAlert } from "../../../../model/commands/alerts.js";
import type { IDashboardAlertSaved } from "../../../../model/events/alerts.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import {
    selectEnableAccessibilityMode,
    selectIsEmbedded,
} from "../../../../model/store/config/configSelectors.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { selectDashboardId, selectDashboardTitle } from "../../../../model/store/meta/metaSelectors.js";
import { selectCanManageWorkspace } from "../../../../model/store/permissions/permissionsSelectors.js";
import { selectWidgetsMap } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    selectAlertingDialogReturnFocusTo,
    selectAutomationsInvalidationId,
    selectIsAlertingDialogOpen,
    selectIsAlertingManagementDialogContext,
} from "../../../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../../../model/store/user/userSelectors.js";
import type { IAlertingManagementDialogContextValue } from "../../contexts/AlertingManagementDialogContext.js";

import { sanitizeAutomationForSave } from "./sanitizeAutomationForSave.js";

export function useBuildAlertingManagementDialogContext(): IAlertingManagementDialogContextValue {
    const currentUser = useDashboardSelector(selectCurrentUser);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const isAlertDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen);
    const alertingDialogReturnFocusTo = useDashboardSelector(selectAlertingDialogReturnFocusTo);
    const managementDialogContext = useDashboardSelector(selectIsAlertingManagementDialogContext);
    const automationsInvalidationId = useDashboardSelector(selectAutomationsInvalidationId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const enableAccessibilityMode = useDashboardSelector(selectEnableAccessibilityMode);

    const widgetsMap = useDashboardSelector(selectWidgetsMap);
    const insightsMap = useDashboardSelector(selectInsightsMap);

    // Look widgets up through the ObjRefMap (same as selectWidgetByRef) so an
    // identifier-vs-URI ref mismatch between the stored alert and the dashboard
    // widget is bridged. A plain areObjRefsEqual scan would miss those.
    const getWidgetByRef = useCallback(
        (ref: ObjRef | undefined): IWidget | undefined => {
            if (!ref) {
                return undefined;
            }
            const found = widgetsMap.get(ref);
            return isWidget(found) ? found : undefined;
        },
        [widgetsMap],
    );

    const getInsightByWidgetRef = useCallback(
        (ref: ObjRef | undefined): IInsight | undefined => {
            if (!ref) {
                return undefined;
            }
            const widget = widgetsMap.get(ref);
            if (!isInsightWidget(widget)) {
                return undefined;
            }
            return insightsMap.get(widget.insight) ?? undefined;
        },
        [widgetsMap, insightsMap],
    );

    const pauseResolveRef = useRef<((alert: IAutomationMetadataObject) => void) | null>(null);
    const pauseRejectRef = useRef<((err: unknown) => void) | null>(null);
    const resumeResolveRef = useRef<((alert: IAutomationMetadataObject) => void) | null>(null);
    const resumeRejectRef = useRef<((err: unknown) => void) | null>(null);

    const pauseCommandProcessing = useDashboardCommandProcessing({
        commandCreator: saveAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.SAVED",
        onSuccess: (event: IDashboardAlertSaved) => {
            pauseResolveRef.current?.(event.payload.alert);
            pauseResolveRef.current = null;
            pauseRejectRef.current = null;
        },
        onError: (event) => {
            pauseRejectRef.current?.(event.payload.error);
            pauseResolveRef.current = null;
            pauseRejectRef.current = null;
        },
    });

    const resumeCommandProcessing = useDashboardCommandProcessing({
        commandCreator: saveAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.SAVED",
        onSuccess: (event: IDashboardAlertSaved) => {
            resumeResolveRef.current?.(event.payload.alert);
            resumeResolveRef.current = null;
            resumeRejectRef.current = null;
        },
        onError: (event) => {
            resumeRejectRef.current?.(event.payload.error);
            resumeResolveRef.current = null;
            resumeRejectRef.current = null;
        },
    });

    const pauseCommandProcessingRef = useRef(pauseCommandProcessing);
    pauseCommandProcessingRef.current = pauseCommandProcessing;

    const resumeCommandProcessingRef = useRef(resumeCommandProcessing);
    resumeCommandProcessingRef.current = resumeCommandProcessing;

    const pauseAlert = useCallback((alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject> => {
        return new Promise((resolve, reject) => {
            pauseResolveRef.current = resolve;
            pauseRejectRef.current = reject;
            pauseCommandProcessingRef.current.run(sanitizeAutomationForSave(alert));
        });
    }, []);

    const resumeAlert = useCallback(
        (alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject> => {
            return new Promise((resolve, reject) => {
                resumeResolveRef.current = resolve;
                resumeRejectRef.current = reject;
                resumeCommandProcessingRef.current.run(sanitizeAutomationForSave(alert));
            });
        },
        [],
    );

    return useMemo(
        () => ({
            currentUser,
            dashboardId,
            dashboardTitle,
            canManageWorkspace,
            isAlertDialogOpen,
            alertingDialogReturnFocusTo,
            managementDialogContext,
            automationsInvalidationId,
            isEmbedded,
            enableAccessibilityMode,
            getWidgetByRef,
            getInsightByWidgetRef,
            pauseAlert,
            resumeAlert,
        }),
        [
            currentUser,
            dashboardId,
            dashboardTitle,
            canManageWorkspace,
            isAlertDialogOpen,
            alertingDialogReturnFocusTo,
            managementDialogContext,
            automationsInvalidationId,
            isEmbedded,
            enableAccessibilityMode,
            getWidgetByRef,
            getInsightByWidgetRef,
            pauseAlert,
            resumeAlert,
        ],
    );
}
