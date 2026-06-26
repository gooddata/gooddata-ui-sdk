// (C) 2026 GoodData Corporation

import {
    DashboardParameterModeValues,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IDashboardTab,
    type IInsight,
    type IInsightDefinition,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type IdentifierRef,
    type ObjRef,
    insightMeasures,
    insightParameters,
    isMeasureDefinition,
    isNumberParameterDefinition,
    isValidNumberParameterValue,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { type IInsightWidgetTabContext } from "../layout/layoutSelectors.js";
import { type ITabState } from "../tabsState.js";

import {
    type IDashboardParameterEntry,
    parametersInitialState,
    pickTabParametersSource,
} from "./parametersState.js";

const EMPTY_PARAMETERS: IDashboardParameter[] = [];
const EMPTY_PARAMETER_VALUES: IInsightParameterValue[] = [];
/**
 * @internal
 */
export const EMPTY_EXPORT_PARAMETERS_BY_TAB: Record<string, IDashboardExportParameter[]> = {};

/**
 * Walks the insight's metric buckets and returns the parameter refs they reference,
 * deduped by ref string. The order matches the first occurrence in the measure traversal.
 *
 * @internal
 */
export function collectReferencedParameterRefs(
    insight: IInsightDefinition,
    measureParameters: Record<string, IdentifierRef[]>,
): IdentifierRef[] {
    const seen = new Set<string>();
    const result: IdentifierRef[] = [];
    for (const measure of insightMeasures(insight)) {
        const def = measure.measure.definition;
        if (!isMeasureDefinition(def)) {
            continue;
        }
        const refs = measureParameters[objRefToString(def.measureDefinition.item)] ?? [];
        for (const ref of refs) {
            const key = objRefToString(ref);
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            result.push(ref);
        }
    }
    return result;
}

/**
 * Effective execution parameters, limited to `referencedRefs`. Precedence per ref: the dashboard
 * `runtimeOverride`, else the insight's own parameter value, else nothing (backend uses the workspace
 * default). An out-of-range value from either source is replaced by the workspace default (recovery),
 * so the backend never receives a bad value.
 *
 * @internal
 */
export function resolveEffectiveParameterValuesForRefs(
    entries: IDashboardParameterEntry[],
    referencedRefs: IdentifierRef[],
    insightParameterValues: IInsightParameterValue[],
    workspaceParameterByRef: Map<string, IParameterMetadataObject>,
): IInsightParameterValue[] {
    const referencedKeys = new Set(referencedRefs.map(objRefToString));
    const result: IInsightParameterValue[] = [];
    const seen = new Set<string>();
    for (const entry of entries) {
        const { runtimeOverride } = entry;
        if (runtimeOverride === undefined) {
            continue;
        }
        const refKey = objRefToString(entry.parameter.ref);
        if (!referencedKeys.has(refKey)) {
            continue;
        }
        result.push({
            ref: entry.parameter.ref,
            value: recoverParameterExecutionValue(runtimeOverride, workspaceParameterByRef.get(refKey)),
        });
        seen.add(refKey);
    }
    for (const insightParameterValue of insightParameterValues) {
        const refKey = objRefToString(insightParameterValue.ref);
        if (!referencedKeys.has(refKey) || seen.has(refKey)) {
            continue;
        }
        result.push({
            ref: insightParameterValue.ref,
            value: recoverParameterExecutionValue(
                insightParameterValue.value,
                workspaceParameterByRef.get(refKey),
            ),
        });
        seen.add(refKey);
    }
    return result.length === 0 ? EMPTY_PARAMETER_VALUES : result;
}

interface IParameterResolutionContext {
    entries: IDashboardParameterEntry[];
    measureParameters: Record<string, IdentifierRef[]>;
    workspaceParameterByRef: Map<string, IParameterMetadataObject>;
}

/**
 * Effective execution parameters for `insight` given a widget's parameter context: resolves the refs
 * the insight references, then applies {@link resolveEffectiveParameterValuesForRefs}.
 *
 * @internal
 */
export function resolveEffectiveParameterValuesForInsight(
    context: IParameterResolutionContext | undefined,
    insight: IInsightDefinition,
): IInsightParameterValue[] {
    if (!context) {
        return EMPTY_PARAMETER_VALUES;
    }
    const referencedRefs = collectReferencedParameterRefs(insight, context.measureParameters);
    return resolveEffectiveParameterValuesForRefs(
        context.entries,
        referencedRefs,
        insightParameters(insight),
        context.workspaceParameterByRef,
    );
}

/**
 * Returns the entries whose `runtimeOverride` deviates from the hydrated baseline
 * ({@link computeHydratedRuntimeOverride}). Entries still at their default are dropped, so callers never
 * propagate a value the user did not explicitly set.
 *
 * @internal
 */
export function collectChangedParameterValues(
    entries: IDashboardParameterEntry[],
    workspaceParameters: IParameterMetadataObject[],
): IInsightParameterValue[] {
    const workspaceParameterByRef = buildWorkspaceParametersByRef(workspaceParameters);
    const result: IInsightParameterValue[] = [];
    for (const entry of entries) {
        const { runtimeOverride } = entry;
        if (runtimeOverride === undefined) {
            continue;
        }
        const workspaceParameter = workspaceParameterByRef.get(objRefToString(entry.parameter.ref));
        if (runtimeOverride === computeHydratedRuntimeOverride(entry.parameter, workspaceParameter)) {
            continue;
        }
        result.push({ ref: entry.parameter.ref, value: runtimeOverride });
    }
    return result;
}

/**
 * The value hydration seeds into `runtimeOverride`: the dashboard parameter's `value`, else the
 * workspace number default, else `undefined`. Single source of truth for the hydrated baseline so
 * override detection here and in `hydrateParameterEntries` cannot drift apart.
 *
 * @internal
 */
export function computeHydratedRuntimeOverride(
    parameter: IDashboardParameter,
    workspaceParameter: IParameterMetadataObject | undefined,
): number | undefined {
    if (parameter.value !== undefined) {
        return parameter.value;
    }
    return workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)
        ? workspaceParameter.definition.defaultValue
        : undefined;
}

