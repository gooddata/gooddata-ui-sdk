// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, delay, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";

import {
    DeleteReportFailureReason,
    deleteReport as deleteReportAction,
    deleteReportConfirmation,
    deleteReportFailed,
    deleteReportFinished,
    deleteReportStarted,
    hideSuccessMessage,
} from "../actions/delete_actions.js";
import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { buildInitialState } from "../reducers/initial_state.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import {
    logVisualizationDeleteFailed,
    logVisualizationDeleted,
} from "../services/telemetry/tracking_events.js";
import { buildApplicationResetCarrier } from "../store/app_context/application_reset_events.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";
import { getRouteUri, setLocation } from "../utils/location.js";

import {
    HIDE_DELETE_MESSAGE_AFTER,
    deleteReport,
    getCurrentlyOpenedReportUri,
    getDuration,
    getStartTime,
    performDelete,
} from "./delete_report_sagas.js";

describe("Delete report sagas", () => {
    const projectId = "fooProjectId";
    const REPORT_URI = "/report/uri";
    const dummyReportUriRef = uriRef(REPORT_URI);
    const dummyReportMeta = { title: "My test report" };
    const state: IAppState = buildInitialState();
    const testCarrier: IApplicationResetCarrier = { sessionId: "fresh", defaultVisualizationClass: null };

    describe("deleteReport", () => {
        it("should ask for a confirmation by default", () => {
            const action = deleteReportAction(dummyReportUriRef, false, dummyReportMeta);

            return expectSaga(deleteReport, action)
                .put(deleteReportConfirmation(dummyReportUriRef, dummyReportMeta))
                .dispatch(action)
                .silentRun(0);
        });

        it("should delete given report", () => {
            const action = deleteReportAction(dummyReportUriRef, true);

            const startTime = 10;
            const duration = 25;
            const uri = "/analyze/#/xyz123123/reportId";

            return (
                expectSaga(deleteReport, action)
                    .provide([
                        [select(getProjectId), projectId],
                        [select(getCurrentlyOpenedReportUri), REPORT_URI],
                        [call(getStartTime), startTime],
                        [call(performDelete, projectId, dummyReportUriRef), undefined],
                        [select(getRouteUri, { reportId: DEFAULT_REPORT_ID }), uri],
                        [call(getDuration, startTime), duration],
                        [select(getVisualizationClassesState), []],
                        [call(buildApplicationResetCarrier, []), testCarrier],
                        [delay(HIDE_DELETE_MESSAGE_AFTER), undefined],
                        [select(), state],
                        [call(logVisualizationDeleted, { state, time: duration }), undefined],
                    ])
                    .put(deleteReportStarted(dummyReportUriRef))
                    // deleting the OPEN report carries the application-reset values
                    .put(deleteReportFinished(duration, REPORT_URI, testCarrier))
                    .put(hideSuccessMessage())
                    .call(setLocation, uri)
                    .silentRun(0)
            );
        });

        it("should display generic error when delete given report failed", () => {
            const action = deleteReportAction(dummyReportUriRef, true);

            const startTime = 10;
            const duration = 25;
            const error = new Error("some generic failure");

            return expectSaga(deleteReport, action)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getCurrentlyOpenedReportUri), REPORT_URI],
                    [call(getStartTime), startTime],
                    [call(performDelete, projectId, dummyReportUriRef), throwError(error)],
                    [call(getDuration, startTime), duration],
                    [select(), state],
                    [call(logVisualizationDeleteFailed, { state, time: duration }), undefined],
                ])
                .put(deleteReportStarted(dummyReportUriRef))
                .put(deleteReportFailed(duration, DeleteReportFailureReason.UNKNOWN, error))
                .silentRun(0);
        });

        it("should display error about deleted referenced object when delete referenced given report failed", () => {
            const action = deleteReportAction(dummyReportUriRef, true);

            const startTime = 10;
            const duration = 25;
            const error = new UnexpectedResponseError("Insight not found", 404, {});

            return expectSaga(deleteReport, action)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getCurrentlyOpenedReportUri), REPORT_URI],
                    [call(getStartTime), startTime],
                    [call(performDelete, projectId, dummyReportUriRef), throwError(error)],
                    [call(getDuration, startTime), duration],
                    [select(), state],
                    [call(logVisualizationDeleteFailed, { state, time: duration }), undefined],
                ])
                .put(deleteReportStarted(dummyReportUriRef))
                .put(
                    deleteReportFailed(
                        duration,
                        DeleteReportFailureReason.FAILED_TO_DELETE_REFERENCED_REPORT,
                        error,
                    ),
                )
                .silentRun(0);
        });
    });
});
