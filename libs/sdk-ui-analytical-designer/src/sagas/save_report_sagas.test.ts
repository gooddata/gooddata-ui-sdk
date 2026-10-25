// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, delay, put, select, take } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";

import { resetInsightUsageOnDashboards } from "../actions/data_actions.js";
import { hideDialog } from "../actions/dialogs_actions.js";
import {
    hideSuccessMessage,
    saveReportCheck as saveReportCheckAction,
    saveReportError,
    saveReportFinished,
    saveReportRequested as saveReportRequestedAction,
    saveReportStarted,
} from "../actions/save_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { saveInsightFailed, saveInsightFinished } from "../postMessageApi/actions/save_insight_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { enableVisualizationPermissions } from "../selectors/feature_flag_selector.js";
import { getInsightForCreateViaMd, getInsightForSaveViaMd } from "../selectors/insight_selectors.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { getLastSavedReportPermissions, isReportSavedSelector } from "../selectors/report_selector.js";
import { getDatasetIdentifier } from "../selectors/route_selector.js";
import { hasTitleChanged } from "../selectors/save_report_selector.js";
import { isReportTitleEmpty } from "../services/report_service.js";
import {
    logInsightCreated,
    logInsightCreatedFailed,
    logInsightSavedOrEdited,
    logVisualizationSaveFailed,
    logVisualizationSaved,
} from "../services/telemetry/tracking_events.js";
import { getInsightAccessDraft } from "../store/insight_access/insight_access_selectors.js";
import { locationRedirectLock } from "../store/router/router_actions.js";
import { newInsight } from "../tests/insightMocking.test.helpers.js";
import { type IVisualization } from "../typings/bear/bearTypes.js";
import { getRouteUri, setLocation } from "../utils/location.js";
import { convertModelInsightToADRep } from "../utils/sdkModelToADRep/InsightConverter.js";
import { getDuration, getTime } from "../utils/timers.js";

import { updateDateDataSets } from "./date_datasets/date_datasets_sagas.js";
import { applyDraftedInsightAccess } from "./insight_access_sagas.js";
import { getInsight } from "./open_report_sagas.js";
import {
    HIDE_SUCCESS_MESSAGE_AFTER,
    SHOW_LONG_SAVING_MESSAGE_AFTER,
    getReportObjectForSaveEmbeddingMessage,
    isSavingDoneAction,
    performSaveExisting,
    performSaveNew,
    saveReport,
    saveReportCheck,
    saveReportRequested,
    savedInsightPermissions,
} from "./save_report_sagas.js";

vi.hoisted(() => {
    vi.resetModules();
});

