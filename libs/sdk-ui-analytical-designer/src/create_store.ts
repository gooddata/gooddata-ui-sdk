// (C) 2007-2026 GoodData Corporation

import { type Middleware, configureStore } from "@reduxjs/toolkit";
import { type Reducer, type Store, type UnknownAction } from "redux";
import createSagaMiddleware from "redux-saga";

import { IS_DEBUG, IS_TESTING } from "./buildParams.js";
import {
    type IAvailableCommandState,
    availableCommandChanged,
} from "./postMessageApi/outgoing/supported_commands_events.js";
import { availableCommandsStateSelector } from "./postMessageApi/state/selectors/post_message_context_selector.js";
import { rootReducer } from "./reducers/root_reducer.js";
import { root as sagas } from "./sagas/sagas.js";
import { observeStore } from "./store/_infra/observe_store.js";
import { type IAppState } from "./store/types.js";

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        EMBEDDED?: boolean;
        INITIALIZATION_TIMESTAMP: number;
    }
}

// Subtrees the RTK dev checks must not walk. `timeTravel` holds whole past states BY REFERENCE, so
// walking it re-traverses every snapshot on every dispatch — a frozen main thread in dev. Cost of
// traversal is the only reason to add an entry here, and nothing else is large enough to need one.
const DEV_CHECK_IGNORED_PATHS = ["timeTravel"];

// NodeNext resolves redux-saga's default to a module namespace; the cast restores callability.
const sagaMiddleware = (createSagaMiddleware as unknown as typeof createSagaMiddleware.default)({
    onError(error: Error) {
        console.error(error);
    },
});

/**
 * Replaces the undo history with its shape, so the devtools do not carry N copies of the root.
 *
 * Generic in the state so it satisfies the extension's `stateSanitizer` signature; the cast on
 * the way out is inherent to what a sanitizer is — it hands the extension a state-shaped view,
 * not the state.
 */
function sanitizeTimeTravel<S>(state: S): S {
    const root = state as IAppState | undefined;
    const timeTravel = root?.timeTravel;

    if (timeTravel === undefined) {
        return state;
    }

    return {
        ...root,
        timeTravel: `«${timeTravel.past.length} undo / ${timeTravel.future.length} redo steps»`,
    } as S;
}

function subscribeToControlsState(store: Store<IAppState, UnknownAction>): () => void {
    // observeStore: reference-equality change detection, no redux-watch dependency
    return observeStore(
        store,
        availableCommandsStateSelector,
        (availableCommandState: IAvailableCommandState) => {
            availableCommandChanged(availableCommandState);
        },
    );
}

export function createStore(reducer = rootReducer) {
    const store = configureStore({
        // No preloadedState: the combined root self-initializes every owned key, and each store
        // gets its own fresh build from the reducer itself (see reducers/initial_state.ts).
        reducer: reducer as Reducer<IAppState, UnknownAction>,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                // No thunks — redux-saga is the only orchestration layer in AD.
                thunk: false,
                // Both checks are dev-only — RTK compiles them out of production builds.
                immutableCheck: {
                    warnAfter: 128,
                    ignoredPaths: DEV_CHECK_IGNORED_PATHS,
                },
                serializableCheck: {
                    warnAfter: 128,
                    ignoredPaths: DEV_CHECK_IGNORED_PATHS,
                    // some action payloads carry non-serializable values (occasionally
                    // functions) — the state-side check is the valuable half
                    ignoreActions: true,
                },
            }).concat(sagaMiddleware as Middleware),
        devTools: (IS_DEBUG || IS_TESTING) && {
            name: "Analytical Designer",
            trace: true,
            // The devtools serialize the whole state per action; the undo history holds whole
            // past states, so it is collapsed to its stack depths. The extension only ever sees
            // the sanitized copy — the store itself is untouched.
            stateSanitizer: sanitizeTimeTravel,
        },
    });

    // Sagas are never auto-started — every caller (standalone bootstrap, the pluggable wrapper)
    // invokes startSagas() explicitly when ready.
    const startSagas = () => sagaMiddleware.run(sagas);
    const subscribeControls = (): (() => void) => subscribeToControlsState(store);

    return { store, sagaMiddleware, startSagas, subscribeControls };
}
