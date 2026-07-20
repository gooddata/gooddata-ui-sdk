// (C) 2026 GoodData Corporation

import {
    type DashboardParameterMode,
    DashboardParameterModeValues,
    type IAutomationMetadataObjectDefinition,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IInsightParameterValue,
    type IParameterDefinition,
    type IParameterMetadataObject,
    type IdentifierRef,
    type ParameterValue,
    isIdentifierRef,
    objRefToString,
    parameterValueMatchesType,
    sanitizeParameterValue,
} from "@gooddata/sdk-model";

import { exportParametersToValues } from "../../../../_staging/automation/index.js";

/**
 * A workspace parameter resolved for display and editing inside an automation (alert/schedule)
 * dialog. The `value` is the current effective value the headless run will capture; `definition`
 * picks which control renders.
 *
 * @internal
 */
export interface IAutomationParameter {
    ref: IdentifierRef;
    title: string;
    value: ParameterValue;
    mode: DashboardParameterMode;
    definition: IParameterDefinition;
}

/**
 * Stored {@link IInsightParameterValue} overrides carry only {ref, value}; title, mode and
 * definition are re-derived from the current dashboard and workspace catalog. Rows without a
 * resolvable definition (see {@link resolveParameterDefinition}) are dropped.
 *
 * @internal
 */
export function reconstructAutomationParametersFromValues(
    stored: IInsightParameterValue[],
    dashboardParameters: IDashboardParameter[],
    catalog: IParameterMetadataObject[],
    isStringParametersEnabled: boolean,
): IAutomationParameter[] {
    const dashboardByRef = new Map(
        dashboardParameters.map((parameter) => [objRefToString(parameter.ref), parameter]),
    );
    const workspaceByRef = new Map(catalog.map((parameter) => [objRefToString(parameter.ref), parameter]));
    return stored.flatMap((row) => {
        const refKey = objRefToString(row.ref);
        const dashboardParameter = dashboardByRef.get(refKey);
        const workspaceParameter = workspaceByRef.get(refKey);
        const definition = resolveParameterDefinition(
            workspaceParameter,
            row.value,
            isStringParametersEnabled,
        );
        if (!definition) {
            return [];
        }
        return {
            ref: row.ref,
            title: dashboardParameter?.label ?? workspaceParameter?.title ?? row.ref.identifier,
            value: row.value,
            mode: dashboardParameter?.mode ?? DashboardParameterModeValues.ACTIVE,
            definition,
        };
    });
}

/**
 * Stored export overrides ({@link IDashboardExportParameter}) carry the value as a string; it is
 * decoded back by the row's own type tag (see `exportParametersToValues`). Title, mode and
 * definition are re-derived from the current dashboard and workspace catalog, mirroring
 * {@link reconstructAutomationParametersFromValues}.
 *
 * @internal
 */
export function reconstructAutomationParametersFromExportParameters(
    stored: IDashboardExportParameter[],
    dashboardParameters: IDashboardParameter[],
    catalog: IParameterMetadataObject[],
    isStringParametersEnabled: boolean,
): IAutomationParameter[] {
    return reconstructAutomationParametersFromValues(
        exportParametersToValues(stored, isStringParametersEnabled),
        dashboardParameters,
        catalog,
        isStringParametersEnabled,
    );
}

/**
 * Dashboard-`hidden` and `readonly` parameters are dropped — once added they would derive back to
 * an invisible or locked (undeletable) parameter. Catalog STRING parameters are dropped too while
 * `isStringParametersEnabled` is off.
 *
 * @internal
 */
export function availableAutomationParameters(
    catalog: IParameterMetadataObject[],
    selected: IAutomationParameter[],
    dashboardParameters: IDashboardParameter[] = [],
    widgetParameterValues: IInsightParameterValue[] = [],
    isStringParametersEnabled: boolean,
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
        const { ref, definition } = workspaceParameter;
        if (!isIdentifierRef(ref) || (definition.type === "STRING" && !isStringParametersEnabled)) {
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
        // mirror the live-render precedence: runtimeOverride/insight value > dashboard value > default
        const effectiveValue =
            widgetValueByRef.get(refKey) ?? dashboardParameter?.value ?? definition.defaultValue;
        result.push({
            ref,
            title: dashboardParameter?.label ?? workspaceParameter.title,
            value: sanitizeParameterValue(definition, effectiveValue),
            mode: DashboardParameterModeValues.ACTIVE,
            definition,
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
 * removal from the workspace catalog counts — as does a parameter recreated with the same id but
 * the other type, where the decoded value kind disagrees with the current definition.
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
    const catalogById = new Map(catalog.map((parameter) => [parameter.id, parameter]));
    return stored.some((parameter) => !alertParameterMatchesCatalog(parameter, catalogById));
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
    const catalogById = new Map(catalog.map((parameter) => [parameter.id, parameter]));
    return stored.filter((parameter) => alertParameterMatchesCatalog(parameter, catalogById));
}

/**
 * Encodes the display-ready parameter set back to the neutral export wire shape ({id, value:string,
 * title, parameterType}). The full per-tab execution set (including `hidden` entries) is converted, not just the
 * visible ones, so the server resolver does not drop omitted parameters to the workspace default.
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
        parameterType: parameter.definition.type,
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

function alertParameterMatchesCatalog(
    parameter: IInsightParameterValue,
    catalogById: Map<string, IParameterMetadataObject>,
): boolean {
    const workspaceParameter = catalogById.get(parameter.ref.identifier);
    return !!workspaceParameter && parameterValueMatchesType(workspaceParameter.definition, parameter.value);
}

/**
 * Every parameter needs a definition — its `type` picks which control renders. The workspace
 * parameter definition is the source of truth; when its type disagrees with the stored value the
 * parameter was recreated as the other type, so the parameter is dropped.
 */
function resolveParameterDefinition(
    workspaceParameter: IParameterMetadataObject | undefined,
    value: ParameterValue,
    isStringParametersEnabled: boolean,
): IParameterDefinition | undefined {
    const definition = workspaceParameter?.definition;
    if (definition) {
        if (definition.type === "STRING" && !isStringParametersEnabled) {
            return undefined;
        }
        return parameterValueMatchesType(definition, value) ? definition : undefined;
    }
    // Deleted workspace parameter: synthesize a definition from the value so the parameter stays
    // editable (the constraint-less M1 fallback). Its `defaultValue` is a shape-filling
    // placeholder — rely only on `type`. STRING synthesis is gated the same way as the catalog
    // branch above.
    if (typeof value === "number") {
        return { type: "NUMBER", defaultValue: value };
    }
    return isStringParametersEnabled ? { type: "STRING", defaultValue: value } : undefined;
}
