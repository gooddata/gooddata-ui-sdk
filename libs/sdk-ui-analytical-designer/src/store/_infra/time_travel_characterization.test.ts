// (C) 2026 GoodData Corporation

/**
 * Characterization tests for the undo/redo (time travel) behavior, driven through the REAL
 * rootReducer — exactly the way the running app exercises it. They pin the observable semantics; the
 * mechanism itself is covered by `time_travel.test.ts`.
 */

import { type UnknownAction } from "redux";
import { beforeEach, describe, expect, it } from "vitest";

import {
    appFinishedLoading,
    clearInsightContent,
    resetApplication,
} from "../../actions/app_context_actions.js";
import { reportTitleChange } from "../../actions/report_actions.js";
import { saveReportFinished } from "../../actions/save_actions.js";
import { redo, undo } from "../../actions/time_travel_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { FilterBarUiActionTypeKeys } from "../../sagas/filter_bar/filter_bar_ui_actions.js";
import { redoPossible, undoPossible } from "../../selectors/editor_header_selector.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { withMdObjectContent, withMdObjectMeta } from "../../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import {
    withAppState,
    withData,
    withReport,
    withRoot,
    withShortcut,
} from "../../tests/state_builder.test.helpers.js";
import { type IVisualization } from "../../typings/bear/bearTypes.js";
import { type ILoadedReportItems, type IReportContent } from "../../typings/report.js";
import { buildOpenReportFinished } from "../../utils/open_report_actions.js";
import { storeFilterBarAutoOpen } from "../filter_bar/filter_bar_actions.js";
import { type IMessagesState } from "../messages/messages_state.js";
import { type IAppState } from "../types.js";

import { selectTimeTravel } from "./time_travel.js";