/**
 * The value to execute for a runtime override: an out-of-range NUMBER value is replaced by the
 * workspace default so the dashboard renders the default instead of failing (recovery), while the
 * chip keeps showing the user's saved value. In-range values, and values with no NUMBER definition to
 * validate against (removed / incompatible — meant to surface as the standard widget error), pass
 * through unchanged.
 *
 * @internal
 */
function recoverParameterExecutionValue(
    runtimeOverride: number,
    workspaceParameter: IParameterMetadataObject | undefined,
): number {
    if (workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)) {
        const { defaultValue, constraints } = workspaceParameter.definition;
        if (!isValidNumberParameterValue(runtimeOverride, constraints)) {
            return defaultValue;
        }
    }
    return runtimeOverride;
}

/**
 * Why a dashboard parameter no longer matches its workspace catalog entry:
 * - `removed`: the workspace has no parameter for this ref.
 * - `incompatible`: the workspace parameter is a different type (e.g. STRING, not NUMBER).
 * - `reset`: same type, but the value is outside the workspace constraints.
 *
 * @internal
 */
export type ParameterReconciliation = "reset" | "removed" | "incompatible";

/**
 * A mismatched dashboard parameter surfaced to the load-time toast: the ref, a display name, and
 * the kind of mismatch.
 *
 * @internal
 */
export interface IParameterReconciliationEntry {
    ref: ObjRef;
    name: string;
    kind: ParameterReconciliation;
}

/**
 * Classifies one dashboard parameter against its workspace catalog entry — the single source of
 * truth for the reconciliation kinds.
 *
 * Callers must only classify once the catalog is loaded: before load every `workspaceParameter` is
 * `undefined`, which would classify as `removed` and flag every parameter. The reconciliation
 * selectors own that gate (`isCatalogLoaded`).
 *
 * @internal
 */
export function classifyParameterReconciliation(
    dashboardParameter: IDashboardParameter,
    workspaceParameter: IParameterMetadataObject | undefined,
): ParameterReconciliation | undefined {
    if (!workspaceParameter) {
        return "removed";
    }
    if (!isNumberParameterDefinition(workspaceParameter.definition)) {
        return "incompatible";
    }
    if (
        dashboardParameter.value !== undefined &&
        !isValidNumberParameterValue(dashboardParameter.value, workspaceParameter.definition.constraints)
    ) {
        return "reset";
    }
    return undefined;
}

/**
 * Collects the entries that no longer reconcile, deduped by ref — the first failing entry per ref
 * wins, so a ref in range on one tab but out of range on another is still surfaced. Callers pass
 * entries from a known-loaded catalog.
 *
 * @internal
 */
export function collectParameterReconciliations(
    entries: IDashboardParameterEntry[],
    workspaceParameters: IParameterMetadataObject[],
): IParameterReconciliationEntry[] {
    const workspaceParameterByRef = buildWorkspaceParametersByRef(workspaceParameters);
    const result: IParameterReconciliationEntry[] = [];
    const seen = new Set<string>();
    for (const entry of entries) {
        const refKey = objRefToString(entry.parameter.ref);
        if (seen.has(refKey)) {
            continue;
        }
        const workspaceParameter = workspaceParameterByRef.get(refKey);
        const kind = classifyParameterReconciliation(entry.parameter, workspaceParameter);
        if (kind === undefined) {
            continue;
        }
        seen.add(refKey);
        result.push({
            ref: entry.parameter.ref,
            name: resolveParameterTitle(entry.parameter, workspaceParameter),
            kind,
        });
    }
    return result;
}

