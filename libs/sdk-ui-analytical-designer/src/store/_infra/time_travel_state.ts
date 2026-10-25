// (C) 2026 GoodData Corporation

import { type ITimeTravelState } from "../types.js";

/**
 * The pristine undo/redo history.
 *
 * Split from `time_travel.ts` so the modules that only need the SEED — the combined root, which
 * owns the `timeTravel` key, and the reset events that clear it — do not pull the wrapper's
 * whitelist imports (every UI action-type module in the app) into their graphs.
 * The types live in `typings/state.ts`, next to the `IAppState` that names them.
 */
export const timeTravelInitialState: ITimeTravelState = { past: [], future: [] };

/**
 * Owns the `timeTravel` key in the combined root so it self-initializes empty on every store
 * build and on RESET_FOR_PLUGGABLE_MOUNT. Deliberately inert: the time-travel higher-order
 * wrapper (time_travel.ts) is the key's only writer — whole-root infrastructure by design, since
 * a snapshot is a projection of the whole root and no slice can own that.
 */
export function timeTravelLeafReducer(state: ITimeTravelState = timeTravelInitialState): ITimeTravelState {
    return state;
}
