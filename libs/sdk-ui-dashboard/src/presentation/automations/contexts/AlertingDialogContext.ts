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
 *
 * The connector hydrates this from dashboard state and provides the CRUD callbacks; the dialog and its
 * hooks read it instead of reaching into the dashboard store. That direction is enforced by the
 * `no-model-imports-in-clean-alerting` rule in `.dependency-cruiser.js`.
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
