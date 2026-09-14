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
    /** The logged-in user; from selectCurrentUser. Used to decide whether the user may edit/delete an alert they didn't create. */
    currentUser?: IUser;
    /** Id of the dashboard the management dialog is rendered on. Used to preselect the dashboard filter in the enhanced automations list. */
    dashboardId?: string;
    /** Title of the dashboard the management dialog is rendered on. Used as the label of the preselected dashboard filter in the enhanced automations list. */
    dashboardTitle?: string;
    /** Whether the current user may manage the workspace; from selectCanManageWorkspace. Combined with alert ownership to gate edit/delete. */
    canManageWorkspace: boolean;
    /**
     * Whether the alert create/edit dialog is currently open (from store UI slice).
     * Used by the management dialog's focus-return logic (refocus when the edit dialog closes).
     */
    isAlertDialogOpen: boolean;
    /** Element ID to return focus to when the alerting dialog closes; from selectAlertingDialogReturnFocusTo, read via useAlertingDialogAccessibility. */
    alertingDialogReturnFocusTo?: string;
    /** Widget the management dialog is scoped to, when opened for a single widget rather than the whole dashboard; from selectIsAlertingManagementDialogContext. */
    managementDialogContext: { widgetRef?: ObjRef };
    /**
     * Cache-bust counter for the automation list: reset to 0 when a management dialog opens,
     * incremented on invalidation. 0 means nothing has been invalidated since the dialog opened;
     * consumers reload when the value changes and is not 0.
     */
    automationsInvalidationId?: number;
    /**
     * Whether the dashboard is rendered in an embedded context.
     */
    isEmbedded: boolean;
    /**
     * Whether accessibility mode is active (for aria/keyboard focus management).
     */
    enableAccessibilityMode: boolean;
    /**
     * Alerts visible in the management dialog, scoped to the current dashboard context.
     */
    automations: IAutomationMetadataObject[];
    /**
     * True while the automation list is still loading.
     *
     * The automations load only — deliberately narrower than the scheduled-email management
     * context's flag, which also folds in a widget-filters load that has no bearing on a
     * management list.
     */
    isLoading: boolean;
    /** Looks up a dashboard widget (KPI, insight, rich text, or visualization-switcher) by ref, filtering out non-widget layout containers; bridges identifier↔URI ref mismatches the same way as selectWidgetByRef. */
    getWidgetByRef: (ref: ObjRef | undefined) => IWidget | undefined;
    /** Looks up the insight of an insight widget by the widget's ref; undefined for a non-insight widget. */
    getInsightByWidgetRef: (ref: ObjRef | undefined) => IInsight | undefined;
    /** Persists the given alert via the alerts save command; resolves with the saved alert, rejects with the command's error. */
    pauseAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
    /** Persists the given alert via the alerts save command; resolves with the saved alert, rejects with the command's error. Functionally identical to {@link IAlertingManagementDialogContextValue.pauseAlert} — distinguished only by name for call-site clarity. */
    resumeAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
}

const AlertingManagementDialogContext = createContext<IAlertingManagementDialogContextValue | undefined>(
    undefined,
);

/**
 * Provides the alerting management dialog context.
 *
 * The dashboard's connector mounts the original value. Exported so a context-decorator
 * component (`CustomAlertingManagementDialogContextDecoratorComponent`) can re-provide a decorated
 * value read from `useAlertingManagementDialogContext()`; it is not a way to run the management
 * dialog outside a dashboard.
 *
 * @alpha
 */
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
