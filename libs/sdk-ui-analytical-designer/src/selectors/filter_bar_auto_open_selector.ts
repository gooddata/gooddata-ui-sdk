// (C) 2026 GoodData Corporation

import { type IAppState } from "../store/types.js";

/**
 * The local identifier of the filter the filter bar is about to open right after the user added it,
 * or undefined when no such hand-over is pending. The slice stores `null` for "none"; this boundary
 * converts back to undefined.
 */
export const getFilterBarAutoOpenFilter = (state: IAppState): string | undefined =>
    state.filterBarAutoOpen ?? undefined;
