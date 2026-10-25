// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { type SagaIterator, runSaga, stdChannel } from "redux-saga";

import { rootReducer } from "../reducers/root_reducer.js";
import { watchArithmeticMeasureOperations } from "../store/arithmetic_measures/arithmetic_measures_operations_saga.js";
import { watchBucketFilterOperations } from "../store/bucket_filters/bucket_filters_operations_saga.js";
import { watchBucketsOperations } from "../store/buckets/buckets_operations_saga.js";
import { watchPropertiesOperations } from "../store/properties/properties_operations_saga.js";
import { watchRecommendationOperations } from "../store/recommendations/recommendations_operations_saga.js";
import { watchShortcutOperations } from "../store/shortcuts/shortcuts_operations_saga.js";
import { type IAppState } from "../store/types.js";

/**
 * Every operation family's watcher, in production registration order (sagas/sagas.ts). "Drive one
 * trigger through the whole production path" means running all of them — a trigger not watched by a
 * family simply never reaches its handlers.
 */
const OPERATION_WATCHERS: ReadonlyArray<() => SagaIterator> = [
    watchBucketsOperations,
    watchPropertiesOperations,
    watchArithmeticMeasureOperations,
    watchRecommendationOperations,
    watchShortcutOperations,
    watchBucketFilterOperations,
];

/** What one driven trigger produced: the resulting root state and every action that reached it. */
export interface IBucketsTriggerRun {
    state: IAppState;
    /** every action that reached the reducer, the trigger first */
    dispatched: UnknownAction[];
}

interface IRunTriggerOptions {
    /** extra watchers registered BEFORE the operation watchers — the adversarial order */
    coWatchers?: ReadonlyArray<() => SagaIterator>;
    /** called once per dispatch with the state before and after the reducer ran */
    onDispatch?: (previous: IAppState, next: IAppState) => void;
}

/**
 * THE ONE RUNNER both public entry points build on: `stdChannel` + `runSaga` over the operation
 * watchers, a dispatch that reduces with the REAL root reducer and re-publishes to the channel (so
 * a handler watching for another handler's event still sees it — which the postponed-shortcut
 * replay does, waiting for `extendedReferencePointApplied`), a cancel pass, and error propagation.
 * One implementation, so the harness cannot drift between "what state resulted" and "how many
 * writes happened" — the two questions the public functions answer.
 */
function runTrigger(
    state: IAppState,
    action: UnknownAction,
    options: IRunTriggerOptions = {},
): IBucketsTriggerRun {
    const { coWatchers = [], onDispatch } = options;
    const channel = stdChannel<UnknownAction>();
    const dispatched: UnknownAction[] = [];
    let current = state;

    const dispatch = (dispatchedAction: UnknownAction) => {
        dispatched.push(dispatchedAction);
        const next = rootReducer(current, dispatchedAction);
        onDispatch?.(current, next);
        current = next;
        channel.put(dispatchedAction);
        return dispatchedAction;
    };

    const io = { channel, dispatch, getState: () => current };
    // takeEvery registers its takers synchronously, so every watcher is listening before the trigger
    // lands — and in this order
    const tasks = [...coWatchers, ...OPERATION_WATCHERS].map((watcher) => runSaga(io, watcher));

    dispatch(action);
    tasks.forEach((task) => task.cancel());

    const error = tasks.map((task) => task.error()).find(Boolean);
    if (error) {
        throw error;
    }

    return { state: current, dispatched };
}

/**
 * DRIVES ONE TRIGGER through the whole production path — trigger → operation saga → semantic event
 * → the owning slices and leaves — and answers the resulting root state.
 *
 * A buckets trigger writes nothing by itself, so a plain `reducer(state, action)` call cannot
 * exercise a gesture. This is what the reducer suites use instead.
 *
 * IT IS DELIBERATELY SYNCHRONOUS. Every operation handler does `select`s, pure `call`s and one `put`
 * and never awaits I/O, so `runSaga` over a `stdChannel` completes the whole gesture inside
 * `channel.put(action)`. An accidental `yield take(...)` or API call inside an operation handler
 * shows up immediately as a test that stops seeing its write — a useful tripwire rather than a
 * limitation.
 *
 * WHAT IT IS NOT: a replacement for `sagas/filter_bar/run_saga.test.utils.ts`, which runs any saga list through
 * `expectSaga` and is async. This one runs the REAL reducer and the REAL sagas, and the only thing
 * it fakes is the store.
 *
 * The dispatched actions are also returned, because "how many store writes did this gesture cause"
 * is not visible in the state.
 *
 * `coWatchers` run ALONGSIDE the operation sagas, registered BEFORE them on purpose. Production has
 * other watchers on these triggers, and an operation saga has no privilege over them — its event is
 * a later dispatch — so "who reacts first" IS behavior, and a co-watcher registered first is the
 * adversarial case.
 */
export function runBucketsTrigger(
    state: IAppState,
    action: UnknownAction,
    coWatchers: ReadonlyArray<() => SagaIterator> = [],
): IBucketsTriggerRun {
    return runTrigger(state, action, { coWatchers });
}

/** The one-line form: `state = dispatchBucketsTrigger(state, action)`. */
export function dispatchBucketsTrigger(state: IAppState, action: UnknownAction): IAppState {
    return runBucketsTrigger(state, action).state;
}

/**
 * How many dispatches of this gesture changed `data` — measured rather than asserted by inspection.
 *
 * IT COUNTS `data`, NOT THE WHOLE ROOT. Time travel runs on the TRIGGER and must: a snapshot is the
 * state as it was BEFORE the edit, so it cannot wait for the operation's event. Every whitelisted
 * trigger therefore changes the root once (pushing `timeTravel.past`) before the event changes it
 * again.
 *
 * That second root change notifies nothing that matters: `observeStore` and `react-redux` both
 * compare the SELECTED value by identity, and no consumer selects `timeTravel` except the undo/redo
 * affordances — which the snapshot is precisely the news for. So "one gesture, one write" is a
 * statement about `data`.
 *
 * An operation that legitimately commits nothing scores zero.
 */
export function countStoreWrites(
    state: IAppState,
    action: UnknownAction,
    coWatchers: ReadonlyArray<() => SagaIterator> = [],
): number {
    let writes = 0;

    runTrigger(state, action, {
        coWatchers,
        onDispatch: (previous, next) => {
            if (next.data !== previous.data) {
                writes += 1;
            }
        },
    });

    return writes;
}
