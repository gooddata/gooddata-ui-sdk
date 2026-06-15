// (C) 2026 GoodData Corporation

import {
    type DashboardParameterMode,
    DashboardParameterModeValues,
    type IAutomationMetadataObjectDefinition,
    type IDashboardParameter,
    type IInsightParameterValue,
    type INumberParameterConstraints,
    type IParameterMetadataObject,
    type IdentifierRef,
    isIdentifierRef,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

/**
 * A workspace parameter resolved for display and editing inside an automation (alert/schedule)
 * dialog. The `value` is the current effective value the headless run will capture.
 *
 * @internal
 */
export interface IAutomationParameter {
    ref: IdentifierRef;
    title: string;
    value: number;
    mode: DashboardParameterMode;
    constraints?: INumberParameterConstraints;
}

/**
 * Stored {@link IInsightParameterValue} overrides carry only {ref, value}; title, mode and
 * constraints are re-derived from the current dashboard and workspace catalog.
 *
 * @internal
 */
export function reconstructAutomationParametersFromValues(
    stored: IInsightParameterValue[],
    dashboardParameters: IDashboardParameter[],
    catalog: IParameterMetadataObject[],
): IAutomationParameter[] {
    const dashboardByRef = new Map(
        dashboardParameters.map((parameter) => [objRefToString(parameter.ref), parameter]),
    );
    const workspaceByRef = new Map(catalog.map((parameter) => [objRefToString(parameter.ref), parameter]));
    return stored.map((row) => {
        const refKey = objRefToString(row.ref);
        const dashboardParameter = dashboardByRef.get(refKey);
        const workspaceParameter = workspaceByRef.get(refKey);
        const constraints = numberConstraints(workspaceParameter);
        return {
            ref: row.ref,
            title: dashboardParameter?.label ?? workspaceParameter?.title ?? row.ref.identifier,
            value: row.value,
            mode: dashboardParameter?.mode ?? DashboardParameterModeValues.ACTIVE,
            ...(constraints ? { constraints } : {}),
        };
    });
}

/**
 * Parameters of unsupported types are dropped (cannot be rendered/clamped). Dashboard-`hidden`
 * and `readonly` ones are dropped too — once added they would derive back to an invisible or
 * locked (undeletable) chip.
 *
 * @internal
 */
export function availableAutomationParameters(
    catalog: IParameterMetadataObject[],
    selected: IAutomationParameter[],
    dashboardParameters: IDashboardParameter[] = [],
    widgetParameterValues: IInsightParameterValue[] = [],
): IAutomationParameter[] {
    const selectedRefKeys = new Set(selected.map((parameter) => objRefToString(parameter.ref)));
    const dashboardByRef = new Map(
        dashboardParameters.map((parameter) => [objRefToString(parameter.ref), parameter]),
    );
    const widgetValueByRef = new Map(
        widgetParameterValues.map((row) => [objRefToString(row.ref), row.value]),
    );
    const result: IAutomationParameter[] = [];
    for (const workspaceParameter of catalog) {
        if (!isNumberParameterDefinition(workspaceParameter.definition)) {
            continue;
        }
        const { ref } = workspaceParameter;
        if (!isIdentifierRef(ref)) {
            continue;
        }
        const refKey = objRefToString(ref);
        const dashboardParameter = dashboardByRef.get(refKey);
        if (
            selectedRefKeys.has(refKey) ||
            dashboardParameter?.mode === DashboardParameterModeValues.HIDDEN ||
            dashboardParameter?.mode === DashboardParameterModeValues.READONLY
        ) {
            continue;
        }
        const { defaultValue, constraints } = workspaceParameter.definition;
        result.push({
            ref,
            title: dashboardParameter?.label ?? workspaceParameter.title,
            // mirror the live-render precedence: runtimeOverride/insight value > dashboard value > default
            value: widgetValueByRef.get(refKey) ?? dashboardParameter?.value ?? defaultValue,
            mode: DashboardParameterModeValues.ACTIVE,
            ...(constraints ? { constraints } : {}),
        });
    }
    return result;
}

/**
 * Returns a copy of the automation with `alert.execution.parameters` replaced. No-op when the
 * automation carries no alert.
 *
 * @internal
 */
export function setAlertExecutionParameters(
    automation: IAutomationMetadataObjectDefinition,
    parameters: IInsightParameterValue[],
): IAutomationMetadataObjectDefinition {
    if (!automation.alert) {
        return automation;
    }
    return {
        ...automation,
        alert: {
            ...automation.alert,
            execution: {
                ...automation.alert.execution,
                parameters,
            },
        },
    };
}

function numberConstraints(
    workspaceParameter: IParameterMetadataObject | undefined,
): INumberParameterConstraints | undefined {
    return workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)
        ? workspaceParameter.definition.constraints
        : undefined;
}
