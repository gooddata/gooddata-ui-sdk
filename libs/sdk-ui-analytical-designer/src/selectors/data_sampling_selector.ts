// (C) 2021-2026 GoodData Corporation

import { type IAppState } from "../store/types.js";

/**
 * The session data-sampling percentage, or undefined when none is set. The slice stores `null` for
 * "not set", because createSlice cannot self-initialize from undefined; this boundary converts back,
 * so the execution config carries a present-undefined key that the JSON layer drops (a null would be
 * serialized).
 */
export const getDataSamplingPercentage = (state: IAppState): number | undefined =>
    state.dataSamplingPercentage ?? undefined;
