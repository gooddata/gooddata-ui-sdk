// (C) 2026 GoodData Corporation

import { type IdentifierRef, idRef, newMeasure } from "@gooddata/sdk-model";

import { type IAlertingDialogContextValue } from "../../contexts/AlertingDialogContext.js";
import {
    AUTOMATIONS_CONTEXT as SHARED_AUTOMATIONS_CONTEXT,
    CURRENT_USER as SHARED_CURRENT_USER,
    NEXT_FILTER as SHARED_NEXT_FILTER,
    SENTINEL_CHANNEL as SHARED_SENTINEL_CHANNEL,
    SENTINEL_WIDGET as SHARED_SENTINEL_WIDGET,
    WORKSPACE_PARAMETER as SHARED_WORKSPACE_PARAMETER,
} from "../../shared/test/fixtures.js";
import { type AlertMetric } from "../types.js";

export const AUTOMATIONS_CONTEXT = SHARED_AUTOMATIONS_CONTEXT;
export const CURRENT_USER = SHARED_CURRENT_USER;
export const NEXT_FILTER = SHARED_NEXT_FILTER;
export const SENTINEL_CHANNEL = SHARED_SENTINEL_CHANNEL;
export const SENTINEL_WIDGET = SHARED_SENTINEL_WIDGET;
export const WORKSPACE_PARAMETER = SHARED_WORKSPACE_PARAMETER;

export const SENTINEL_MEASURE: AlertMetric = {
    measure: newMeasure("m1", (m) => m.localId("m1")),
    isPrimary: true,
    comparators: [],
};

// A catalog parameter with a matching workspace definition, so a stored `{ref, value}` override
// survives `reconstructAutomationParametersFromValues` instead of being dropped as unresolvable.
export const PARAMETER_REF: IdentifierRef = idRef("param-1", "parameter");

export const ALERTING_DIALOG_CONTEXT: IAlertingDialogContextValue = {
    mode: "create",
    widget: SENTINEL_WIDGET,
    insight: undefined,
    widgetTitle: undefined,
    dashboardId: undefined,
    dashboardFilters: [],
    hiddenFilters: [],
    executionResultByRef: () => undefined,
    parameterValues: [],
    dashboardParameters: [],
    commonDateFilterId: undefined,
    dashboardEvaluationFrequency: undefined,
    createAlert: () => Promise.reject(new Error("not wired in tests")),
    saveAlert: () => Promise.reject(new Error("not wired in tests")),
    deleteAlert: () => Promise.resolve(),
    alertToEdit: undefined,
    notificationChannels: [SENTINEL_CHANNEL],
    isLoading: false,
};
