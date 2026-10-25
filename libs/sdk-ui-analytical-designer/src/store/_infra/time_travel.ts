// (C) 2007-2026 GoodData Corporation

import { type Action } from "redux";

import {
    appFinishedLoading,
    clearInsightContent,
    resetApplication,
} from "../../actions/app_context_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { visualizationPropertiesChanged } from "../../actions/properties_actions.js";
import { saveReportFinished } from "../../actions/save_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { PostEventActionTypeKeys } from "../../postMessageApi/actions/action_types.js";
import { ChartSortUiActionTypeKeys } from "../../sagas/chart_sort/chart_sort_ui_actions.js";
import { FilterBarUiActionTypeKeys } from "../../sagas/filter_bar/filter_bar_ui_actions.js";
import { wholeApplicationReset } from "../app_context/application_reset_events.js";
import { ParameterFilterActionTypeKeys } from "../filter_bar/parameter_filter_actions.js";
import { setDroppedItem } from "../shortcuts/shortcut_dropped_item_reducer.js";
import {
    type IAppState,
    type ITimeTravelEntry,
    type ITimeTravelState,
    type IUndoableState,
} from "../types.js";

import { timeTravelInitialState } from "./time_travel_state.js";

/**
 * UNDO / REDO as a higher-order root reducer.
 *
 * The history is ordinary state at the root key `timeTravel` and the wrapper is a pure function
 * of `(state, action)` — never a module-level singleton: the stacks travel with the state, so a
 * store teardown or a pluggable remount cannot leak one mount's history into the next.
 *
 * THE CONTRACT (`reducers/test/time_travel_characterization.test.ts` pins it): the whitelist,
 * the reset triggers, snapshot-BEFORE-the-action, redo purged by the next edit,
 * `propertiesMeta.undoApplied` written on every undo/redo.
 *
 * Two properties are deliberate:
 *
 * 1. A snapshot is the UNDOABLE PROJECTION of the root, not the whole root (see
 *    {@link IUndoableState}) — the keys undo must not restore are simply not captured.
 * 2. There are no `appState.undo` / `appState.redo` flags; `selectors/editor_header_selector.ts`
 *    derives both from the stack lengths, so they cannot drift out of sync with the stacks. The
 *    router's project switch CLEARS the history, because merely disabling the buttons would let one
 *    edit re-enable undo onto pre-switch snapshots.
 *
 * NOT batch-aware, deliberately: nothing in this app dispatches a batch. Worth knowing if batching
 * is ever introduced for atomicity — a whitelisted action inside a batch would be invisible to the
 * whitelist test below, so the edit would silently produce NO undo step at all.
 */

/**
 * The ~50 user-edit actions that make an undo step. Membership is behavior, so an addition belongs
 * with the feature that needs it.
 */
export const UNDOABLE_ACTIONS: readonly string[] = [
    ActionTypeKeys.BUCKETS_SELECT_VISUALIZATION_TYPE,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_SHOW_ON_SECONDARY_AXIS,
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE,
    FilterBarUiActionTypeKeys.UI_ADD_FILTER,
    FilterBarUiActionTypeKeys.UI_REMOVE_FILTER,
    FilterBarUiActionTypeKeys.UI_UPDATE_FILTERS,
    ParameterFilterActionTypeKeys.UI_ADD_PARAMETER_FILTERS,
    ParameterFilterActionTypeKeys.UI_UPDATE_PARAMETER_FILTER,
    ActionTypeKeys.UI_UPDATE_ATTRIBUTE_FILTER,
    ActionTypeKeys.UI_UPDATE_ATTRIBUTE_FILTER_DISPLAY_FORM,
    ActionTypeKeys.UI_UPDATE_DATE_FILTER,
    ActionTypeKeys.UI_UPDATE_MEASURE_VALUE_FILTER,
    ActionTypeKeys.UI_UPDATE_RANKING_FILTER,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTERS,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER_DISPLAY_FORM,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER,
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_AGGREGATION,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_GRANULARITY,
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_TITLE,
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_FORMAT,

    ActionTypeKeys.BUCKETS_DND_ITEM_INSERT,
    ActionTypeKeys.BUCKETS_DND_ITEM_REMOVE,
    ActionTypeKeys.BUCKETS_DND_ITEM_REPLACE,
    ActionTypeKeys.BUCKETS_DND_ITEM_SWAP,
    ActionTypeKeys.BUCKETS_DND_ITEM_REORDER,
    ActionTypeKeys.UI_ADD_ARITHMETIC_MEASURE,
    ActionTypeKeys.UI_SELECT_ARITHMETIC_MEASURE_OPERAND,
    ActionTypeKeys.UI_SELECT_ARITHMETIC_MEASURE_OPERATOR,
    ActionTypeKeys.UI_BUCKETS_CHANGE_BUCKET_ITEM_DISPLAY_FORM,

    ActionTypeKeys.STACK_MEASURES,
    ActionTypeKeys.STACK_TO_PERCENT,

    ActionTypeKeys.BUCKET_TOGGLE_DUAL_AXIS,
    ActionTypeKeys.BUCKET_CHANGE_CHART_TYPE,

    ActionTypeKeys.SHORTCUT_APPLY_ATTRIBUTE,
    ActionTypeKeys.SHORTCUT_APPLY_METRIC,
    ActionTypeKeys.SHORTCUT_APPLY_METRIC_OVER_TIME,

    ActionTypeKeys.UI_RECOMMENDATION_COMPARISON_WITH_PERIOD,
    ActionTypeKeys.UI_RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
    ActionTypeKeys.UI_RECOMMENDATION_METRIC_WITH_PERIOD,
    ActionTypeKeys.UI_RECOMMENDATION_TRENDING,
    ActionTypeKeys.UI_RECOMMENDATION_COMPARISON,

    ActionTypeKeys.REPORT_TITLE_CHANGE,

    ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED,

    ActionTypeKeys.MEASURE_DATE_DATASETS_SELECT,

    ActionTypeKeys.STORE_ADD_OR_UPDATE_FILTER_ITEMS,
    PostEventActionTypeKeys.STORE_REMOVE_FILTER_ITEMS,

    ChartSortUiActionTypeKeys.UI_UPDATE_APPLIED_CHART_SORT,

    ActionTypeKeys.REPORT_DESCRIPTION_CHANGE,
];

