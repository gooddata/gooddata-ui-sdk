// (C) 2026 GoodData Corporation

import {
    DashboardParameterModeValues,
    type FilterContextItem,
    type IDashboardExportParameter,
    type IDashboardFilterReference,
    type IDashboardParameter,
    type IDashboardTab,
    type IInsight,
    type IInsightDefinition,
    type IInsightParameterValue,
    type IParameterDefinition,
    type IParameterMetadataObject,
    type IdentifierRef,
    type ObjRef,
    type ParameterValue,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    insightParameters,
    insightRef,
    isComputedAttributeRef,
    isDashboardAttributeFilterItem,
    isDashboardAttributeFilterReference,
    isDashboardMeasureValueFilter,
    isDashboardMeasureValueFilterReference,
    isIdentifierRef,
    isValidParameterValue,
    objRefToString,
    sanitizeParameterValue,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type ITabState } from "../tabsState.js";

import {
    type IDashboardParameterEntry,
    parametersInitialState,
    pickTabParametersSource,
} from "./parametersState.js";

const EMPTY_PARAMETERS: IDashboardParameter[] = [];
const EMPTY_PARAMETER_VALUES: IInsightParameterValue[] = [];
const EMPTY_REFS: IdentifierRef[] = [];
/**
 * @internal
 */
export const EMPTY_EXPORT_PARAMETERS_BY_TAB: Record<string, IDashboardExportParameter[]> = {};

/**
 * Concatenates parameter ref lists, keeping the first occurrence of each ref (by `serializeObjRef`).
 *
 * @internal
 */
export function unionParameterRefs(...lists: ReadonlyArray<ReadonlyArray<IdentifierRef>>): IdentifierRef[] {
    const seen = new Set<string>();
    const result: IdentifierRef[] = [];
    for (const list of lists) {
        for (const ref of list) {
            const key = serializeObjRef(ref);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(ref);
            }
        }
    }
    return result;
}

/**
 * The objects a dashboard filter reads through which it can depend on a parameter, as roots for the
 * references service: a computed attribute an attribute filter filters on, and a measure value filter's
 * metric plus any computed attribute in its dimensionality. A plain attribute or label has no expression,
 * so it cannot depend on a parameter and is not a root. Date filters never are.
 *
 * @internal
 */
export function filterParameterRoots(filter: FilterContextItem): IdentifierRef[] {
    if (isDashboardAttributeFilterItem(filter)) {
        const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
        return isComputedAttributeRef(displayForm) && isIdentifierRef(displayForm)
            ? [displayForm]
            : EMPTY_REFS;
    }
    if (isDashboardMeasureValueFilter(filter)) {
        const { measure, dimensionality = [] } = filter.dashboardMeasureValueFilter;
        return [
            ...(isIdentifierRef(measure) ? [measureRoot(measure)] : []),
            ...dimensionality.filter(isComputedAttributeRef).filter(isIdentifierRef),
        ];
    }
    return EMPTY_REFS;
}

/**
 * A measure value filter stores its metric as a plain {@link ObjRef} that usually carries no `type`. The
 * dependency graph resolves an untyped root as an insight, so the metric type is made explicit here; the
 * same normalized ref is the key both when the map is loaded and when a widget reads it.
 */
function measureRoot(measure: IdentifierRef): IdentifierRef {
    return measure.type ? measure : { ...measure, type: "measure" };
}

/**
 * {@link filterParameterRoots} over many filters, deduped by ref.
 *
 * @internal
 */
export function collectFilterParameterRoots(filters: ReadonlyArray<FilterContextItem>): IdentifierRef[] {
    return unionParameterRefs(...filters.map(filterParameterRoots));
}

/**
 * Whether the widget's `ignoreDashboardFilters` excludes the given dashboard filter from its execution.
 *
 * @remarks
 * Attribute filters are matched by display form. An ignore may instead name the filter's `displayAsLabel`;
 * that is irrelevant here because only computed-attribute filters produce parameter roots and a computed
 * attribute has exactly one (fabricated) display form, so it cannot be shown under another label.
 *
 * @internal
 */
