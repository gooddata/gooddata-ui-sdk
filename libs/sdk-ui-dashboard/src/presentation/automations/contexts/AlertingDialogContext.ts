// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import type {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IInsight,
    IInsightParameterValue,
    IWidget,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * Sub-context for the alerting create/edit dialog.
 * Shape grows during Phase 2 migration as DefaultAlertingDialog and its hooks are migrated.
 *
 * The connector hydrates this from dashboard state and provides the CRUD callbacks.
 * The dialog reads from this context instead of calling useDashboardSelector directly.
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
}

const AlertingDialogContext = createContext<IAlertingDialogContextValue | undefined>(undefined);

export const AlertingDialogContextProvider = AlertingDialogContext.Provider;

export function useAlertingDialogContext(): IAlertingDialogContextValue {
    const ctx = useContext(AlertingDialogContext);
    if (!ctx) {
        throw new Error("useAlertingDialogContext must be used within AlertingDialogContextProvider");
    }
    return ctx;
}