const UNDOABLE_ACTION_TYPES = new Set<string>(UNDOABLE_ACTIONS);

/** Root keys a snapshot deliberately leaves out — the rationale is on {@link IUndoableState}. */
export const NON_UNDOABLE_ROOT_KEYS = [
    "report",
    "timezoneOverride",
    "filterBarAutoOpen",
    "timeTravel",
] as const;

/** `appState` keys a snapshot deliberately leaves out. */
export const NON_UNDOABLE_APP_STATE_KEYS = ["messages"] as const;

export function selectTimeTravel(state: IAppState): ITimeTravelState {
    return state.timeTravel ?? timeTravelInitialState;
}

/**
 * Captures the undoable projection of `state`.
 *
 * Everything is captured BY REFERENCE: the branches below the root are produced by
 * `combineReducers`, which returns the SAME object when no child changed, so a snapshot costs one
 * shallow object per undo step no matter how large the state is.
 */
export function captureSnapshot(state: IAppState): IUndoableState {
    const {
        report: _report,
        timezoneOverride: _timezoneOverride,
        filterBarAutoOpen: _filterBarAutoOpen,
        timeTravel: _timeTravel,
        appState,
        ...rest
    } = state;
    const { messages: _messages, ...undoableAppState } = appState;

    return { ...rest, appState: undoableAppState };
}

/**
 * The two restore-time fixups that are not expressible as a snapshot exclusion.
 *
 * `bucketsMeta.measureExpanded` / `attributeExpanded` are DELETED rather than reset, because the
 * readers distinguish an absent key from a present one.
 */
function applyRestoreFixups(state: IAppState): IAppState {
    const {
        measureExpanded: _measureExpanded,
        attributeExpanded: _attributeExpanded,
        ...bucketsMeta
    } = state.data.bucketsMeta;

    return setDroppedItem({ ...state, data: { ...state.data, bucketsMeta } }, null);
}

/**
 * Makes `snapshot` the live state again.
 *
 * The undoable keys are replaced WHOLESALE (a key added to `data` after the snapshot was taken
 * disappears, exactly as it did when the whole root was swapped); the excluded keys are carried
 * over from the live state untouched.
 *
 * `route` / `previousRoute` ARE captured and restored, like every other undoable key. Both are
 * written before the app is ready and APP_READINESS_CHANGE clears the history, so no reachable
 * history entry carries their pristine `null`.
 */
export function restoreSnapshot(state: IAppState, snapshot: IUndoableState): IAppState {
    return applyRestoreFixups({
        ...state,
        ...snapshot,
        appState: { ...snapshot.appState, messages: state.appState["messages"] },
    });
}

const writeHistory = (state: IAppState, timeTravel: ITimeTravelState): IAppState => ({
    ...state,
    timeTravel,
});

/**
 * Written on EVERY undo/redo, including one that finds an empty stack. The explicit equality guard
 * is what keeps a no-op undo from dirtying the state.
 */