export function isDashboardFilterIgnoredByWidget(
    ignoreDashboardFilters: ReadonlyArray<IDashboardFilterReference>,
    filter: FilterContextItem,
): boolean {
    if (isDashboardAttributeFilterItem(filter)) {
        const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
        return ignoreDashboardFilters.some(
            (ignored) =>
                isDashboardAttributeFilterReference(ignored) &&
                areObjRefsEqual(ignored.displayForm, displayForm),
        );
    }
    if (isDashboardMeasureValueFilter(filter)) {
        const { measure } = filter.dashboardMeasureValueFilter;
        return ignoreDashboardFilters.some(
            (ignored) =>
                isDashboardMeasureValueFilterReference(ignored) && areObjRefsEqual(ignored.measure, measure),
        );
    }
    return false;
}

/**
 * The parameter refs a widget depends on through the dashboard filters of its tab that it does not
 * ignore, resolved against the filter → parameter dependency map (`catalog.filterParameters.byRef`).
 *
 * @internal
 */
export function collectWidgetFilterParameterRefs(
    ignoreDashboardFilters: ReadonlyArray<IDashboardFilterReference>,
    tab: ITabState,
    filterParameters: Record<string, IdentifierRef[]>,
): IdentifierRef[] {
    const filters = tab.filterContext?.filterContextDefinition?.filters ?? [];
    const roots = collectFilterParameterRoots(
        filters.filter((filter) => !isDashboardFilterIgnoredByWidget(ignoreDashboardFilters, filter)),
    );
    const result = unionParameterRefs(
        ...roots.map((root) => filterParameters[serializeObjRef(root)] ?? EMPTY_REFS),
    );
    return result.length === 0 ? EMPTY_REFS : result;
}

/**
 * Effective execution parameters, limited to `referencedRefs`. Precedence per ref: the dashboard
 * `runtimeOverride`, else the insight's own parameter value, else nothing (backend uses the workspace
 * default). A value from either source that is invalid for the workspace parameter (out of
 * constraints or of the wrong kind) is replaced by the workspace default (recovery), so the backend
 * never receives a bad value.
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
            value: sanitizeParameterExecutionValue(runtimeOverride, workspaceParameterByRef.get(refKey)),
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
            value: sanitizeParameterExecutionValue(
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
    insightParameters: Record<string, IdentifierRef[]>;
    // Parameters reached through the widget's non-ignored dashboard filters; they apply to whatever
    // insight the widget executes (its own or a drill target), so they are resolved per widget, not per insight.
    filterParameterRefs: IdentifierRef[];
    workspaceParameterByRef: Map<string, IParameterMetadataObject>;
    isStringEnabled: boolean;
}

/**
 * Effective execution parameters for `insight` given a widget's parameter context: looks up the refs
 * the insight depends on, adds those the widget's dashboard filters depend on, then applies
 * {@link resolveEffectiveParameterValuesForRefs}.
 *
 * @internal
 */
export function resolveEffectiveParameterValuesForInsight(
    context: IParameterResolutionContext | undefined,
    insight: IInsight,
): IInsightParameterValue[] {
    if (!context) {
        return EMPTY_PARAMETER_VALUES;
    }
    const referencedRefs = unionParameterRefs(
        context.insightParameters[serializeObjRef(insightRef(insight))] ?? EMPTY_REFS,
        context.filterParameterRefs,
    );
    return resolveEffectiveParameterValuesForRefs(
        context.entries,
        referencedRefs,
        ungatedInsightParameterValues(insight, context.isStringEnabled),
        context.workspaceParameterByRef,
    );
}

/**
 * The value hydration seeds into `runtimeOverride`: the dashboard parameter's `value`, else the
 * workspace default when the workspace parameter is of the matching type, else `undefined`.
 *
 * @internal
 */
export function computeHydratedRuntimeOverride(
    parameter: IDashboardParameter,
    workspaceParameter: IParameterMetadataObject | undefined,
): ParameterValue | undefined {
    if (parameter.value !== undefined) {
        return parameter.value;
    }
    return matchingWorkspaceDefinition(parameter, workspaceParameter)?.defaultValue;
}

/**
 * The store entry for a persisted parameter, with `runtimeOverride` seeded per
 * {@link computeHydratedRuntimeOverride}.
 *
 * @internal
 */
