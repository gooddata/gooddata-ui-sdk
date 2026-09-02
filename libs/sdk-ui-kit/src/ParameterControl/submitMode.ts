// (C) 2026 GoodData Corporation

/**
 * Submit mode of a parameter control edit session.
 *
 * - `commit`: the control sends the value through `onCommit` only, when the user clicks Apply.
 *   The footer shows Cancel and Apply.
 * - `staged`: the control sends each valid draft through `onStage` immediately. The footer shows
 *   only Close. Close does not remove the staged value.
 *
 * @internal
 */
export type ParameterSubmitModeProps<TValue> =
    | { mode: "commit"; onCommit: (value: TValue) => void }
    | { mode: "staged"; onStage: (value: TValue) => void };