const setUndoApplied = (state: IAppState, undoApplied: boolean): IAppState =>
    state.data.propertiesMeta.undoApplied === undoApplied
        ? state
        : {
              ...state,
              data: {
                  ...state.data,
                  propertiesMeta: { ...state.data.propertiesMeta, undoApplied },
              },
          };

/**
 * Moves one step between the two stacks. `from` is popped, the CURRENT state is pushed onto `to`
 * carrying the popped entry's action type (so an entry stays labelled by the edit it represents).
 */
function travel(state: IAppState, history: ITimeTravelState, isUndo: boolean): IAppState {
    const from = isUndo ? history.past : history.future;
    const to = isUndo ? history.future : history.past;

    if (from.length === 0) {
        return setUndoApplied(state, isUndo);
    }

    const entry = from[from.length - 1];
    const remaining = from.slice(0, -1);
    const grown: readonly ITimeTravelEntry[] = [
        ...to,
        { state: captureSnapshot(state), actionType: entry.actionType },
    ];
    const nextHistory: ITimeTravelState = isUndo
        ? { past: remaining, future: grown }
        : { past: grown, future: remaining };

    return setUndoApplied(writeHistory(restoreSnapshot(state, entry.state), nextHistory), isUndo);
}

/**
 * The actions that make the history meaningless: a different insight is now open, or the editing
 * session restarted.
 */
function isHistoryResetTrigger(action: Action): boolean {
    if (saveReportFinished.match(action)) {
        // an ordinary save keeps the history — only "save as new" starts a new insight's history.
        // `match()` compares the TYPE STRING only, so an action built as a bare literal reaches
        // here with no payload, hence the optional chaining.
        return action.payload?.saveAsNew === true;
    }
    if (appFinishedLoading.match(action)) {
        // appStartedLoading shares the type string; only the ready edge resets
        return action.payload?.isReady === true;
    }

    return (
        openReportFinished.match(action) ||
        resetApplication.match(action) ||
        clearInsightContent.match(action) ||
        // the router's project-switch/report-cleared navigation. The two TRIGGERS above
        // stay listed even though reset_sagas re-dispatches each as an event: the
        // characterization suite pins them, and a bare-store dispatch (no sagas) must keep
        // clearing.
        wholeApplicationReset.match(action)
    );
}

function isUndoableAction(action: Action): boolean {
    if (visualizationPropertiesChanged.match(action)) {
        // property changes replayed by the plug viz itself are not user edits (payload guarded
        // for the same reason as in isHistoryResetTrigger)
        return action.payload?.ignoreUndoRedo !== true;
    }

    return UNDOABLE_ACTION_TYPES.has(action.type);
}

const isEmptyHistory = (history: ITimeTravelState): boolean =>
    history.past.length === 0 && history.future.length === 0;

/**
 * The whole mechanic as a pure state transition. Exported for the unit tests; production goes
 * through {@link withTimeTravel}.
 */
export function applyTimeTravel(state: IAppState, action: Action): IAppState {
    const history = selectTimeTravel(state);

    if (action.type === ActionTypeKeys.UNDO_ACTION) {
        return travel(state, history, true);
    }

    if (action.type === ActionTypeKeys.REDO_ACTION) {
        return travel(state, history, false);
    }

    if (action.type === ActionTypeKeys.DISABLE_REDO_ACTION) {
        return history.future.length === 0 ? state : writeHistory(state, { ...history, future: [] });
    }

    if (isHistoryResetTrigger(action)) {
        return isEmptyHistory(history) ? state : writeHistory(state, timeTravelInitialState);
    }

    if (isUndoableAction(action)) {
        return writeHistory(state, {
            past: [...history.past, { state: captureSnapshot(state), actionType: action.type }],
            future: [],
        });
    }

    return state;
}

export type RootReducer = (state: IAppState | undefined, action: Action) => IAppState;

/**
 * Wraps the root reducer so time travel runs BEFORE it: a snapshot has to be the state as it was
 * before the edit lands, and an undo has to hand the restored state to the reducers rather than the
 * other way round. No case reducer handles UNDO_ACTION / REDO_ACTION (only sagas do), so running the
 * inner reducer afterwards is a no-op for those two.
 *
 * On `state === undefined` the inner reducer builds the pristine root, which self-initializes
 * `timeTravel` to an empty history — so a new store and a pluggable remount both start clean.
 */
export function withTimeTravel(inner: RootReducer): RootReducer {
    return (state, action) =>
        state === undefined ? inner(state, action) : inner(applyTimeTravel(state, action), action);
}
