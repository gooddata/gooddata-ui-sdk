// (C) 2007-2026 GoodData Corporation

/**
 * Unit tests for the time-travel higher-order reducer. The end-to-end semantics live in
 * `time_travel_characterization.test.ts`; what is pinned HERE is the mechanism that suite cannot
 * see — which keys a snapshot captures, that capture and restore never mutate, that a non-undoable
 * action is a true no-op, and the exact contents of the whitelist and the reset triggers.
 */

import { type Action } from "redux";
import { describe, expect, it } from "vitest";

import {
    appFinishedLoading,
    appStartedLoading,
    clearInsightContent,
    resetApplication,
} from "../../actions/app_context_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { visualizationPropertiesChanged } from "../../actions/properties_actions.js";
import { reportExecutionStarted, reportTitleChange } from "../../actions/report_actions.js";
import { saveReportFinished } from "../../actions/save_actions.js";
import { disableRedo, redo, undo } from "../../actions/time_travel_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { withMdObjectMeta } from "../../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withAppState, withData, withReport, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IVisualization } from "../../typings/bear/bearTypes.js";
import { wholeApplicationReset } from "../app_context/application_reset_events.js";
import { type IAppState } from "../types.js";

import {
    NON_UNDOABLE_APP_STATE_KEYS,
    NON_UNDOABLE_ROOT_KEYS,
    UNDOABLE_ACTIONS,
    applyTimeTravel,
    captureSnapshot,
    restoreSnapshot,
    selectTimeTravel,
    withTimeTravel,
} from "./time_travel.js";
import { timeTravelInitialState } from "./time_travel_state.js";

const anAction = (type: string): Action => ({ type });

const initial = (): IAppState => getInitializedState();