describe("saveReport", () => {
    const timeoutId = 101;
    const savedAsNew = false;

    const contextId = "contextId";
    const action = saveReportStarted(savedAsNew, timeoutId, false, contextId);

    const projectId = "my-project-123";
    const reportId = "54321";
    const state = initialState;
    const insightToCreate = newInsight("local:foo", reportId, "/gdc/md/projectid/obj/54321", (i) =>
        i.title("report"),
    );

    const activeDateDatasetId = "activeDateDatasetId";
    const isReportSaved = false;
    const savedMDObject = {
        visualizationObject: convertModelInsightToADRep(insightToCreate),
    };
    const embeddingSavedMDObject = {
        visualizationObject: {},
    } as IVisualization; // the contents are irrelevant — it only has to differ from savedMDObject
    const startTime = 123;
    const duration = 20;
    const uri = `/analyze/#/${projectId}/${reportId}/edit`;

    it("should save the report", async () => {
        const isEmbedded = false;
        const isUpdate = false;
        const saga: RunResult = await expectSaga(saveReport, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [select(enableVisualizationPermissions), false],
                [select(getInsightForCreateViaMd), insightToCreate],
                [call(performSaveNew, projectId, insightToCreate), insightToCreate],
                [call(applyDraftedInsightAccess, projectId, reportId), undefined],
                [select(isReportSavedSelector), isReportSaved],
                [call(getTime), startTime],
                [call(getIsEmbedded, state), isEmbedded],
                [select(getDatasetIdentifier), activeDateDatasetId],
                [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                [call(getDuration, startTime), duration],
                [select(getRouteUri, { reportId }), uri],
                // stubbed out: the real saga navigates the test window, and the mutated location
                // then leaks into every test file that runs later (the suite is non-isolated)
                [call(setLocation, uri), undefined],
                [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
            ])
            .run();

        expect(saga.effects.put).toEqual([
            put(locationRedirectLock(true)),
            put(saveReportFinished(savedMDObject, savedAsNew, duration, false)),
            put(hideSuccessMessage()),
        ]);
        expect(saga.effects.call).toEqual([
            call(getTime),
            call(getIsEmbedded, state),
            call(performSaveNew, projectId, insightToCreate),
            call(applyDraftedInsightAccess, projectId, reportId),
            call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate),
            call(getDuration, startTime),
            call(setLocation, uri),
            call(logInsightCreated, { state }),
            call(logVisualizationSaved, {
                saveAsNew: false,
                isUpdate,
                state,
                time: duration,
                editingFromKD: false,
                insight: insightToCreate,
            }),
            call(logInsightSavedOrEdited, {
                isUpdate,
                state,
            }),

            delay(HIDE_SUCCESS_MESSAGE_AFTER),
        ]);
    });

    it("should save the report and fire post message if embedded", async () => {
        const isEmbedded = true;
        const {
            payload: { saveAsNew },
        } = action;
        const reportMDObject = {
            visualizationObject: convertModelInsightToADRep(insightToCreate),
        };
        const saga: RunResult = await expectSaga(saveReport, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [select(enableVisualizationPermissions), false],
                [select(getInsightAccessDraft), undefined],
                [select(getInsightForCreateViaMd), insightToCreate],
                [select(isReportSavedSelector), isReportSaved],
                [call(performSaveNew, projectId, insightToCreate), insightToCreate],
                [call(getTime), startTime],
                [call(getIsEmbedded, state), isEmbedded],
                [select(getDatasetIdentifier), activeDateDatasetId],
                [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                [call(getDuration, startTime), duration],
                [
                    call(getReportObjectForSaveEmbeddingMessage, projectId, insightToCreate),
                    embeddingSavedMDObject,
                ],
                [select(getRouteUri, { reportId }), uri],
                // stubbed out: the real saga navigates the test window, and the mutated location
                // then leaks into every test file that runs later (the suite is non-isolated)
                [call(setLocation, uri), undefined],
                [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
            ])
            .run();

        expect(saga.effects.put).toEqual([
            put(locationRedirectLock(true)),
            put(saveReportFinished(reportMDObject, saveAsNew, duration, false)),
            put(saveInsightFinished(embeddingSavedMDObject, saveAsNew, duration, contextId)),
            put(hideSuccessMessage()),
        ]);
        expect(saga.effects.call).toEqual(expect.arrayContaining([call(setLocation, uri)]));
    });

    it("should handle error in case saving fails", async () => {
        const isEmbedded = true;
        const isUpdate = false;
        const {
            payload: { saveAsNew },
        } = action;
        const error = new UnexpectedError("unknown");

        const saga: RunResult = await expectSaga(saveReport, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [select(enableVisualizationPermissions), false],
                [select(getInsightForCreateViaMd), insightToCreate],
                [call(performSaveNew, projectId, insightToCreate), throwError(error)],
                [select(isReportSavedSelector), isReportSaved],
                [call(getTime), startTime],
                [call(getIsEmbedded, state), isEmbedded],
                [call(getDuration, startTime), duration],
                [
                    call(logVisualizationSaveFailed, {
                        saveAsNew,
                        isUpdate,
                        state,
                        time: duration,
                        editingFromKD: false,
                    }),
                    undefined,
                ],
                [
                    call(logInsightCreatedFailed, {
                        state,
                    }),
                    undefined,
                ],
            ])
            .run();

        expect(saga.effects.put).toEqual([
            put(saveReportError(action.payload.saveAsNew, duration, false, error)),
            put(saveInsightFailed(saveAsNew, duration, contextId)),
        ]);
        expect(saga.effects.call).toEqual([
            call(getTime),
            call(getIsEmbedded, state),
            call(performSaveNew, projectId, insightToCreate),
            call(getDuration, startTime),
            call(logInsightCreatedFailed, { state }),
            call(logVisualizationSaveFailed, {
                saveAsNew: action.payload.saveAsNew,
                isUpdate,
                state,
                time: duration,
                editingFromKD: false,
            }),
        ]);
    });

    it("should save the report and hide the save report from KD dialog after finished if embedded", async () => {
        const isEmbedded = true;
        const action = saveReportStarted(savedAsNew, timeoutId, true, contextId);
        const {
            payload: { saveAsNew },
        } = action;

        const saga = await expectSaga(saveReport, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [select(enableVisualizationPermissions), false],
                [select(getInsightAccessDraft), undefined],
                [select(getInsightForCreateViaMd), insightToCreate],
                [select(isReportSavedSelector), isReportSaved],
                [call(performSaveNew, projectId, insightToCreate), insightToCreate],
                [call(getTime), startTime],
                [call(getIsEmbedded, state), isEmbedded],
                [select(getDatasetIdentifier), activeDateDatasetId],
                [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                [call(getDuration, startTime), duration],
                [
                    call(getReportObjectForSaveEmbeddingMessage, projectId, insightToCreate),
                    embeddingSavedMDObject,
                ],
                [select(getRouteUri, { reportId }), uri],
                // stubbed out: the real saga navigates the test window, and the mutated location
                // then leaks into every test file that runs later (the suite is non-isolated)
                [call(setLocation, uri), undefined],
                [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
            ])
            .silentRun();
        expect(saga.effects.put).toEqual([
            put(locationRedirectLock(true)),
            put(saveReportFinished(savedMDObject, saveAsNew, duration, true)),
            put(hideDialog()),
            put(saveInsightFinished(embeddingSavedMDObject, saveAsNew, duration, contextId)),
            put(hideSuccessMessage()),
        ]);

        expect(saga.effects.call).toEqual(expect.arrayContaining([call(setLocation, uri)]));
    });

    it("should save the report correctly after finished", async () => {
        const isEmbedded = false;
        const action = saveReportStarted(savedAsNew, timeoutId, true, contextId);
        const {
            payload: { saveAsNew },
        } = action;

        const saga = await expectSaga(saveReport, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [select(enableVisualizationPermissions), false],
                [select(getInsightAccessDraft), undefined],
                [select(getInsightForCreateViaMd), insightToCreate],
                [select(isReportSavedSelector), isReportSaved],
                [call(performSaveNew, projectId, insightToCreate), insightToCreate],
                [call(getTime), startTime],
                [call(getIsEmbedded, state), isEmbedded],
                [select(getDatasetIdentifier), activeDateDatasetId],
                [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                [call(getDuration, startTime), duration],
                [select(getRouteUri, { reportId }), uri],
                // stubbed out: the real saga navigates the test window, and the mutated location
                // then leaks into every test file that runs later (the suite is non-isolated)
                [call(setLocation, uri), undefined],
                [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
            ])
            .silentRun();
        expect(saga.effects.put).toEqual([
            put(locationRedirectLock(true)),
            put(saveReportFinished(savedMDObject, saveAsNew, duration, true)),
            put(hideSuccessMessage()),
        ]);

        expect(saga.effects.call).toEqual(expect.arrayContaining([call(setLocation, uri)]));
    });

    describe("history changes when saving", () => {
        it("should not push history change when we save existing report (=update)", async () => {
            const reportSaved = true;
            const isEmbedded = false;
            const saga: RunResult = await expectSaga(saveReport, action)
                .provide([
                    [select(), state],
                    [select(getProjectId), projectId],
                    [select(enableVisualizationPermissions), false],
                    [select(enableVisualizationPermissions), false],
                    [select(getInsightForSaveViaMd), insightToCreate],
                    [call(performSaveExisting, projectId, insightToCreate), insightToCreate],
                    [select(isReportSavedSelector), reportSaved],
                    [call(getTime), startTime],
                    [call(getIsEmbedded, state), isEmbedded],
                    [select(getDatasetIdentifier), activeDateDatasetId],
                    [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                    [call(getDuration, startTime), duration],
                    [select(getRouteUri, { reportId }), uri],
                    // stubbed out: the real saga navigates the test window, and the mutated location
                    // then leaks into every test file that runs later (the suite is non-isolated)
                    [call(setLocation, uri), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(saveReportFinished(savedMDObject, savedAsNew, duration, false)),
                put(hideSuccessMessage()),
            ]);
        });

        it("keeps the caller's permissions on the saved object across an update", async () => {
            const permissions = ["EDIT", "VIEW"] as const;
            const saga: RunResult = await expectSaga(saveReport, action)
                .provide([
                    [select(), state],
                    [select(getProjectId), projectId],
                    [select(enableVisualizationPermissions), true],
                    [select(getLastSavedReportPermissions), permissions],
                    [select(getInsightForSaveViaMd), insightToCreate],
                    [call(performSaveExisting, projectId, insightToCreate), insightToCreate],
                    [select(isReportSavedSelector), true],
                    [call(getTime), startTime],
                    [call(getIsEmbedded, state), false],
                    [select(getDatasetIdentifier), activeDateDatasetId],
                    [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                    [call(getDuration, startTime), duration],
                    [select(getRouteUri, { reportId }), uri],
                    [call(setLocation, uri), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .run();

            const finished = saga.effects.put[0];
            expect(finished).toEqual(
                put(
                    saveReportFinished(
                        {
                            visualizationObject: convertModelInsightToADRep(
                                { insight: { ...insightToCreate.insight, permissions: [...permissions] } },
                                true,
                            ),
                        },
                        savedAsNew,
                        duration,
                        false,
                    ),
                ),
            );
        });

        it("should push history change when we save as new", async () => {
            const reportSaved = true;
            const isEmbedded = false;
            const saveAsNewAction = saveReportStarted(true, timeoutId, false, contextId);
            const saga: RunResult = await expectSaga(saveReport, saveAsNewAction)
                .provide([
                    [select(), state],
                    [select(getProjectId), projectId],
                    [select(enableVisualizationPermissions), false],
                    [select(getInsightAccessDraft), undefined],
                    [select(enableVisualizationPermissions), false],
                    [select(getInsightAccessDraft), undefined],
                    [select(getInsightForCreateViaMd), insightToCreate],
                    [call(performSaveNew, projectId, insightToCreate), insightToCreate],
                    [select(isReportSavedSelector), reportSaved],
                    [call(getTime), startTime],
                    [call(getIsEmbedded, state), isEmbedded],
                    [select(getDatasetIdentifier), activeDateDatasetId],
                    [call(updateDateDataSets, projectId, activeDateDatasetId, insightToCreate), undefined],
                    [call(getDuration, startTime), duration],
                    [select(getRouteUri, { reportId }), uri],
                    // stubbed out: the real saga navigates the test window, and the mutated location
                    // then leaks into every test file that runs later (the suite is non-isolated)
                    [call(setLocation, uri), undefined],
                    [delay(HIDE_SUCCESS_MESSAGE_AFTER), undefined],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(locationRedirectLock(true)),
                put(saveReportFinished(savedMDObject, true, duration, false)),
                put(hideSuccessMessage()),
            ]);

            expect(saga.effects.call).toEqual(expect.arrayContaining([call(setLocation, uri)]));
        });
    });
});

describe("savedInsightPermissions", () => {
    const projectId = "my-project-123";
    const reportId = "54321";
    const permissions = ["EDIT", "VIEW"] as const;
    const saved = newInsight("local:foo", reportId, "/gdc/md/projectid/obj/54321", (i) => i.title("report"));
    const withPermissions = { insight: { ...saved.insight, permissions: [...permissions] } };

    it("keeps the last saved permissions when updating: saving changes no grants", async () => {
        const saga: RunResult = await expectSaga(savedInsightPermissions, projectId, reportId, true)
            .provide([
                [select(enableVisualizationPermissions), true],
                [select(getLastSavedReportPermissions), permissions],
            ])
            .run();

        expect(saga.returnValue).toEqual(permissions);
    });

    it("asks a newly created visualization for its own permissions", async () => {
        const saga: RunResult = await expectSaga(savedInsightPermissions, projectId, reportId, false)
            .provide([
                [select(enableVisualizationPermissions), true],
                [call(getInsight, projectId, reportId), { insight: withPermissions }],
            ])
            .run();

        expect(saga.returnValue).toEqual(permissions);
    });

    it("leaves the permissions unknown when they cannot be read", async () => {
        const saga: RunResult = await expectSaga(savedInsightPermissions, projectId, reportId, false)
            .provide([
                [select(enableVisualizationPermissions), true],
                [call(getInsight, projectId, reportId), throwError(new Error("403"))],
            ])
            .run();

        expect(saga.returnValue).toBeUndefined();
    });

    it("does nothing while the flag is off", async () => {
        const saga: RunResult = await expectSaga(savedInsightPermissions, projectId, reportId, false)
            .provide([[select(enableVisualizationPermissions), false]])
            .run();

        expect(saga.returnValue).toBeUndefined();
        expect(saga.effects.call).toBeUndefined();
    });
});

describe("saveReportRequested", () => {
    it("should show `too long message` if saving takes longer than 1s", async () => {
        const action = saveReportRequestedAction(true);
        const saga: RunResult = await expectSaga(saveReportRequested, action)
            .provide([[delay(SHOW_LONG_SAVING_MESSAGE_AFTER), true]])
            .run();

        expect(saga.effects.put).toEqual([
            put(saveReportStarted(true)),
            put(resetInsightUsageOnDashboards()),
            put({ type: ActionTypeKeys.MESSAGES_DELAYED_LONG_SAVING }),
        ]);
    });

    it("should not do anything if report saving finished before", async () => {
        const action = saveReportRequestedAction(true);
        const saga: RunResult = await expectSaga(saveReportRequested, action)
            .provide([[take(isSavingDoneAction), true]])
            .run();

        expect(saga.effects.put).toEqual([
            put(saveReportStarted(true)),
            put(resetInsightUsageOnDashboards()),
        ]);
    });

    it("should passed the edit report from KD flag to the saveReportStarted function", async () => {
        const saveAsNew = true;
        const editingFromKD = true;

        const action = saveReportRequestedAction(saveAsNew, editingFromKD, "contextId");

        const saga = await expectSaga(saveReportRequested, action).run();

        expect(saga.effects.put).toEqual([
            put(saveReportStarted(saveAsNew, undefined, editingFromKD, "contextId")),
            put(resetInsightUsageOnDashboards()),
        ]);
    });
});

describe("saveReportCheck", () => {
    it("should display the new report title dialog when the report title is empty", () => {
        const savedAsNew = false;
        const editingFromKD = false;
        const reOpenEmbedDialog = false;
        const action = saveReportCheckAction(savedAsNew, editingFromKD);
        const {
            payload: { saveAsNew },
        } = action;

        return expectSaga(saveReportCheck, action)
            .provide([
                [select(isReportTitleEmpty), true],
                [select(hasTitleChanged), false],
            ])
            .put({
                type: ActionTypeKeys.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION,
                payload: { saveAsNew, reOpenEmbedDialog },
            })
            .run();
    });

    it("should display the new report title dialog when saving as new and the title doesn't change", () => {
        const savedAsNew = true;
        const editingFromKD = false;
        const reOpenEmbedDialog = false;
        const action = saveReportCheckAction(savedAsNew, editingFromKD, reOpenEmbedDialog);
        const {
            payload: { saveAsNew },
        } = action;

        return expectSaga(saveReportCheck, action)
            .provide([
                [select(isReportTitleEmpty), false],
                [select(hasTitleChanged), false],
            ])
            .put({
                type: ActionTypeKeys.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION,
                payload: { saveAsNew, reOpenEmbedDialog },
            })
            .run();
    });
});
