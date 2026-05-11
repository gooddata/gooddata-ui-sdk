// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";

import {
    type IDashboardParameter,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    insightParameters,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectCatalogParameters, selectCatalogParametersIsLoaded } from "../catalog/catalogSelectors.js";
import { selectEnableParameters } from "../config/configSelectors.js";
import { selectInsightByWidgetRef } from "../insights/insightsSelectors.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

import { type IDashboardParameterEntry } from "./parametersState.js";

const selectSelf = (state: DashboardState) => state.parameters;

const EMPTY_PARAMETERS: IDashboardParameter[] = [];

const selectPersistedParametersFromMeta: DashboardSelector<IDashboardParameter[]> = (state) =>
    state.meta?.persistedDashboard?.parameters ?? EMPTY_PARAMETERS;

/**
 * Returns the persisted-shape parameter entries currently held by the dashboard.
 *
 * @alpha
 */
export const selectDashboardParameters: DashboardSelector<IDashboardParameter[]> = createSelector(
    selectSelf,
    (state) => state.parameters.map((entry) => entry.parameter),
);

/**
 * Returns currently active parameter references.
 *
 * @alpha
 */
export const selectActiveParameterRefKeys: DashboardSelector<ReadonlySet<string>> = createSelector(
    selectDashboardParameters,
    (parameters) => new Set(parameters.map((parameter) => objRefToString(parameter.ref))),
);

/**
 * Returns the full per-parameter entries (persisted shape + ephemeral `runtimeOverride`).
 *
 * @internal
 */
export const selectDashboardParameterEntries: DashboardSelector<IDashboardParameterEntry[]> = createSelector(
    selectSelf,
    (state) => state.parameters,
);

/**
 * Returns a selector that yields the entry held by the dashboard for a given parameter ref,
 * or `undefined` if no such entry exists.
 *
 * @alpha
 */
export const selectDashboardParameterEntryByRef: (
    ref: ObjRef,
) => DashboardSelector<IDashboardParameterEntry | undefined> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectSelf, (state) =>
        state.parameters.find((item) => areObjRefsEqual(item.parameter.ref, ref)),
    ),
);

/**
 * Returns a selector that yields the current `runtimeOverride` for a given parameter ref,
 * or `undefined` if the dashboard does not hold an entry for that ref.
 *
 * @alpha
 */
export const selectParameterRuntimeOverrideByRef: (ref: ObjRef) => DashboardSelector<number | undefined> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(selectDashboardParameterEntryByRef(ref), (entry) => entry?.runtimeOverride),
    );

/**
 * Computes the dashboard parameters in the shape that would be persisted on save right now.
 *
 * @remarks
 * For resolved entries (catalog parameters loaded AND ref present), applies smart persistence:
 * `value` is dropped when equal to the workspace default and `label` is dropped when equal
 * to the parameter title. For non-resolved entries (catalog not loaded, gated off, or ref
 * missing), the persisted entry is passed through verbatim so we never compare against an
 * unknown workspace default.
 *
 * @internal
 */
export const selectSmartPersistedDashboardParameters: DashboardSelector<IDashboardParameter[]> =
    createSelector(
        selectDashboardParameterEntries,
        selectCatalogParameters,
        selectCatalogParametersIsLoaded,
        selectPersistedParametersFromMeta,
        (entries, workspaceParameters, isCatalogLoaded, persistedParameters) => {
            const persistedByRef = new Map(
                persistedParameters.map((parameter) => [objRefToString(parameter.ref), parameter]),
            );
            const workspaceByRef = new Map(workspaceParameters.map((wp) => [objRefToString(wp.ref), wp]));
            return entries.map((entry) => {
                const refKey = objRefToString(entry.parameter.ref);
                const workspaceParameter = isCatalogLoaded ? workspaceByRef.get(refKey) : undefined;
                if (!workspaceParameter) {
                    return persistedByRef.get(refKey) ?? entry.parameter;
                }
                return smartPersistResolvedEntry(entry, workspaceParameter);
            });
        },
    );

/**
 * Returns true if the dashboard parameters that would be persisted differ from the persisted version.
 *
 * @alpha
 */
export const selectIsParametersChanged: DashboardSelector<boolean> = createSelector(
    selectSmartPersistedDashboardParameters,
    selectPersistedParametersFromMeta,
    (smartPersisted, persisted) => !isEqual(smartPersisted, persisted),
);

/**
 * Returns the parameter values to inject into the widget's `IExecutionConfig.parameterValues`.
 *
 * @remarks
 * The result is the intersection of dashboard parameter entries and the parameters referenced
 * by the widget's insight (per `insightParameters`). Dashboard parameters not referenced by the
 * widget's insight are excluded so that adding/removing unrelated parameters does not invalidate
 * the widget's `defFingerprint`. Returns an empty array when `enableParameters` is off so
 * persisted parameter values cannot silently affect execution while the UI is hidden.
 *
 * @alpha
 */
export const selectEffectiveParameterValuesForWidget: (
    ref: ObjRef | undefined,
) => DashboardSelector<IInsightParameterValue[]> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(
        selectDashboardParameterEntries,
        selectInsightByWidgetRef(ref),
        selectEnableParameters,
        (entries, insight, isEnabled) => {
            if (!isEnabled || !insight) {
                return [];
            }
            const referencedRefs = new Set(
                insightParameters(insight).map((parameter) => objRefToString(parameter.ref)),
            );
            const result: IInsightParameterValue[] = [];
            for (const entry of entries) {
                if (entry.runtimeOverride === undefined) {
                    continue;
                }
                if (referencedRefs.has(objRefToString(entry.parameter.ref))) {
                    result.push({ ref: entry.parameter.ref, value: entry.runtimeOverride });
                }
            }
            return result;
        },
    ),
);

function smartPersistResolvedEntry(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject,
): IDashboardParameter {
    const workspaceDefault = isNumberParameterDefinition(workspaceParameter.definition)
        ? workspaceParameter.definition.defaultValue
        : undefined;
    const result: IDashboardParameter = {
        ref: entry.parameter.ref,
        parameterType: entry.parameter.parameterType,
        mode: entry.parameter.mode,
        ...labelOverride(entry, workspaceParameter),
    };
    if (entry.runtimeOverride === undefined || entry.runtimeOverride === workspaceDefault) {
        return result;
    }
    return { ...result, value: entry.runtimeOverride };
}

function labelOverride(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject,
): { label?: string } {
    if (entry.parameter.label && entry.parameter.label !== workspaceParameter.title) {
        return { label: entry.parameter.label };
    }
    return {};
}