/**
 * Display title for a dashboard parameter: `parameter.label` → workspace title → `ref.identifier`.
 *
 * @internal
 */
export function resolveParameterTitle(
    parameter: IDashboardParameter,
    workspaceParameter: IParameterMetadataObject | undefined,
): string {
    return parameter.label || workspaceParameter?.title || parameter.ref.identifier;
}

/**
 * Indexes the workspace parameter catalog by ref string for O(1) lookup.
 *
 * @internal
 */
export function buildWorkspaceParametersByRef(
    workspaceParameters: IParameterMetadataObject[],
): Map<string, IParameterMetadataObject> {
    return new Map(workspaceParameters.map((parameter) => [objRefToString(parameter.ref), parameter]));
}

/**
 * Folds an entry's ephemeral `runtimeOverride` into the persisted parameter shape's `value`.
 *
 * @internal
 */
export function applyRuntimeOverride(entry: IDashboardParameterEntry): IDashboardParameter {
    if (entry.runtimeOverride === undefined) {
        return entry.parameter;
    }
    return { ...entry.parameter, value: entry.runtimeOverride };
}

/**
 * Resolves a single parameter entry to the export wire shape. Returns `undefined` for entries with
 * no `runtimeOverride` — the dashboard's persisted parameter state and the workspace default are
 * applied by the backend on its own, and insight-level `insight.parameters` are applied per-insight
 * by the backend; sending a row in those cases would override the backend's resolution with a stale
 * FE snapshot (matches the live-render path in `selectEffectiveParameterValuesForWidget`).
 *
 * An out-of-range value is replaced by the workspace default (recovery): unlike the live AFM, an
 * omitted export override falls back to the *persisted* (bad) value, so the default must be sent
 * explicitly to override it.
 *
 * Title precedence (when a row is emitted): `parameter.label` → workspace title → `ref.identifier`.
 *
 * @internal
 */
export function formatDashboardParameter(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject | undefined,
): IDashboardExportParameter | undefined {
    const { runtimeOverride } = entry;
    if (runtimeOverride === undefined) {
        return undefined;
    }
    return {
        id: entry.parameter.ref.identifier,
        value: String(recoverParameterExecutionValue(runtimeOverride, workspaceParameter)),
        title: resolveParameterTitle(entry.parameter, workspaceParameter),
    };
}

/**
 * Resolves the persisted shape of a parameter entry against its workspace catalog parameter.
 * Drops `value` when it equals the workspace default; drops `label` when it equals the workspace title.
 *
 * @internal
 */
