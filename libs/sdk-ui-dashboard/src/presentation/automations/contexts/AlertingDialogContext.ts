// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import type {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IInsight,
    IInsightParameterValue,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    IWidget,
    IWorkspaceUser,
    ObjRef,
} from "@gooddata/sdk-model";
import type { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * Sub-context for the alerting create/edit dialog.
 *
 * The connector hydrates this from dashboard state and provides the CRUD callbacks; the dialog and its
 * hooks read it instead of reaching into the dashboard store. That direction is enforced by the
 * `no-model-imports-in-clean-alerting` rule in `.dependency-cruiser.js`.
 *
 * @alpha
 */
export interface IAlertingDialogContextValue {
    mode: "create" | "edit";
    widget?: IWidget;
    insight?: IInsight;
    widgetTitle?: string;
    dashboardId?: string;
    dashboardFilters: FilterContextItem[];
    hiddenFilters: FilterContextItem[];
    widgetLocalIdToTabIdMap: Record<string, string>;
    executionResultByRef: (ref: ObjRef | undefined) => { executionResult?: IExecutionResult } | undefined;
    /** Effective widget parameter values for the dialog's widget (replaces direct selectEffectiveParameterValuesForWidget read) */
    parameterValues: IInsightParameterValue[];
    commonDateFilterId?: string;
    dashboardEvaluationFrequency?: string;
    createAlert(alert: IAutomationMetadataObjectDefinition): Promise<IAutomationMetadataObject>;
    saveAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
    deleteAlert(alert: IAutomationMetadataObject): Promise<void>;
    /** The alert being edited; undefined when creating a new one. */
    alertToEdit?: IAutomationMetadataObject;
    /**
     * Workspace users available as alert recipients. Loaded only while the create/edit dialog is
     * mounted, so opening the management dialog alone does not trigger the load.
     */
    users: IWorkspaceUser[];
    /** Error from loading workspace users, if any. */
    usersError?: GoodDataSdkError;
    /** Notification channels available as alert destinations. */
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    /** True while the dialog's initial data (automations, workspace users) is still loading. */
    isLoading: boolean;
}

const AlertingDialogContext = createContext<IAlertingDialogContextValue | undefined>(undefined);

export const AlertingDialogContextProvider = AlertingDialogContext.Provider;

/**
 * Reads the alerting create/edit dialog context.
 *
 * A replacement for `AlertingDialogComponent` renders inside this context and reads the dialog's widget
 * and insight, the dashboard filter context it should apply, the alert being edited, the available
 * workspace users and notification channels, and the create/save/delete callbacks from here.
 *
 * Some members exist to wire internal machinery (`executionResultByRef`, `widgetLocalIdToTabIdMap`,
 * `parameterValues`) and are not intended as a customization surface.
 *
 * @alpha
 */
export function useAlertingDialogContext(): IAlertingDialogContextValue {
    const ctx = useContext(AlertingDialogContext);
    if (!ctx) {
        throw new Error("useAlertingDialogContext must be used within AlertingDialogContextProvider");
    }
    return ctx;
}