export function hydrateParameterEntry(
    parameter: IDashboardParameter,
    workspaceParameterByRef: Map<string, IParameterMetadataObject>,
): IDashboardParameterEntry {
    return {
        parameter,
        runtimeOverride: computeHydratedRuntimeOverride(
            parameter,
            workspaceParameterByRef.get(objRefToString(parameter.ref)),
        ),
    };
}

/**
 * The workspace definition a dashboard parameter binds to: the definition when its type matches
 * the parameter's own type tag, `undefined` otherwise (removed or incompatible workspace
 * parameter). The single home of the type-match invariant shared by hydration, reset,
 * reconciliation, and chip rendering.
 *
 * @internal
 */
export function matchingWorkspaceDefinition(
    parameter: IDashboardParameter,
    workspaceParameter: IParameterMetadataObject | undefined,
): IParameterDefinition | undefined {
    const definition = workspaceParameter?.definition;
    return definition?.type === parameter.parameterType ? definition : undefined;
}

/**
 * The value to execute for a runtime override: a value that is not valid for the workspace
 * parameter (constraint-violating or of the wrong kind) is replaced by the workspace default so
 * the dashboard renders the default instead of failing, while the chip keeps showing
 * the user's saved value. Valid values, and values of removed parameters (no workspace entry —
 * meant to surface as the standard widget error), pass through unchanged.
 *
 * @internal
 */
