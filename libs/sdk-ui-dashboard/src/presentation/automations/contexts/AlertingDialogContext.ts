// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import type {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IDashboardParameter,
    IInsight,
    IInsightParameterValue,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    IWidget,
    ObjRef,
} from "@gooddata/sdk-model";

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
    executionResultByRef: (ref: ObjRef | undefined) => { executionResult?: IExecutionResult } | undefined;
    /** Effective widget parameter values for the dialog's widget (replaces direct selectEffectiveParameterValuesForWidget read) */
    parameterValues: IInsightParameterValue[];
    /**
     * Effective dashboard parameters for the dialog's widget — the owning tab's parameters with any
     * runtime override folded in (replaces the direct selectEffectiveDashboardParametersForWidget
     * read in useAutomationAlertParameters).
     */
    dashboardParameters: IDashboardParameter[];
    commonDateFilterId?: string;
    dashboardEvaluationFrequency?: string;
    createAlert(alert: IAutomationMetadataObjectDefinition): Promise<IAutomationMetadataObject>;
    saveAlert(alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
    deleteAlert(alert: IAutomationMetadataObject): Promise<void>;
    /** The alert being edited; undefined when creating a new one. */
    alertToEdit?: IAutomationMetadataObject;
    /** Notification channels available as alert destinations. */
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    /** True while the dialog's initial data (automations) is still loading. */
    isLoading: boolean;
}

const AlertingDialogContext = createContext<IAlertingDialogContextValue | undefined>(undefined);

/**
 * Provides the alerting create/edit dialog context.
 *
 * The dashboard's connector mounts the original value. Exported so a context-decorator
 * component (`CustomAlertingDialogContextDecoratorComponent`) can re-provide a decorated value
 * read from `useAlertingDialogContext()`; it is not a way to run the dialog outside a dashboard.
 *
 * @alpha
 */
export const AlertingDialogContextProvider = AlertingDialogContext.Provider;

/**
 * Reads the alerting create/edit dialog context.
 *
 * A replacement for `AlertingDialogComponent` renders inside this context and reads the dialog's widget
 * and insight, the dashboard filter context it should apply, the alert being edited, the available
 * notification channels, and the create/save/delete callbacks from here.
 *
 * Some members exist to wire internal machinery (`executionResultByRef`, `parameterValues`,
 * `dashboardParameters`) and are not intended as a customization surface.
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
