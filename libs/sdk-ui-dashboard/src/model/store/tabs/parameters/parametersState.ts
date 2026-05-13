// (C) 2026 GoodData Corporation

import { type IDashboardParameter, type IDashboardTab } from "@gooddata/sdk-model";

/**
 * Per-parameter state tracked by the dashboard store.
 *
 * `parameter` is the persisted-shape entry (mutated only on Save / on load). `runtimeOverride`
 * is session-ephemeral and tracks the chip's currently-applied value. The two are kept distinct
 * so Cancel can discard a draft cleanly and so future Reset / view-mode flows can promote one
 * to the other independently.
 *
 * @alpha
 */
export interface IDashboardParameterEntry {
    parameter: IDashboardParameter;
    /**
     * Currently-applied value for the chip. `undefined` means "use the workspace default" — used
     * when the parameter has no persisted `value` and the workspace catalog is unresolved (gated
     * off, failed, or missing for the ref). Such entries are skipped when building widget
     * execution overrides so the backend keeps using the parameter's own default.
     */
    runtimeOverride: number | undefined;
}

/**
 * @alpha
 */
export interface IParametersState {
    parameters: IDashboardParameterEntry[];
}

export const parametersInitialState: IParametersState = {
    parameters: [],
};

/**
 * Picks a tab's persisted parameter source under the V1 → per-tab migration rule.
 *
 * - If the tab has its own `parameters` (including `[]`) → return it.
 * - Else if every tab's `parameters === undefined` AND root `parameters` is defined → root array.
 * - Else → `undefined`.
 *
 * @internal
 */
export function pickTabParametersSource(
    tab: IDashboardTab,
    allTabs: ReadonlyArray<IDashboardTab>,
    rootParameters: IDashboardParameter[] | undefined,
): IDashboardParameter[] | undefined {
    if (tab.parameters !== undefined) {
        return tab.parameters;
    }
    const everyTabUndefined = allTabs.length > 0 && allTabs.every((other) => other.parameters === undefined);
    return everyTabUndefined ? rootParameters : undefined;
}
