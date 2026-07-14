// (C) 2026 GoodData Corporation

import {
    type DashboardParameterMode,
    DashboardParameterModeValues,
    type IAutomationMetadataObjectDefinition,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IInsightParameterValue,
    type INumberParameterConstraints,
    type IParameterMetadataObject,
    type IdentifierRef,
    isIdentifierRef,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    exportParametersToValues,
    isAutomationSupportedParameterValue,
} from "../../../../_staging/automation/index.js";

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
    return stored.flatMap((row) => {
        if (!isAutomationSupportedParameterValue(row.value)) {
            return [];
        }
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
 * Stored export overrides ({@link IDashboardExportParameter}) carry the value as a string; it is
 * parsed back to a number and non-finite values are dropped. Title, mode and constraints are
 * re-derived from the current dashboard and workspace catalog, mirroring
 * {@link reconstructAutomationParametersFromValues}.
 *
 * @internal
 */
export function reconstructAutomationParametersFromExportParameters(
    stored: IDashboardExportParameter[],
    dashboardParameters: IDashboardParameter[],
    catalog: IParameterMetadataObject[],
): IAutomationParameter[] {
    return reconstructAutomationParametersFromValues(
        exportParametersToValues(stored),
        dashboardParameters,
        catalog,
    );
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
        // mirror the live-render precedence: runtimeOverride/insight value > dashboard value > default
        const effectiveValue = widgetValueByRef.get(refKey) ?? dashboardParameter?.value ?? defaultValue;
        result.push({
            ref,
            title: dashboardParameter?.label ?? workspaceParameter.title,
            value: isAutomationSupportedParameterValue(effectiveValue) ? effectiveValue : defaultValue,
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

/**
 * A param dropped from the *dashboard* is not stale: parameters are workspace-scoped, so only
 * removal from the workspace catalog counts.
 *
 * @internal
 */
export function hasStaleAlertParameters(
    stored: IInsightParameterValue[] | undefined,
    catalog: IParameterMetadataObject[],
): boolean {
    if (!stored?.length) {
        return false;
    }
    const catalogParameterIds = new Set(catalog.map((parameter) => parameter.id));
    return stored.some((parameter) => !alertParameterIsInCatalog(parameter, catalogParameterIds));
}

/**
 * Removes the parameters {@link hasStaleAlertParameters} flags as stale.
 *
 * @internal
 */
export function dropStaleAlertParameters(
    stored: IInsightParameterValue[],
    catalog: IParameterMetadataObject[],
): IInsightParameterValue[] {
    const catalogParameterIds = new Set(catalog.map((parameter) => parameter.id));
    return stored.filter((parameter) => alertParameterIsInCatalog(parameter, catalogParameterIds));
}

/**
 * Encodes the display-ready chip set back to the neutral export wire shape ({id, value:string,
 * title}). The full per-tab execution set (including `hidden` entries) is converted, not just the
 * visible chips, so the server resolver does not drop omitted parameters to the workspace default.
 *
 * @internal
 */
export function automationParametersToExportParameters(
    parameters: IAutomationParameter[],
): IDashboardExportParameter[] {
    return parameters.map((parameter) => ({
        id: parameter.ref.identifier,
        value: String(parameter.value),
        title: parameter.title,
    }));
}

/**
 * Encodes the per-tab execution sets to the neutral export wire shape, or `undefined` when
 * `shouldStore` is false (feature off / store-filters unchecked — signals "omit the field; use
 * latest defaults"). Inverse of {@link reconstructAutomationParametersFromExportParameters}.
 *
 * @internal
 */
export function toEffectiveParametersByTab(
    parametersByTab: Record<string, IAutomationParameter[]>,
    shouldStore: boolean,
): Record<string, IDashboardExportParameter[]> | undefined {
    if (!shouldStore) {
        return undefined;
    }
    const result: Record<string, IDashboardExportParameter[]> = {};
    for (const [tabId, parameters] of Object.entries(parametersByTab)) {
        result[tabId] = automationParametersToExportParameters(parameters);
    }
    return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * The single home for "does this export persist its parameters": widget schedules always do (they
 * have no store-filters checkbox), dashboard schedules follow the store-filters checkbox.
 *
 * @internal
 */
export function shouldStoreExportParameters(isWidgetSchedule: boolean, storeFilters = false): boolean {
    return isWidgetSchedule || storeFilters;
}

function alertParameterIsInCatalog(
    parameter: IInsightParameterValue,
    catalogParameterIds: Set<string>,
): boolean {
    return catalogParameterIds.has(parameter.ref.identifier);
}

function numberConstraints(
    workspaceParameter: IParameterMetadataObject | undefined,
): INumberParameterConstraints | undefined {
    return workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)
        ? workspaceParameter.definition.constraints
        : undefined;
}