describe("time_travel", () => {
    describe("the undoable action list", () => {
        it("has no duplicate entries", () => {
            expect(UNDOABLE_ACTIONS.length).toEqual(new Set(UNDOABLE_ACTIONS).size);
        });

        it.each(UNDOABLE_ACTIONS.map((type) => [type]))("records one undo step for %s", (type) => {
            const next = applyTimeTravel(initial(), anAction(type));

            expect(selectTimeTravel(next).past.length).toEqual(1);
            expect(selectTimeTravel(next).future.length).toEqual(0);
        });

        // the wrapper's own control actions are handled, not ignored — they have their own specs
        const CONTROL_ACTIONS: readonly string[] = [
            ActionTypeKeys.UNDO_ACTION,
            ActionTypeKeys.REDO_ACTION,
            ActionTypeKeys.DISABLE_REDO_ACTION,
        ];

        const notUndoable = Object.values(ActionTypeKeys).filter(
            (type) => !UNDOABLE_ACTIONS.includes(type) && !CONTROL_ACTIONS.includes(type),
        );

        it.each(notUndoable.map((type) => [type]))("leaves the state untouched for %s", (type) => {
            const state = initial();

            // identity, not deep equality: a reducer that dirties the state on an action it does
            // not care about defeats every downstream memoization. The bare `{ type }` also pins
            // that a payload-less action cannot throw — `createAction().match()` tests the type
            // string alone, so every payload read has to be guarded
            expect(applyTimeTravel(state, anAction(type))).toBe(state);
        });

        it("does not record a property change the plug viz replayed itself", () => {
            const state = initial();

            expect(applyTimeTravel(state, visualizationPropertiesChanged({}, true))).toBe(state);
            expect(
                selectTimeTravel(applyTimeTravel(state, visualizationPropertiesChanged({}, false))).past
                    .length,
            ).toEqual(1);
        });
    });

    describe("the history reset triggers", () => {
        const withHistory = (): IAppState => applyTimeTravel(initial(), reportTitleChange("edited"));

        it.each([
            ["RESET_APPLICATION", resetApplication()],
            ["CLEAR_INSIGHT_CONTENT", clearInsightContent()],
            [
                "OPEN_REPORT_FINISHED",
                openReportFinished(
                    {} as Parameters<typeof openReportFinished>[0],
                    {} as Parameters<typeof openReportFinished>[1],
                    123,
                    true,
                    {} as Parameters<typeof openReportFinished>[4],
                ),
            ],
            ["SAVE_REPORT_FINISHED (save as new)", saveReportFinished({} as IVisualization, true, 123)],
            ["APP_READINESS_CHANGE (ready)", appFinishedLoading()],
        ])("clears the history on %s", (_name, action) => {
            expect(selectTimeTravel(applyTimeTravel(withHistory(), action))).toEqual(timeTravelInitialState);
        });

        it.each([
            ["SAVE_REPORT_FINISHED without saveAsNew", saveReportFinished({} as IVisualization, false, 123)],
            ["APP_READINESS_CHANGE (not ready)", appStartedLoading()],
        ])("keeps the history on %s", (_name, action) => {
            expect(selectTimeTravel(applyTimeTravel(withHistory(), action)).past.length).toEqual(1);
        });

        it("is a no-op when the history is already empty", () => {
            const state = initial();

            expect(applyTimeTravel(state, resetApplication())).toBe(state);
        });

        it("is cleared by the router's whole-application reset", () => {
            // writing the flags false while leaving the stacks populated would mean the
            // first edit after a project switch re-enabled undo onto the previous project;
            // the router saga dispatches the event and this wrapper keys on it
            expect(
                selectTimeTravel(
                    applyTimeTravel(
                        withHistory(),
                        wholeApplicationReset({
                            reset: { sessionId: "fresh", defaultVisualizationClass: null },
                        }),
                    ),
                ),
            ).toEqual(timeTravelInitialState);
        });
    });

    describe("snapshots", () => {
        it("captures exactly the undoable root keys", () => {
            const state = initial();

            expect(Object.keys(captureSnapshot(state)).sort()).toEqual(
                Object.keys(state)
                    .filter((key) => !(NON_UNDOABLE_ROOT_KEYS as readonly string[]).includes(key))
                    .sort(),
            );
        });

        it("captures exactly the undoable appState keys", () => {
            const state = initial();

            expect(Object.keys(captureSnapshot(state).appState).sort()).toEqual(
                Object.keys(state.appState)
                    .filter((key) => !(NON_UNDOABLE_APP_STATE_KEYS as readonly string[]).includes(key))
                    .sort(),
            );
        });

        it("holds the branches BY REFERENCE, so a step costs one shallow object", () => {
            const state = initial();
            const snapshot = captureSnapshot(state);

            expect(snapshot.data).toBe(state.data);
            expect(snapshot.appState["meta"]).toBe(state.appState["meta"]);
        });

        it("does not mutate the state it captures", () => {
            const state = initial();
            const before = { ...state, appState: { ...state.appState } };

            captureSnapshot(state);

            expect(state).toEqual(before);
            expect(state.appState).toEqual(before.appState);
        });

        it("restores the undoable keys and keeps the live non-undoable ones", () => {
            const snapshotted = withData(initial(), { title: "old title" });
            const snapshot = captureSnapshot(snapshotted);

            let live = withData(snapshotted, { title: "new title" });
            live = withRoot(live, { timezoneOverride: "America/New_York" });
            live = withReport(live, {
                lastSavedObject: withMdObjectMeta(live.report.lastSavedObject, { uri: "/gdc/md/p/obj/1" }),
            });
            live = withAppState(live, {
                messages: { displayed: [{ id: "m1", type: "success", text: "m1" }], delayed: [] },
            });

            const restored = restoreSnapshot(live, snapshot);

            expect(restored.data.title).toEqual("old title");
            expect(restored.timezoneOverride).toEqual("America/New_York");
            expect(restored.report.lastSavedObject.visualizationObject.meta.uri).toEqual("/gdc/md/p/obj/1");
            expect(restored.appState.messages.displayed[0].id).toEqual("m1");
        });

        it("does not mutate the live state or the snapshot it restores", () => {
            const state = initial();
            const snapshot = captureSnapshot(withData(state, { title: "old title" }));
            const snapshotKeys = Object.keys(snapshot);

            restoreSnapshot(state, snapshot);

            expect(state.data.title).not.toEqual("old title");
            expect(Object.keys(snapshot)).toEqual(snapshotKeys);
        });
    });

    describe("undo / redo stack mechanics", () => {
        it("moves an entry from past to future and back", () => {
            let state = applyTimeTravel(initial(), reportTitleChange("first"));
            const pastEntry = selectTimeTravel(state).past[0];

            state = applyTimeTravel(state, undo());
            expect(selectTimeTravel(state).past).toEqual([]);
            expect(selectTimeTravel(state).future.length).toEqual(1);
            // the future entry is labelled by the edit it represents, not by UNDO_ACTION
            expect(selectTimeTravel(state).future[0].actionType).toEqual(pastEntry.actionType);

            state = applyTimeTravel(state, redo());
            expect(selectTimeTravel(state).past.length).toEqual(1);
            expect(selectTimeTravel(state).future).toEqual([]);
        });

        it("never mutates the stacks it reads", () => {
            const state = applyTimeTravel(initial(), reportTitleChange("first"));
            const history = selectTimeTravel(state);

            applyTimeTravel(state, undo());

            expect(history.past.length).toEqual(1);
            expect(history.future.length).toEqual(0);
            expect(selectTimeTravel(state)).toBe(history);
        });

        it("drops the redo stack without touching the past on DISABLE_REDO_ACTION", () => {
            let state = applyTimeTravel(initial(), reportTitleChange("first"));
            state = applyTimeTravel(state, reportTitleChange("second"));
            state = applyTimeTravel(state, undo());

            const next = applyTimeTravel(state, disableRedo());

            expect(selectTimeTravel(next).future).toEqual([]);
            expect(selectTimeTravel(next).past.length).toEqual(1);
        });

        it("is a no-op on DISABLE_REDO_ACTION with an empty redo stack", () => {
            const state = applyTimeTravel(initial(), reportTitleChange("first"));

            expect(applyTimeTravel(state, disableRedo())).toBe(state);
        });

        describe("an undo with nothing to undo", () => {
            it("writes undoApplied", () => {
                const state = withData(initial(), {
                    propertiesMeta: { ...initial().data.propertiesMeta, undoApplied: false },
                });

                expect(applyTimeTravel(state, undo()).data.propertiesMeta.undoApplied).toEqual(true);
            });

            it("returns the SAME state when the flag already holds the value", () => {
                // an unguarded write here would dirty the state on every no-op undo — and
                // propertiesMeta feeds the plug viz render path
                const state = withData(initial(), {
                    propertiesMeta: { ...initial().data.propertiesMeta, undoApplied: true },
                });

                expect(applyTimeTravel(state, undo())).toBe(state);
            });
        });
    });

    describe("withTimeTravel", () => {
        it("runs the transition BEFORE the wrapped reducer, so a snapshot predates the edit", () => {
            const seen: IAppState[] = [];
            const inner = (state: IAppState | undefined, _action: Action): IAppState => {
                const next = withData(state ?? initial(), { title: "written by inner" });
                seen.push(next);
                return next;
            };

            const result = withTimeTravel(inner)(
                withData(initial(), { title: "before" }),
                reportTitleChange("edited"),
            );

            expect(seen.length).toEqual(1);
            expect(selectTimeTravel(result).past[0].state.data.title).toEqual("before");
            expect(result.data.title).toEqual("written by inner");
        });

        it("delegates initialization, so a fresh root starts with an empty history", () => {
            const inner = (_state: IAppState | undefined, _action: Action): IAppState => initial();

            expect(selectTimeTravel(withTimeTravel(inner)(undefined, anAction("@@INIT")))).toEqual(
                timeTravelInitialState,
            );
        });
    });

    describe("through the real root reducer", () => {
        it("starts every store build with an empty history", () => {
            expect(selectTimeTravel(rootReducer(undefined, anAction("@@INIT")))).toEqual(
                timeTravelInitialState,
            );
        });

        it("starts a pluggable remount with an empty history", () => {
            const state = rootReducer(getInitializedState(), reportTitleChange("first"));
            expect(selectTimeTravel(state).past.length).toEqual(1);

            const remounted = rootReducer(state, anAction(ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT));

            expect(selectTimeTravel(remounted)).toEqual(timeTravelInitialState);
        });

        it("keeps the history out of every other reducer's way", () => {
            // the wrapper is the only writer: the combined root holds the key, and the
            // wrappers must not resurrect or drop it
            const state = rootReducer(getInitializedState(), reportTitleChange("first"));
            const history = selectTimeTravel(state);

            const next = rootReducer(state, reportExecutionStarted("exec-1", 100));

            expect(selectTimeTravel(next)).toBe(history);
        });
    });
});