describe("time travel characterization (via rootReducer + in-store history)", () => {
    let state: IAppState;

    function reduce(action: UnknownAction) {
        state = rootReducer(state, action);
    }

    const past = () => selectTimeTravel(state).past;
    const future = () => selectTimeTravel(state).future;

    beforeEach(() => {
        // a fresh root carries an empty history — no module-level reset to remember (8.1)
        state = getInitializedState();
    });

    describe("snapshotting", () => {
        it("should push a snapshot and enable undo on a whitelisted action", () => {
            reduce(reportTitleChange("first"));

            expect(past().length).toEqual(1);
            expect(future().length).toEqual(0);
            expect(undoPossible(state)).toEqual(true);
            expect(redoPossible(state)).toEqual(false);
        });

        it("should snapshot the state as it was BEFORE the whitelisted action applied", () => {
            reduce(reportTitleChange("first"));
            reduce(reportTitleChange("second"));

            expect(past().length).toEqual(2);
            expect(past()[1].state.data.title).toEqual("first");
        });

        it("should not snapshot UI_VIS_PROPERTIES_CHANGED when payload.ignoreUndoRedo is set", () => {
            reduce({
                type: ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED,
                payload: { ignoreUndoRedo: true },
            });

            expect(past().length).toEqual(0);

            reduce({ type: ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED, payload: {} });

            expect(past().length).toEqual(1);
        });
    });

    describe("undo / redo round trip", () => {
        it("should restore the pre-action state on undo and reapply it on redo", () => {
            reduce(reportTitleChange("first"));
            reduce(reportTitleChange("second"));
            expect(state.data.title).toEqual("second");

            reduce(undo());

            expect(state.data.title).toEqual("first");
            expect(future().length).toEqual(1);
            expect(redoPossible(state)).toEqual(true);

            reduce(redo());

            expect(state.data.title).toEqual("second");
            expect(future().length).toEqual(0);
        });

        it("should set propertiesMeta.undoApplied on undo and clear it on redo", () => {
            reduce(reportTitleChange("first"));

            reduce(undo());
            expect(state.data.propertiesMeta.undoApplied).toEqual(true);

            reduce(redo());
            expect(state.data.propertiesMeta.undoApplied).toEqual(false);
        });

        /**
         * The specs above ride on `data.title`. These two pin the branch-level contract every
         * editor domain depends on — buckets, filters, properties, chart sort all live under
         * `data` and are restored the same way, so a projection mistake shows up here rather than
         * in whichever domain happens to have a spec.
         */
        it("should restore the whole data branch, not just the key the action wrote", () => {
            state = withData(state, { visualizationProperties: { controls: { legend: "before" } } });
            reduce(reportTitleChange("edit"));
            state = withData(state, { visualizationProperties: { controls: { legend: "after" } } });

            reduce(undo());

            expect(state.data.visualizationProperties.controls["legend"]).toEqual("before");
        });

        it("should replace the data branch WHOLESALE, dropping a key added after the snapshot", () => {
            reduce(reportTitleChange("edit"));
            // the key is DELIBERATELY not on the data type — that is what the undo has to drop
            state = withRoot(state, {
                data: { ...state.data, aKeyTheSnapshotNeverSaw: "value" } as IAppState["data"],
            });

            reduce(undo());

            expect((state.data as Record<string, unknown>)["aKeyTheSnapshotNeverSaw"]).toBeUndefined();
        });

        it("should purge the redo stack when a new whitelisted action arrives after undo", () => {
            reduce(reportTitleChange("first"));
            reduce(undo());
            expect(future().length).toEqual(1);

            reduce(reportTitleChange("third"));

            expect(future().length).toEqual(0);
            expect(redoPossible(state)).toEqual(false);
        });
    });

    describe("restore-time fixups", () => {
        it("should carry current messages over an undo (messages are not undone)", () => {
            reduce(reportTitleChange("first"));
            // partial messages — the undo only carries them over
            const messages = { displayed: [{ id: "m1" }], delayed: [] } as IMessagesState;
            state = withAppState(state, { messages });

            reduce(undo());

            expect(state.appState.messages).toEqual(messages);
        });

        it("should carry current timezone override over an undo (session UI is not undone)", () => {
            reduce(reportTitleChange("first"));
            state = withRoot(state, { timezoneOverride: "America/New_York" });

            reduce(undo());

            expect(state.timezoneOverride).toEqual("America/New_York");
        });

        it("should not restore a snapshotted timezone override on undo of an unrelated edit", () => {
            state = withRoot(state, { timezoneOverride: "Europe/Prague" });
            reduce(reportTitleChange("first"));
            state = withRoot(state, { timezoneOverride: "America/New_York" });

            reduce(undo());

            expect(state.timezoneOverride).toEqual("America/New_York");
        });

        it("should carry the current filter bar auto-open hand-over over an undo (one-shot UI is not undone)", () => {
            reduce(reportTitleChange("first"));
            reduce(storeFilterBarAutoOpen("filter1"));

            reduce(undo());

            expect(state.filterBarAutoOpen).toEqual("filter1");
        });

        it("should not bring a released filter bar auto-open hand-over back on undo or redo of the add", () => {
            // the add's snapshot is taken before the hand-over is written, and closing the picker
            // releases (clears) the hand-over before the user can undo
            reduce({ type: FilterBarUiActionTypeKeys.UI_ADD_FILTER });
            reduce(storeFilterBarAutoOpen("filter1"));
            reduce(storeFilterBarAutoOpen(null));

            reduce(undo());
            expect(state.filterBarAutoOpen).toEqual(null);

            reduce(redo());
            expect(state.filterBarAutoOpen).toEqual(null);
        });

        it("should carry the last saved object over an undo when a report is saved", () => {
            reduce(reportTitleChange("first"));
            state = withReport(state, {
                lastSavedObject: withMdObjectContent(state.report.lastSavedObject, {
                    some: "content",
                } as unknown as IReportContent),
            });

            reduce(undo());

            expect(state.report.lastSavedObject.visualizationObject.content).toEqual({
                some: "content",
            });
        });

        it("should clear collapsed-buckets meta from the restored state", () => {
            state = withData(
                withData(state, { bucketsMeta: { ...state.data.bucketsMeta, measureExpanded: "m1" } }),
                {
                    bucketsMeta: {
                        ...withData(state, {
                            bucketsMeta: { ...state.data.bucketsMeta, measureExpanded: "m1" },
                        }).data.bucketsMeta,
                        attributeExpanded: "a1",
                    },
                },
            );
            reduce(reportTitleChange("first"));

            reduce(undo());

            expect(state.data.bucketsMeta.measureExpanded).toBeUndefined();
            expect(state.data.bucketsMeta.attributeExpanded).toBeUndefined();
        });

        it("should reset the dropped shortcut item on undo", () => {
            state = withShortcut(state, { shortcutDroppedItem: { id: "x" } });
            reduce(reportTitleChange("first"));

            reduce(undo());

            expect(state.data.shortcut.shortcutDroppedItem).toEqual(null);
        });
    });

    /**
     * A snapshot does NOT capture the `report` branch, so nothing inside the history can go stale —
     * no execution still marked running, no lastSavedObject pointing at a deleted report — and no
     * reducer ever has to reach into the history to patch a copy. These specs pin that invariant.
     */
    describe("the report branch is not undoable", () => {
        it("should keep the LIVE execution across an undo, so a superseded result cannot be restored", () => {
            reduce({ type: ActionTypeKeys.REPORT_EXECUTION_STARTED, meta: { id: "exec-old" } });
            reduce(reportTitleChange("first"));
            reduce({ type: ActionTypeKeys.REPORT_EXECUTION_STARTED, meta: { id: "exec-new" } });

            reduce(undo());

            expect(state.report.execution.id).toEqual("exec-new");
            expect(state.report.execution.running).toEqual(true);
        });

        it("should leave both the live state and the history untouched on a superseded execution error", () => {
            reduce({ type: ActionTypeKeys.REPORT_EXECUTION_STARTED, meta: { id: "exec-old" } });
            reduce(reportTitleChange("first"));
            reduce({ type: ActionTypeKeys.REPORT_EXECUTION_STARTED, meta: { id: "exec-new" } });
            const historyBefore = selectTimeTravel(state);

            reduce({
                type: ActionTypeKeys.REPORT_EXECUTION_ERROR,
                meta: { id: "exec-old" },
                payload: { status: 400 },
            });

            expect(state.report.execution.error?.status).toBeUndefined();
            // identity, not deep equality: the point is that nothing reached into the history
            expect(selectTimeTravel(state)).toBe(historyBefore);
        });

        it("should keep the live lastSavedObject when a report is deleted, leaving snapshots alone", () => {
            state = withReport(
                withReport(state, {
                    lastSavedObject: withMdObjectContent(state.report.lastSavedObject, {
                        c: 1,
                    } as unknown as IReportContent),
                }),
                {
                    lastSavedObject: withMdObjectMeta(
                        withReport(state, {
                            lastSavedObject: withMdObjectContent(state.report.lastSavedObject, {
                                c: 1,
                            } as unknown as IReportContent),
                        }).report.lastSavedObject,
                        { uri: "/gdc/md/project/obj/1" },
                    ),
                },
            );
            reduce(reportTitleChange("first"));
            const historyBefore = selectTimeTravel(state);

            reduce({
                type: ActionTypeKeys.DELETE_REPORT_STARTED,
                payload: { insightRef: { uri: "/gdc/md/project/obj/1" } },
            });

            expect(selectTimeTravel(state)).toBe(historyBefore);
            // the snapshot has no `report` key at all — nothing to resurrect, nothing to patch
            expect(
                (past()[0].state as Partial<IAppState>).report?.lastSavedObject?.visualizationObject?.meta
                    ?.uri,
            ).toBeUndefined();
        });
    });

    describe("history reset triggers", () => {
        function expectHistoryCleared() {
            expect(past().length).toEqual(0);
            expect(future().length).toEqual(0);
            expect(undoPossible(state)).toEqual(false);
            expect(redoPossible(state)).toEqual(false);
        }

        const minimalReportMDObject = { visualizationObject: { content: {} } } as IVisualization;
        const minimalLoadedItems: ILoadedReportItems = {
            itemCache: {},
            filterItems: {},
            allDateDatasets: { available: [], unavailable: 0 },
            availableDateDatasets: { available: [], unavailable: 0 },
            parameterFilters: [],
            parameterWarnings: [],
        };

        it.each([
            [ActionTypeKeys.RESET_APPLICATION as string, () => resetApplication()],
            [
                ActionTypeKeys.OPEN_REPORT_FINISHED as string,
                () =>
                    buildOpenReportFinished(
                        state,
                        newInsight("local:table", "insight.id", "/gdc/md/project/obj/1"),
                        minimalLoadedItems,
                        123,
                        true,
                    ),
            ],
            [ActionTypeKeys.CLEAR_INSIGHT_CONTENT as string, () => clearInsightContent()],
            [
                ActionTypeKeys.SAVE_REPORT_FINISHED as string,
                () => saveReportFinished(minimalReportMDObject, true, 123),
            ],
            [ActionTypeKeys.APP_READINESS_CHANGE as string, () => appFinishedLoading()],
        ])("should clear both stacks and flags on %s", (_type, createAction) => {
            reduce(reportTitleChange("first"));
            reduce(undo());
            reduce(reportTitleChange("second"));
            expect(past().length).toBeGreaterThan(0);

            reduce(createAction());

            expectHistoryCleared();
        });

        it("should NOT clear history on SAVE_REPORT_FINISHED without saveAsNew", () => {
            reduce(reportTitleChange("first"));

            reduce(saveReportFinished(minimalReportMDObject, false, 123));

            expect(past().length).toEqual(1);
            expect(undoPossible(state)).toEqual(true);
        });
    });
});
