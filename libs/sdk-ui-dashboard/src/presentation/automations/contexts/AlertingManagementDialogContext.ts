// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type { IAutomationMetadataObject, IInsight, IUser, IWidget, ObjRef } from "@gooddata/sdk-model";

/**
 * Sub-context for the alerting management dialog.
 * The connector hydrates this from dashboard state.
 * The management dialog tree reads from this context instead of calling useDashboardSelector directly.
 *
 * @alpha
 */
export interface IAlertingManagementDialogContextValue {
    currentUser?: IUser;
    dashboardId?: string;
    dashboardTitle?: string;
    canManageWorkspace: boolean;
    isAlertDialogOpen: boolean;
    alertingDialogReturnFocusTo?: string;
    managementDialogContext: { widgetRef?: ObjRef };
    automationsInvalidationId?: number;
    isEmbedded: boolean;
    enableAccessibilityMode: boolean;
    getWidgetByRef: (ref: ObjRef | undefined) => IWidget | undefined;
    getInsightByWidgetRef: (ref: ObjRef | undefined) => IInsight | undefined;
    pauseAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
    resumeAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
}

const AlertingManagementDialogContext = createContext<IAlertingManagementDialogContextValue | undefined>(
    undefined,
);

export const AlertingManagementDialogContextProvider = AlertingManagementDialogContext.Provider;

/**
 * Reads the alerting management dialog context.
 *
 * A replacement for the alerting management dialog renders inside this context and reads the current
 * user, the dashboard it's rendered on, the widget/insight lookups (`getWidgetByRef`,
 * `getInsightByWidgetRef`), and the pause/resume callbacks from here.
 *
 * Some members exist to wire internal machinery (`automationsInvalidationId`, `managementDialogContext`)
 * and are not intended as a customization surface.
 *
 * @alpha
 */
export function useAlertingManagementDialogContext(): IAlertingManagementDialogContextValue {
    const ctx = useContext(AlertingManagementDialogContext);
    if (!ctx) {
        throw new Error(
            "useAlertingManagementDialogContext must be used within AlertingManagementDialogContextProvider",
        );
    }
    return ctx;
}
