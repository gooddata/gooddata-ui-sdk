// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { savedInsightPermissionsLoaded } from "../../actions/insight_access_actions.js";
import { openReportFailed, openReportStarted } from "../../actions/open_actions.js";
import { reportExecutionStarted } from "../../actions/report_actions.js";
import { saveReportError, saveReportFinished, saveReportStarted } from "../../actions/save_actions.js";
import { LOCAL_TABLE } from "../../constants/visualization_types.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { buildInitialState } from "../../reducers/initial_state.js";
import {
    bucketFiltersWithSelection,
    metadataBucketFiltersWithSelection,
} from "../../tests/constants.test.helpers.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withReport } from "../../tests/state_builder.test.helpers.js";
import { type IVisualization } from "../../typings/bear/bearTypes.js";
import { type ILoadedReportItems } from "../../typings/report.js";
import { buildOpenReportFinished } from "../../utils/open_report_actions.js";
import { type IAppState } from "../types.js";

import {
    getLastSavedObject,
    getReportLoadingError,
    isReportNowOpen,
    isReportOpening,
    isReportSaving,
    isReportSavingAsNew,
} from "./report_selectors.js";
import { lastSavedObjectInitialState } from "./report_state.js";

describe("report store", () => {
    const state = getInitializedState();

    const minimalLoadedItems: ILoadedReportItems = {
        itemCache: {},
        filterItems: {},
        allDateDatasets: { available: [], unavailable: 0 },
        availableDateDatasets: { available: [], unavailable: 0 },
        parameterFilters: [],
        parameterWarnings: [],
    };

    // the failure action carries the application-reset values; the report leaves
    // under test here reset via the matcher, so a minimal carrier is enough
    const testCarrier: Parameters<typeof openReportFailed>[0] = {
        sessionId: "fresh",
        defaultVisualizationClass: null,
    };

    const buildOpenFinished = (isDraft = false) => {
        const insight = newInsight("local:table", "foo", "/gdc/md/vo1", (i) =>
            i.title("foo").filters(bucketFiltersWithSelection).properties({}),
        );
        insight.insight.tags = ["tag1", "tag2"];
        insight.insight.summary = "summary of the object";
        // the FULL operation result: driving the combined root means every owning slice
        // consumes the payload, so a stubbed result is not enough
        return buildOpenReportFinished(state, insight, minimalLoadedItems, 123, true, isDraft);
    };

    const savedReport: IVisualization = {
        visualizationObject: {
            content: {
                visualizationClass: { uri: "/gdc/md/project/obj/666" },
                buckets: [],
            },
            meta: {
                title: "report",
                uri: "/gdc/md/project/obj/12345",
                identifier: "foo",
                summary: "summary of the object",
                tags: ["tag1", "tag2"],
            },
        },
    };

    describe("saving flags", () => {
        it("SAVE_REPORT_STARTED/FINISHED/ERROR drive `saving` for a plain save and never touch `savingAsNew`", () => {
            const started = combinedRootReducer(state, saveReportStarted(false));
            expect(isReportSaving(started)).toBe(true);
            expect(isReportSavingAsNew(started)).toBe(false);

            const finished = combinedRootReducer(started, saveReportFinished(savedReport, false, 123));
            expect(isReportSaving(finished)).toBe(false);

            const errored = combinedRootReducer(started, saveReportError(false, 123));
            expect(isReportSaving(errored)).toBe(false);
        });

        it("the saveAsNew variants drive `savingAsNew` and never touch `saving`", () => {
            const started = combinedRootReducer(state, saveReportStarted(true));
            expect(isReportSavingAsNew(started)).toBe(true);
            expect(isReportSaving(started)).toBe(false);

            const errored = combinedRootReducer(started, saveReportError(true, 123));
            expect(isReportSavingAsNew(errored)).toBe(false);
        });
    });

    describe("opening / nowOpen", () => {
        it("OPEN_REPORT_STARTED raises `opening`, OPEN_REPORT_FINISHED lowers it and opens the report", () => {
            const opening = combinedRootReducer(state, openReportStarted("project", "report"));
            expect(isReportOpening(opening)).toBe(true);
            expect(isReportNowOpen(opening)).toBe(false);

            const opened = combinedRootReducer(opening, buildOpenFinished());
            expect(isReportOpening(opened)).toBe(false);
            expect(isReportNowOpen(opened)).toBe(true);
        });
    });

    describe("loadingError", () => {
        it("OPEN_REPORT_FAILED with a reason stores it; started/finished clear it", () => {
            const failed = combinedRootReducer(
                state,
                openReportFailed(testCarrier, false, "incorrectMetadata"),
            );
            expect(getReportLoadingError(failed)).toEqual("incorrectMetadata");

            const restarted = combinedRootReducer(failed, openReportStarted("project", "report"));
            expect(getReportLoadingError(restarted)).toBeUndefined();
        });

        it("OPEN_REPORT_FAILED without a reason leaves the leaf alone (report-not-found path)", () => {
            const failed = combinedRootReducer(state, openReportFailed(testCarrier));
            expect(getReportLoadingError(failed)).toBeUndefined();
        });

        it("REPORT_EXECUTION_STARTED clears the previous error (absorbed from execution_apply_reducer)", () => {
            const failed = combinedRootReducer(
                state,
                openReportFailed(testCarrier, false, "incorrectMetadata"),
            );

            const restarted = combinedRootReducer(failed, reportExecutionStarted("exec-1", 100));

            expect(getReportLoadingError(restarted)).toBeUndefined();
        });

        /**
         * The slice stores null for "no error", because a non-draftable state cannot be undefined.
         * The accessor is the ONE sanctioned read and converts back to undefined — `null !==
         * undefined` would otherwise flip hasReportLoadingError/isReportValid and paint an error
         * screen over a healthy report.
         */
        it("the stored null never leaks through the accessor", () => {
            const restarted = combinedRootReducer(state, openReportStarted("project", "report"));

            expect(restarted.report.loadingError).toBeNull();
            expect(getReportLoadingError(restarted)).toBeUndefined();
        });
    });

    describe("lastSavedObject", () => {
        it("SAVE_REPORT_FINISHED stores the saved object wholesale", () => {
            const saved = combinedRootReducer(state, saveReportFinished(savedReport, false, 123));

            expect(getLastSavedObject(saved)).toEqual(savedReport);
        });

        it("takes refreshed permissions of the open visualization, keeping its content", () => {
            const saved = combinedRootReducer(state, saveReportFinished(savedReport, false, 123));
            const refreshed = combinedRootReducer(saved, savedInsightPermissionsLoaded("foo", ["VIEW"]));

            expect(getLastSavedObject(refreshed).visualizationObject.meta.permissions).toEqual(["VIEW"]);
            expect(getLastSavedObject(refreshed).visualizationObject.content).toBe(
                getLastSavedObject(saved).visualizationObject.content,
            );
        });

        it("ignores refreshed permissions of a visualization that is no longer open", () => {
            const saved = combinedRootReducer(state, saveReportFinished(savedReport, false, 123));
            const refreshed = combinedRootReducer(saved, savedInsightPermissionsLoaded("bar", ["VIEW"]));

            expect(getLastSavedObject(refreshed)).toBe(getLastSavedObject(saved));
        });

        it("OPEN_REPORT_FINISHED stores the save-button-compatible report", () => {
            const opened = combinedRootReducer(state, buildOpenFinished());

            expect(getLastSavedObject(opened)).toEqual({
                visualizationObject: {
                    content: {
                        buckets: [],
                        filters: metadataBucketFiltersWithSelection,
                        properties: "{}",
                        visualizationClass: { uri: LOCAL_TABLE },
                    },
                    meta: {
                        category: "visualizationObject",
                        created: undefined,
                        identifier: "foo",
                        title: "foo",
                        tags: ["tag1", "tag2"],
                        summary: "summary of the object",
                        updated: undefined,
                        uri: "/gdc/md/vo1",
                    },
                },
            });
        });

        it("a draft open keeps the last saved object untouched", () => {
            const opened = combinedRootReducer(state, buildOpenFinished(true));

            expect(getLastSavedObject(opened)).toEqual(lastSavedObjectInitialState);
        });

        it("normalizes array-valued visualization properties to the empty object", () => {
            // the wrong collection KIND: `typeof [] === "object"`, so a bare typeof check lets
            // `properties: []` through into the metadata pipeline — the helper kind-checks now
            const insight = newInsight("local:table", "foo", "/gdc/md/vo1", (i) => i.title("foo"));
            insight.insight.properties = [];

            const opened = combinedRootReducer(
                state,
                buildOpenReportFinished(state, insight, minimalLoadedItems, 123, true, false),
            );

            expect(getLastSavedObject(opened).visualizationObject.content.properties).toEqual("{}");
        });
    });

    describe("identity — a repeated identical write must not dirty the report branch", () => {
        it("re-reporting an identical save keeps the report branch's identity", () => {
            const saved = combinedRootReducer(state, saveReportFinished(savedReport, false, 123));

            // a NEW action object with a deep-equal payload — the isEqual guard in the slice
            // has to answer identity for a deep-equal re-save.
            // Scoped to the report branch: through the combined root a re-save legitimately
            // pushes a fresh save-success toast into appState.messages, so the ROOT reference
            // is expected to change.
            const resaved = combinedRootReducer(saved, saveReportFinished(savedReport, false, 123));
            expect(resaved?.report).toBe(saved?.report);
        });

        it("re-opening the identical report leaves the lastSavedObject reference stable", () => {
            const opened = combinedRootReducer(state, buildOpenFinished());

            const reopened = combinedRootReducer(opened, buildOpenFinished());

            expect(reopened?.report?.lastSavedObject).toBe(opened?.report?.lastSavedObject);
        });

        it("an unrelated action returns the same root", () => {
            expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
        });
    });

    describe("accessors on the pristine state", () => {
        // The PRISTINE state is the reducer's own default build: strict `combineReducers`
        // self-initializes every leaf, and the closed root type (store/types.ts) has no way to
        // express an absent one. What is pinned here is that the build answers the initial values.
        const pristine = buildInitialState();

        it("serve the domain's initial values", () => {
            expect(isReportSaving(pristine)).toBe(false);
            expect(isReportSavingAsNew(pristine)).toBe(false);
            expect(isReportOpening(pristine)).toBe(false);
            expect(isReportNowOpen(pristine)).toBe(false);
            expect(getReportLoadingError(pristine)).toBeUndefined();
        });

        it("the last saved object answers the seed's child values", () => {
            expect(getLastSavedObject(pristine).visualizationObject.meta.title).toEqual("");
            expect(getLastSavedObject(pristine).visualizationObject.content).toBeNull();
            expect(getLastSavedObject(pristine).visualizationObject.meta.uri).toBeUndefined();
        });
    });

    describe("external writers keep working against the slice-owned leaves", () => {
        it("a setIn write straight into the branch is visible through the accessors", () => {
            // the application reset and execution_apply_reducer write these leaves via the
            // mounts must not fight them between dispatches
            const written = withReport(withReport(state, { nowOpen: true }), {
                saving: true,
            }) as unknown as IAppState;

            expect(isReportNowOpen(written)).toBe(true);
            expect(isReportSaving(written)).toBe(true);
        });
    });
});
