// (C) 2026 GoodData Corporation

import { type IDashboardParameter } from "@gooddata/sdk-model";

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