function sanitizeParameterExecutionValue(
    runtimeOverride: ParameterValue,
    workspaceParameter: IParameterMetadataObject | undefined,
): ParameterValue {
    const definition = workspaceParameter?.definition;
    return definition ? sanitizeParameterValue(definition, runtimeOverride) : runtimeOverride;
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
    if (!matchingWorkspaceDefinition(dashboardParameter, workspaceParameter)) {
        return "incompatible";
    }
    if (
        dashboardParameter.value !== undefined &&
        !isValidParameterValue(workspaceParameter.definition, dashboardParameter.value)
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
 * The applied values of the entries. Entries without a `runtimeOverride` and gated-off STRING entries
 * are skipped.
 *
 * @internal
 */
export function collectAppliedParameterValues(
    entries: IDashboardParameterEntry[],
    isStringEnabled: boolean,
): IInsightParameterValue[] {
    const result: IInsightParameterValue[] = [];
    for (const entry of entries) {
        if (entry.runtimeOverride === undefined || isGatedStringEntry(entry, isStringEnabled)) {
            continue;
        }
        result.push({ ref: entry.parameter.ref, value: entry.runtimeOverride });
    }
    return result;
}

/**
 * A STRING entry persisted while `enableStringParameters` was on. Once the flag is off it must not
 * reach executions, exports, or reconciliation: the catalog omits STRING definitions, so the chip
 * is hidden and the value would apply as an invisible override.
 *
 * @internal
 */
export function isGatedStringEntry(entry: IDashboardParameterEntry, isStringEnabled: boolean): boolean {
    return entry.parameter.parameterType === "STRING" && !isStringEnabled;
}

/**
 * The value-shaped twin of {@link isGatedStringEntry}, for insight-level parameter values, which
 * carry no declared type.
 *
 * @internal
 */
export function isGatedStringValue(value: ParameterValue, isStringEnabled: boolean): boolean {
    return typeof value === "string" && !isStringEnabled;
}

/**
 * The tab's parameter entries without the gated-off STRING entries.
 *
 * @internal
 */
export function ungatedTabEntries(tab: ITabState, isStringEnabled: boolean): IDashboardParameterEntry[] {
    return (tab.parameters?.parameters ?? parametersInitialState.parameters).filter(
        (entry) => !isGatedStringEntry(entry, isStringEnabled),
    );
}

/**
 * The insight-authored parameter values that pass the string gate — the single home of
 * insight-level gating for both the widget-execution hook path and the selector path.
 *
 * @internal
 */
export function ungatedInsightParameterValues(
    insight: IInsightDefinition,
    isStringEnabled: boolean,
): IInsightParameterValue[] {
    return insightParameters(insight).filter((value) => !isGatedStringValue(value.value, isStringEnabled));
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
 * The value the parameter control shows: the staged one when the entry has it, otherwise the
 * applied one.
 *
 * @internal
 */
export function displayOverride(entry: IDashboardParameterEntry): ParameterValue | undefined {
    return entry.workingOverride ?? entry.runtimeOverride;
}

/**
 * Folds an entry's ephemeral `runtimeOverride` into the persisted parameter shape's `value`.
 *
 * @internal
 */
export function applyRuntimeOverride(entry: IDashboardParameterEntry): IDashboardParameter {
    return foldOverride(entry, entry.runtimeOverride);
}

/**
 * Folds an entry's display value into the persisted parameter shape's `value`.
 *
 * @internal
 */
export function applyDisplayOverride(entry: IDashboardParameterEntry): IDashboardParameter {
    return foldOverride(entry, displayOverride(entry));
}

function foldOverride(
    entry: IDashboardParameterEntry,
    value: ParameterValue | undefined,
): IDashboardParameter {
    if (value === undefined) {
        return entry.parameter;
    }
    return { ...entry.parameter, value };
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
        value: String(sanitizeParameterExecutionValue(runtimeOverride, workspaceParameter)),
        title: resolveParameterTitle(entry.parameter, workspaceParameter),
        parameterType: entry.parameter.parameterType,
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
    const workspaceDefault = workspaceParameter.definition.defaultValue;
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
 * Returns `undefined` when reset would be a no-op: missing/type-mismatched workspace parameter,
 * or in edit mode when `parameter.value` is unset / already equals the workspace default.
 *
 * @internal
 */
export function computeParameterResetValue(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject | undefined,
    isInEditMode: boolean,
): ParameterValue | undefined {
    const definition = matchingWorkspaceDefinition(entry.parameter, workspaceParameter);
    if (!definition) {
        return undefined;
    }
    const workspaceDefault = definition.defaultValue;
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
 * Only `mode: "active"` entries with a defined display value are considered resettable;
 * HIDDEN and READONLY entries are skipped, and entries with no display value (control hidden,
 * execution falls back to `insight.parameters`) are preserved as-is — symmetric with the
 * per-control behavior in `DashboardParameterFilter`.
 *
 * @internal
 */
export function computeParameterResetTargets(
    entries: IDashboardParameterEntry[],
    workspaceParameters: IParameterMetadataObject[],
    isInEditMode: boolean,
): IInsightParameterValue[] {
    const workspaceParameterByRef = buildWorkspaceParametersByRef(workspaceParameters);
    const result: IInsightParameterValue[] = [];
    for (const entry of entries) {
        if (entry.parameter.mode !== DashboardParameterModeValues.ACTIVE) {
            continue;
        }
        if (displayOverride(entry) === undefined) {
            continue;
        }
        const workspaceParameter = workspaceParameterByRef.get(objRefToString(entry.parameter.ref));
        const resetValue = computeParameterResetValue(entry, workspaceParameter, isInEditMode);
        if (resetValue === undefined) {
            continue;
        }
        const isAlreadyReset = entry.workingOverride === undefined && entry.runtimeOverride === resetValue;
        if (!isAlreadyReset) {
            result.push({ ref: entry.parameter.ref, value: resetValue });
        }
    }
    return result;
}

/**
 * Folds the parameter entries of the given tabs into the wire shape, dropping entries without a
 * `runtimeOverride`. Tabs that yield no rows are omitted from the result.
 *
 * @internal
 */
export function collectExportOverrides(
    tabs: ReadonlyArray<ITabState>,
    workspaceParameterByRef: Map<string, IParameterMetadataObject>,
    isStringEnabled: boolean,
): Record<string, IDashboardExportParameter[]> {
    const result: Record<string, IDashboardExportParameter[]> = {};
    for (const tab of tabs) {
        const rows = formatEntries(ungatedTabEntries(tab, isStringEnabled), workspaceParameterByRef);
        if (rows.length > 0) {
            result[tab.localIdentifier] = rows;
        }
    }
    return Object.keys(result).length === 0 ? EMPTY_EXPORT_PARAMETERS_BY_TAB : result;
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
