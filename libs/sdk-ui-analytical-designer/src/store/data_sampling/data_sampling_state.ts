// (C) 2026 GoodData Corporation

/**
 * `dataSamplingPercentage` — the session-only data-sampling percentage root leaf.
 *
 * `null` means "no sampling set": createSlice cannot self-initialize from undefined. The one reader
 * (selectors/data_sampling_selector.ts) converts back to undefined, which is the shape the
 * execution config expects.
 */
export type IDataSamplingState = number | null;

export const dataSamplingInitialState: IDataSamplingState = null;
