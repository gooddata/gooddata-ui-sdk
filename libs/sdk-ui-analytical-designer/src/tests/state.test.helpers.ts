// (C) 2019-2026 GoodData Corporation

import { rootReducer } from "../reducers/root_reducer.js";
import { type IAppState } from "../store/types.js";

export function getInitializedState(): IAppState {
    // the real reducer factory (7.3): a fresh build per call, exactly what a new store gets —
    // since the combined root self-initializes every owned key, pristine and initialized are
    // the same shape now
    return rootReducer(undefined, { type: "@@INIT" });
}
