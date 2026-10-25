// (C) 2007-2026 GoodData Corporation

import { testSaga } from "redux-saga-test-plan";
import { describe, it } from "vitest";

import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { initialState } from "../reducers/initial_state.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getDatasetIdentifier } from "../selectors/route_selector.js";
import { logADClear, logADClearInsight } from "../services/telemetry/tracking_events.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
    buildInsightContentResetCarrier,
    insightContentCleared,
} from "../store/app_context/application_reset_events.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";
import { getRouteUri } from "../utils/location.js";

import { updateDateDataSets } from "./date_datasets/date_datasets_sagas.js";
import {
    hasDefaultReportId,
    logReset,
    onClearInsight,
    onResetApplication,
    resetDateDatasets,
    resetReportIdInUri,
} from "./reset_sagas.js";

describe("Reset sagas", () => {
    const testCarrier: IApplicationResetCarrier = { sessionId: "fresh", defaultVisualizationClass: null };

    describe("onReset", () => {
        it("should translate the trigger into the applicationCleared event FIRST, then run the side effects", () => {
            // ORDER IS THE PIN: the trigger writes nothing, and the selects the side
            // effects make must read the post-reset state — which they do exactly because the
            // event is put before them (reset_sagas.ts)
            testSaga(onResetApplication)
                .next()
                .select(getVisualizationClassesState)
                .next([])
                .call(buildApplicationResetCarrier, [])
                .next(testCarrier)
                .put(applicationCleared({ reset: testCarrier }))
                .next()
                .select()
                .next(initialState)
                .call(logReset, initialState)
                .next()
                .call(resetReportIdInUri, initialState)
                .next()
                .call(resetDateDatasets)
                .next()
                .call(logADClearInsight, { state: initialState })
                .next()
                .isDone();
        });
    });

    describe("onClearInsight", () => {
        it("should translate the trigger into the insightContentCleared event FIRST", () => {
            testSaga(onClearInsight)
                .next()
                .call(buildInsightContentResetCarrier)
                .next({ sessionId: "fresh" })
                .put(insightContentCleared({ reset: { sessionId: "fresh" } }))
                .next()
                .select()
                .next(initialState)
                .call(logADClearInsight, { state: initialState })
                .next()
                .call(resetDateDatasets)
                .next()
                .isDone();
        });
    });

    describe("resetDateDatasets", () => {
        it("should refresh DateDataSets", () => {
            const saga = testSaga(resetDateDatasets);

            saga.next()

                .select(getProjectId)
                .next("projectId")

                .select(getDatasetIdentifier)
                .next("active.dataset.id")

                .call(updateDateDataSets, "projectId", "active.dataset.id")
                .next()

                .isDone();
        });
    });

    describe("logReset", () => {
        it("should log application was reset", () => {
            const saga = testSaga(logReset, initialState);

            saga.next()

                .call(logADClear, { state: initialState })
                .next()

                .isDone();
        });
    });

    describe("resetReportIdInUri", () => {
        it("should not do anything if report id is default", () => {
            const saga = testSaga(resetReportIdInUri, initialState);

            saga.next()

                .call(hasDefaultReportId, initialState)
                .next(true)

                .isDone();
        });

        it("should redirect to blank report if report was opened", () => {
            const saga = testSaga(resetReportIdInUri, initialState);

            const projectId = "12345";
            const uri = `/analyze/#/${projectId}/reportId/edit`;

            saga.next()

                .call(hasDefaultReportId, initialState)
                .next(false)

                .select(getRouteUri, { reportId: DEFAULT_REPORT_ID })
                .next(uri)

                .next()

                .isDone();
        });
    });
});
