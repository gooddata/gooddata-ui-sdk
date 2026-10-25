// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { type VisualizationProperties, uriRef } from "@gooddata/sdk-model";

import { deleteReportFinished, deleteReportStarted } from "../actions/delete_actions.js";
import { openReportStarted } from "../actions/open_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { saveReportError, saveReportFinished, saveReportStarted } from "../actions/save_actions.js";
import { NOT_FOUND } from "../constants/errors.js";
import { redoPossible, undoPossible } from "../selectors/editor_header_selector.js";
import { selectTimeTravel } from "../store/_infra/time_travel.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
} from "../store/app_context/application_reset_events.js";
import { getExecutionState } from "../store/execution/execution_selectors.js";
import { getReportLoadingError } from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import {
    bucketFiltersWithSelection,
    metadataBucketFiltersWithSelection,
    pieVisualizationClass,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { newInsight } from "../tests/insightMocking.test.helpers.js";
import { withMdObjectMeta } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";
import {
    type IObjectMeta,
    type IVisualizationObject,
    type IVisualizationObjectContent,
} from "../typings/bear/bearTypes.js";
import { type ILoadedReportItems } from "../typings/report.js";
import { buildOpenReportFailed, buildOpenReportFinished } from "../utils/open_report_actions.js";

import { rootReducer } from "./root_reducer.js";

/**
 * Characterization suite for the report cluster: open_report + save_report + delete_report and the
 * state they own — the report branch leaves (`saving`, `savingAsNew`, `opening`, `nowOpen`,
 * `loadingError`, `lastSavedObject`) and the insight leaves (`data.title`, `data.tags`,
 * `data.summary`, `data.layers`, `data.layersOwner`).
 *
 * Every test drives the FULL root chain (rootReducer), so if an assertion has to be edited, that
 * edit IS a behavior change.
 */
describe("report cluster characterization", () => {
    const state = getInitializedState();

    const dispatch = (initial: IAppState, ...actions: UnknownAction[]): IAppState =>
        actions.reduce((acc, action) => rootReducer(acc, action), initial);

    // the reset scopes are semantic EVENTS — the trigger writes nothing and
    // reset_sagas translates it (store/app_context/application_reset_events.ts)
    const applyApplicationCleared = (current: IAppState): IAppState =>
        rootReducer(
            current,
            applicationCleared({
                reset: buildApplicationResetCarrier(getVisualizationClassesState(current)),
            }),
        );

    const buildOpenFinishedAction = (
        against: IAppState,
        {
            properties,
            useDefaultClass = false,
            isDraft = false,
            tags,
            summary,
        }: {
            // a string is the INVALID input one scenario feeds the normalization
            properties?: VisualizationProperties | string;
            useDefaultClass?: boolean;
            isDraft?: boolean;
            tags?: string[];
            summary?: string;
        } = {},
    ) => {
        const loadedItems: ILoadedReportItems = {
            itemCache: {
                "attribute.id": {
                    identifier: "attribute.id",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                },
            },
            filterItems: {
                "/gdc/md/TeamOneGoodSales1/obj/952": {
                    items: [{ uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282", title: "e1" }],
                    total: 1,
                },
            },
            allDateDatasets: { available: [], unavailable: 0 },
            availableDateDatasets: { available: [], unavailable: 0 },
            parameterFilters: [],
            parameterWarnings: [],
        };

        const insight = newInsight("local:table", "foo", "/gdc/md/vo1", (i) =>
            i
                .title("foo")
                .filters(bucketFiltersWithSelection)
                .properties((properties || {}) as VisualizationProperties),
        );
        if (tags !== undefined || summary !== undefined) {
            insight.insight.tags = tags;
            insight.insight.summary = summary;
        }

        // built through the saga's own boundary against the state the caller
        // dispatches over, so the carried operation result is the production one
        return buildOpenReportFinished(against, insight, loadedItems, 123, useDefaultClass, isDraft);
    };

    const buildSaveReportFinished = ({
        saveAsNew = false,
        meta = {},
        content = null,
    }: {
        saveAsNew?: boolean;
        meta?: Partial<IObjectMeta>;
        content?: Partial<IVisualizationObjectContent>;
    } = {}) =>
        saveReportFinished(
            {
                visualizationObject: {
                    meta: {
                        title: "saved title",
                        uri: "/gdc/md/p/obj/42",
                        ...meta,
                    },
                    content,
                } as IVisualizationObject,
            },
            saveAsNew,
            123,
        );

    describe("OPEN_REPORT_STARTED", () => {
        const started = () => openReportStarted("projectId", "reportId");

        it("marks the report opening and clears the previous loading error", () => {
            const failed = withReport(state, { loadingError: "incorrectMetadata" });

            const result = dispatch(failed, started());

            expect(result.report.opening).toBe(true);
            // read through the domain accessor: the slice stores null for "no error" and the
            // accessor converts it back to the undefined every reader tests against
            expect(getReportLoadingError(result)).toBeUndefined();
        });

        it("clears the current insight meta (title, tags, summary)", () => {
            const dirty = withData(withData(withData(state, { title: "previous" }), { tags: ["a"] }), {
                summary: "previous summary",
            });

            const result = dispatch(dirty, started());

            expect(result.data.title).toEqual("");
            expect(result.data.tags).toEqual([]);
            expect(result.data.summary).toEqual("");
        });

        it("drops the extended reference point and resets the reference point to the initial buckets", () => {
            const dirty = withData(state, { extendedReferencePoint: {} });

            const result = dispatch(dirty, started());

            expect(result.data.extendedReferencePoint).toBeNull();
            expect(result.data.referencePoint).toEqual({
                buckets: [],
            });
        });

        it("does not touch nowOpen or the saving flags", () => {
            const opened = withReport(withReport(state, { nowOpen: true }), { saving: true });

            const result = dispatch(opened, started());

            expect(result.report.nowOpen).toBe(true);
            expect(result.report.saving).toBe(true);
        });
    });

    describe("OPEN_REPORT_FINISHED", () => {
        const withClasses = withData(state, { visualizationClasses: [tableVisualizationClass] });

        it("stores the converted buckets and mirrors them into the reference point", () => {
            const result = dispatch(withClasses, buildOpenFinishedAction(withClasses));

            expect(result.data.buckets).toEqual([]);
            expect(result.data.buckets).toBe(result.data.referencePoint.buckets);
            expect(result.data.referencePoint.reportNotFound).toBe(false);
        });

        it("selects the visualization class by the insight's url", () => {
            const result = dispatch(withClasses, buildOpenFinishedAction(withClasses));

            expect(result.data.visualizationClass.visualizationClass.url).toEqual("local:table");
        });

        it("falls back to the default class when asked to (deleted/deprecated class)", () => {
            const withPie = withData(state, { visualizationClasses: [pieVisualizationClass] });

            const result = dispatch(withPie, buildOpenFinishedAction(withPie, { useDefaultClass: true }));

            expect(result.data.visualizationClass.visualizationClass.url).toEqual("local:pie");
        });

        it("writes the insight meta: title, tags, summary, layers owner", () => {
            const result = dispatch(
                withClasses,
                buildOpenFinishedAction(withClasses, {
                    tags: ["tag1", "tag2"],
                    summary: "summary of the object",
                }),
            );

            expect(result.data.title).toEqual("foo");
            expect(result.data.tags).toEqual(["tag1", "tag2"]);
            expect(result.data.summary).toEqual("summary of the object");
            expect(result.data.layersOwner).toEqual("foo");
        });

        it("stores the save-button-compatible last saved object", () => {
            const result = dispatch(
                withClasses,
                buildOpenFinishedAction(withClasses, { tags: ["tag1"], summary: "s" }),
            );

            expect(result.report.lastSavedObject.visualizationObject.content).toEqual({
                buckets: [],
                filters: metadataBucketFiltersWithSelection,
                properties: "{}",
                visualizationClass: { uri: "local:table" },
            });
            expect(result.report.lastSavedObject.visualizationObject.meta.title).toEqual("foo");
        });

        it("opens the report: nowOpen set, opening and loadingError cleared", () => {
            const opening = dispatch(state, openReportStarted("projectId", "reportId"));

            const result = dispatch(opening, buildOpenFinishedAction(opening));

            expect(result.report.nowOpen).toBe(true);
            expect(result.report.opening).toBe(false);
            expect(getReportLoadingError(result)).toBeUndefined();
        });

        it("keeps the draft's meta and last saved object out of the state (isDraft)", () => {
            const result = dispatch(withClasses, buildOpenFinishedAction(withClasses, { isDraft: true }));

            expect(result.data.title).toEqual("");
            expect(result.report.lastSavedObject.visualizationObject.content).toEqual(null);
            expect(result.report.lastSavedObject).toEqual(state.report.lastSavedObject);
            // the layers owner is written for drafts too — it identifies the opened insight
            expect(result.data.layersOwner).toEqual("foo");
            expect(result.report.nowOpen).toBe(true);
        });

        it("merges the loaded item cache over the existing entries", () => {
            const originalCache = {
                measureInCache: { uri: "/gdc/md/obj/1" },
            };
            const withCache = withData(withClasses, { itemCache: originalCache });

            const result = dispatch(withCache, buildOpenFinishedAction(withCache));

            expect(result.data.itemCache).toEqual({
                ...originalCache,
                "attribute.id": {
                    identifier: "attribute.id",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                    dfRef: { uri: "/gdc/md/TeamOneGoodSales1/obj/952" },
                },
            });
        });

        it("marks only the attribute and date filters as modified", () => {
            const result = dispatch(
                withClasses,
                buildOpenFinishedAction(withClasses, { useDefaultClass: true }),
            );

            expect(result.data.bucketsMeta.modified).toEqual({
                "attribute.id": true,
                "attr.datedataset": true,
            });
        });

        it("normalizes invalid visualization properties to an empty object", () => {
            const result = dispatch(
                withClasses,
                buildOpenFinishedAction(withClasses, { properties: "invalid properties" }),
            );

            expect(result.data.visualizationProperties).toEqual({});
        });

        it("resets the properties meta and collapses the configuration panel", () => {
            const dirty = withData(withData(withClasses, { propertiesMeta: { undoApplied: true } }), {
                configurationPanel: { ...withClasses.data.configurationPanel, collapsed: false },
            });

            const result = dispatch(dirty, buildOpenFinishedAction(dirty));

            expect(result.data.propertiesMeta).toEqual({});
            expect(result.data.configurationPanel.collapsed).toBe(true);
        });

        it("clears the undo/redo history", () => {
            const withHistory = dispatch(state, reportTitleChange("make it undoable"));
            expect(undoPossible(withHistory)).toBe(true);
            expect(selectTimeTravel(withHistory).past).toHaveLength(1);

            const result = dispatch(withHistory, buildOpenFinishedAction(withHistory));

            expect(undoPossible(result)).toBe(false);
            expect(redoPossible(result)).toBe(false);
            expect(selectTimeTravel(result).past).toHaveLength(0);
        });
    });

    describe("OPEN_REPORT_FAILED", () => {
        it("without a reason: resets the application and flags report-not-found", () => {
            const dirty = dispatch(state, reportTitleChange("dirty"), buildOpenFinishedAction(state));

            const result = dispatch(dirty, buildOpenReportFailed(dirty));

            expect(result.data.referencePoint.reportNotFound).toBe(true);
            expect(getExecutionState(result).error?.status).toEqual(NOT_FOUND);
            expect(getReportLoadingError(result)).toBeUndefined();
            expect(result.report.nowOpen).toBe(false);
            expect(result.data.title).toEqual("");
        });

        it("with a reason: resets the application and stores the loading error instead", () => {
            const dirty = dispatch(state, buildOpenFinishedAction(state));

            const result = dispatch(dirty, buildOpenReportFailed(dirty, false, "incorrectMetadata"));

            expect(getReportLoadingError(result)).toEqual("incorrectMetadata");
            expect(result.data.referencePoint.reportNotFound).toBe(false);
            expect(getExecutionState(result).error).toBeUndefined();
            expect(result.report.nowOpen).toBe(false);
        });

        it("the application reset refreshes the session id and clears the last saved object", () => {
            const dirty = dispatch(state, buildOpenFinishedAction(state));
            const sessionBefore = dirty.appState.sessionId;

            const result = dispatch(dirty, buildOpenReportFailed(dirty));

            expect(result.appState.sessionId).not.toEqual(sessionBefore);
            expect(result.report.lastSavedObject).toEqual(state.report.lastSavedObject);
        });
    });

    describe("SAVE_REPORT_STARTED / SAVE_REPORT_ERROR", () => {
        it("raises and clears `saving` for a plain save", () => {
            const started = dispatch(state, saveReportStarted(false));
            expect(started.report.saving).toBe(true);
            expect(started.report.savingAsNew).toBeFalsy();

            const errored = dispatch(started, saveReportError(false, 123));
            expect(errored.report.saving).toBe(false);
        });

        it("raises and clears `savingAsNew` for save-as-new", () => {
            const started = dispatch(state, saveReportStarted(true));
            expect(started.report.savingAsNew).toBe(true);
            expect(started.report.saving).toBeFalsy();

            const errored = dispatch(started, saveReportError(true, 123));
            expect(errored.report.savingAsNew).toBe(false);
        });
    });

    describe("SAVE_REPORT_FINISHED", () => {
        it("clears the saving flag and stores the saved object wholesale", () => {
            const saving = dispatch(state, saveReportStarted(false));

            const result = dispatch(
                saving,
                buildSaveReportFinished({ meta: { tags: ["t1"], summary: "sum", identifier: "id-1" } }),
            );

            expect(result.report.saving).toBe(false);
            expect(result.report.lastSavedObject.visualizationObject.meta.title).toEqual("saved title");
            expect(result.report.lastSavedObject.visualizationObject.meta.uri).toEqual("/gdc/md/p/obj/42");
        });

        it("updates the insight meta the save changed: tags, summary, layers owner — but not the title", () => {
            const titled = dispatch(state, reportTitleChange("current title"));

            const result = dispatch(
                titled,
                buildSaveReportFinished({ meta: { tags: ["t1"], summary: "sum", identifier: "id-1" } }),
            );

            expect(result.data.tags).toEqual(["t1"]);
            expect(result.data.summary).toEqual("sum");
            expect(result.data.layersOwner).toEqual("id-1");
            expect(result.data.title).toEqual("current title");
        });

        it("defaults absent tags to [] and absent summary/identifier to their empty values", () => {
            const result = dispatch(state, buildSaveReportFinished());

            expect(result.data.tags).toEqual([]);
            expect(result.data.summary).toEqual("");
            expect(result.data.layersOwner).toEqual(null);
        });

        it("save-as-new adopts the saved insight's layers and clears the undo/redo history", () => {
            const withHistory = dispatch(state, reportTitleChange("make it undoable"));
            expect(undoPossible(withHistory)).toBe(true);

            const result = dispatch(
                withHistory,
                buildSaveReportFinished({
                    saveAsNew: true,
                    content: { layers: [{ id: "layer-1", type: "insight", buckets: [] }] },
                }),
            );

            expect(result.data.layers).toEqual([{ id: "layer-1", type: "insight", buckets: [] }]);
            expect(undoPossible(result)).toBe(false);
            expect(selectTimeTravel(result).past).toHaveLength(0);
        });

        it("a plain save does not touch the layers", () => {
            const withLayers = withData(state, {
                layers: [{ id: "existing", type: "insight", buckets: [] }],
            });

            const result = dispatch(withLayers, buildSaveReportFinished());

            expect(result.data.layers).toEqual([{ id: "existing", type: "insight", buckets: [] }]);
        });
    });

    describe("DELETE_REPORT_STARTED", () => {
        const withSavedUri = (uri: string) =>
            withReport(state, {
                lastSavedObject: withMdObjectMeta(state.report.lastSavedObject, { uri: uri }),
            });

        // the per-snapshot lastSavedObject rewrite is GONE (8.1): the history does not capture the
        // report branch, so a snapshot cannot resurrect a deleted report in the first place
        it("leaves the undo history untouched", () => {
            const withHistory = dispatch(
                withSavedUri("/gdc/md/p/obj/1"),
                reportTitleChange("make it undoable"),
            );
            const historyBefore = selectTimeTravel(withHistory);

            const result = dispatch(withHistory, deleteReportStarted(uriRef("/gdc/md/p/obj/1")));

            expect(selectTimeTravel(result)).toBe(historyBefore);
            // `IUndoableState` omits `report` outright, so this is a type-level guarantee now; the
            // runtime check keeps the intent visible
            expect("report" in selectTimeTravel(result).past[0].state).toBe(false);
        });

        it("leaves the live report state alone", () => {
            const opened = withSavedUri("/gdc/md/p/obj/1");

            const result = dispatch(opened, deleteReportStarted(uriRef("/gdc/md/p/obj/1")));

            expect(result.report.lastSavedObject.visualizationObject.meta.uri).toEqual("/gdc/md/p/obj/1");
        });
    });

    describe("DELETE_REPORT_FINISHED", () => {
        it("deleting the currently open report resets the application", () => {
            const opened = dispatch(state, buildSaveReportFinished(), reportTitleChange("current"));
            const sessionBefore = opened.appState.sessionId;

            const result = dispatch(
                opened,
                deleteReportFinished(
                    123,
                    "/gdc/md/p/obj/42",
                    buildApplicationResetCarrier(getVisualizationClassesState(opened)),
                ),
            );

            expect(result.data.title).toEqual("");
            expect(result.report.nowOpen).toBe(false);
            expect(result.report.lastSavedObject).toEqual(state.report.lastSavedObject);
            expect(result.appState.sessionId).not.toEqual(sessionBefore);
        });

        it("deleting a different report leaves the report state untouched", () => {
            const opened = dispatch(state, buildSaveReportFinished(), reportTitleChange("current"));

            const result = dispatch(opened, deleteReportFinished(123, "/gdc/md/p/obj/other"));

            expect(result.report.lastSavedObject.visualizationObject.meta.uri).toEqual("/gdc/md/p/obj/42");
            expect(result.data.title).toEqual("current");
        });
    });

    describe("reset paths", () => {
        it("RESET_APPLICATION clears the insight meta, the last saved object and nowOpen", () => {
            const dirty = dispatch(
                state,
                buildSaveReportFinished({ meta: { tags: ["t1"], summary: "sum", identifier: "id-1" } }),
                reportTitleChange("current"),
            );

            const result = applyApplicationCleared(dirty);

            expect(result.data.title).toEqual("");
            expect(result.data.tags).toEqual([]);
            expect(result.data.summary).toEqual("");
            expect(result.data.layersOwner).toEqual(null);
            expect(result.data.layers).toEqual([]);
            expect(result.report.nowOpen).toBe(false);
            expect(result.report.opening).toBe(false);
            expect(result.report.lastSavedObject).toEqual(state.report.lastSavedObject);
        });

        it("RESET_FOR_PLUGGABLE_MOUNT restores the pristine report and insight leaves", () => {
            const dirty = dispatch(state, buildSaveReportFinished(), reportTitleChange("current"));

            const result = dispatch(dirty, resetForPluggableMount());

            // read through the domain accessors: the leaves are slice-owned, so they are absent
            // until the next dispatch (pristine_state_readers.test.ts covers the readers)
            const reduced = rootReducer(result, { type: "@@AFTER_RESET" });
            expect(reduced.report.saving).toBe(false);
            expect(reduced.report.nowOpen).toBe(false);
            expect(reduced.report.lastSavedObject.visualizationObject.content).toEqual(null);
            expect(reduced.data.title).toEqual("");
        });
    });

    describe("container kinds of the insight leaves", () => {
        /**
         * `data.tags` and `data.layers` must be plain arrays on EVERY path — the pristine seed, the
         * application resets and the open/save payloads alike. A reader that gets something else
         * fails silently rather than loudly: `[...value]` still iterates and `value.length` is
         * `undefined > 0 === false`.
         */
        it("the pristine tags and layers are plain arrays", () => {
            expect(state.data.tags).toEqual([]);
            expect(state.data.layers).toEqual([]);
        });

        it("an application reset clears tags and layers back to empty arrays", () => {
            const opened = applyApplicationCleared(
                dispatch(state, buildOpenFinishedAction(state, { tags: ["t1"] })),
            );

            expect(opened.data.tags).toEqual([]);
            expect(opened.data.layers).toEqual([]);
        });

        it("an opened report stores the payload tags and an empty layers array", () => {
            const result = dispatch(state, buildOpenFinishedAction(state, { tags: ["t1"] }));

            expect(result.data.tags).toEqual(["t1"]);
            expect(result.data.layers).toEqual([]);
        });
    });
});