export function smartPersistResolvedEntry(
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

/**
 * Builds the persisted-parameter lookup keyed by tab and then by ref string. Honors V1 → per-tab
 * migration: when no tab in the persisted dashboard carries `parameters`, the persisted root
 * `parameters` is used as fallback for every tab.
 *
 * @internal
 */
export function buildPersistedByTabAndRef(
    persistedTabs: ReadonlyArray<IDashboardTab>,
    rootPersistedParameters: IDashboardParameter[],
): Map<string, Map<string, IDashboardParameter>> {
    const result = new Map<string, Map<string, IDashboardParameter>>();
    for (const tab of persistedTabs) {
        const sourceParameters =
            pickTabParametersSource(tab, persistedTabs, rootPersistedParameters) ?? EMPTY_PARAMETERS;
        result.set(
            tab.localIdentifier,
            new Map(sourceParameters.map((parameter) => [objRefToString(parameter.ref), parameter])),
        );
    }
    return result;
}

/**
 * Returns `undefined` when reset would be a no-op: missing/non-number workspace parameter, or
 * in edit mode when `parameter.value` is unset / already equals the workspace default.
 *
 * @internal
 */
export function computeParameterResetValue(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject | undefined,
    isInEditMode: boolean,
): number | undefined {
    if (!workspaceParameter || !isNumberParameterDefinition(workspaceParameter.definition)) {
        return undefined;
    }
    const workspaceDefault = workspaceParameter.definition.defaultValue;
    const dashboardOverride = entry.parameter.value;
    if (isInEditMode) {
        if (dashboardOverride === undefined || dashboardOverride === workspaceDefault) {
            return undefined;
        }
        return workspaceDefault;
    }
    return dashboardOverride ?? workspaceDefault;
}

/**
 * Only `mode: "active"` entries with a defined `runtimeOverride` are considered resettable;
 * HIDDEN and READONLY entries are skipped, and entries with `runtimeOverride === undefined`
 * (chip hidden, execution falls back to `insight.parameters`) are preserved as-is — symmetric
 * with per-chip behavior in `DashboardParameterFilter`.
 *
 * @internal
 */
export function computeParameterResetTargets(
    entries: IDashboardParameterEntry[],
    workspaceParameters: IParameterMetadataObject[],
    isInEditMode: boolean,
): { ref: IDashboardParameterEntry["parameter"]["ref"]; value: number | undefined }[] {
    const workspaceParameterByRef = buildWorkspaceParametersByRef(workspaceParameters);
    const result: { ref: IDashboardParameterEntry["parameter"]["ref"]; value: number | undefined }[] = [];
    for (const entry of entries) {
        if (entry.parameter.mode !== DashboardParameterModeValues.ACTIVE) {
            continue;
        }
        if (entry.runtimeOverride === undefined) {
            continue;
        }
        const workspaceParameter = workspaceParameterByRef.get(objRefToString(entry.parameter.ref));
        const resetValue = computeParameterResetValue(entry, workspaceParameter, isInEditMode);
        if (resetValue !== undefined && resetValue !== entry.runtimeOverride) {
            result.push({ ref: entry.parameter.ref, value: resetValue });
        }
    }
    return result;
}

/**
 * Folds per-tab ref selections into the wire shape, dropping entries without a
 * `runtimeOverride`. Each selection pairs a tab with an optional ref restriction:
 * `allowedRefs === undefined` selects all refs (whole-dashboard scope); a defined set restricts
 * entries to those refs (widget scope). Tabs that yield no rows are omitted from the result.
 *
 * @internal
 */
export function collectExportOverrides(
    tabRefSelections: ReadonlyArray<{ tab: ITabState; allowedRefs?: Set<string> }>,
    workspaceParameterByRef: Map<string, IParameterMetadataObject>,
): Record<string, IDashboardExportParameter[]> {
    const result: Record<string, IDashboardExportParameter[]> = {};
    for (const { tab, allowedRefs } of tabRefSelections) {
        const entries = tab.parameters?.parameters ?? parametersInitialState.parameters;
        const scoped = allowedRefs
            ? entries.filter((entry) => allowedRefs.has(objRefToString(entry.parameter.ref)))
            : entries;
        const rows = formatEntries(scoped, workspaceParameterByRef);
        if (rows.length > 0) {
            result[tab.localIdentifier] = rows;
        }
    }
    return Object.keys(result).length === 0 ? EMPTY_EXPORT_PARAMETERS_BY_TAB : result;
}

/**
 * Builds per-tab ref selections for a widget-scope export: each widget's owning tab is restricted
 * to refs referenced by the widget's insight metrics. Multiple widgets on the same tab union their
 * refs.
 *
 * @internal
 */
export function buildWidgetScopeTabRefSelections(
    widgetContexts: ReadonlyArray<IInsightWidgetTabContext>,
    widgetIds: ReadonlyArray<string>,
    insights: ObjRefMap<IInsight>,
    measureParameters: Record<string, IdentifierRef[]>,
): { tab: ITabState; allowedRefs: Set<string> }[] {
    const byTab = new Map<string, { tab: ITabState; allowedRefs: Set<string> }>();
    for (const widgetId of widgetIds) {
        const context = widgetContexts.find((ctx) => ctx.widget.identifier === widgetId);
        if (!context) {
            continue;
        }
        const insight = insights.get(context.widget.insight);
        if (!insight) {
            continue;
        }
        const referencedRefs = collectReferencedParameterRefs(insight, measureParameters);
        if (referencedRefs.length === 0) {
            continue;
        }
        const tabId = context.tab.localIdentifier;
        const existing = byTab.get(tabId) ?? { tab: context.tab, allowedRefs: new Set<string>() };
        for (const ref of referencedRefs) {
            existing.allowedRefs.add(objRefToString(ref));
        }
        byTab.set(tabId, existing);
    }
    return [...byTab.values()];
}

function formatEntries(
    entries: IDashboardParameterEntry[],
    workspaceParameterByRef: Map<string, IParameterMetadataObject>,
): IDashboardExportParameter[] {
    const rows: IDashboardExportParameter[] = [];
    for (const entry of entries) {
        const workspaceParameter = workspaceParameterByRef.get(objRefToString(entry.parameter.ref));
        const row = formatDashboardParameter(entry, workspaceParameter);
        if (row !== undefined) {
            rows.push(row);
        }
    }
    return rows;
}
