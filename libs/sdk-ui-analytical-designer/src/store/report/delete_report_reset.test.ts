// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { deleteReportFinished, deleteReportStarted } from "../../actions/delete_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { withMdObjectMeta } from "../../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData, withReport } from "../../tests/state_builder.test.helpers.js";
import { type IReport } from "../../typings/report.js";
import { buildApplicationResetCarrier } from "../app_context/application_reset_events.js";
import { insightTitleInitialState } from "../insight/insight_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import { getVisualizationClassesState } from "../visualization_classes/visualization_classes_selectors.js";

/**
 * THE DELETE-REPORT RESET. The delete saga decides "the deleted report is the open one" BEFORE it
 * dispatches — the fact is unreadable afterwards — and attaches the reset carrier to
 * DELETE_REPORT_FINISHED; the carrier's PRESENCE is the condition the reset matchers key on. The
 * saga side is pinned in sagas/test/delete_report_sagas.test.ts.
 */
describe("the delete-report reset", () => {
    describe(`#${ActionTypeKeys.DELETE_REPORT_STARTED}`, () => {
        /**
         * The undo history does not capture the `report` branch, so `lastSavedObject` is always the
         * live one after an undo and a deleted report cannot be resurrected from a snapshot. What is
         * pinned here is that the action leaves the report domain alone.
         */
        it("should not touch the last saved object — the history holds no report to rewrite", () => {
            const uriToBeRemoved = "uriToBeRemoved";
            const lastSaved = { visualizationObject: { content: {}, meta: { uri: uriToBeRemoved } } };
            const state = withReport(initialState, { lastSavedObject: lastSaved as unknown as IReport });

            const result = rootReducer(state, deleteReportStarted(uriRef(uriToBeRemoved)));

            expect(result.report.lastSavedObject).toBe(lastSaved);
        });
    });

    describe(`#${ActionTypeKeys.DELETE_REPORT_FINISHED}`, () => {
        const uriToBeRemoved = "/gdc/md/FoodMartDemo/obj/1";

        it("should reset application when the finished delete carries the reset (deleting the open report)", () => {
            const init = withData(
                withData(
                    withData(
                        withReport(getInitializedState(), {
                            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                                uri: uriToBeRemoved,
                            }),
                        }),
                        { extendedReferencePoint: {} },
                    ),
                    { referencePoint: {} as unknown as IReferencePointState },
                ),
                { title: "title" },
            );

            const reset = buildApplicationResetCarrier(getVisualizationClassesState(init));
            const result = rootReducer(init, deleteReportFinished(0, uriToBeRemoved, reset));

            expect(result.data.extendedReferencePoint).toEqual(initialState.data.extendedReferencePoint);
            expect(result.data.referencePoint).toEqual(initialState.data.referencePoint);
            // the reset writes the insight
            // domain's own initial value instead
            expect(result.data.title).toEqual(insightTitleInitialState);
        });

        it("should not reset when the finished delete carries no reset (a different report was deleted)", () => {
            const lastSaved = { visualizationObject: { content: {}, meta: { uri: "/gdc/md/other" } } };
            const init = withData(
                withReport(getInitializedState(), { lastSavedObject: lastSaved as unknown as IReport }),
                {
                    title: "title",
                },
            );

            const result = rootReducer(init, deleteReportFinished(0, uriToBeRemoved));

            // the reset-scope values survive by IDENTITY (the messages slice may add its toast,
            // so the pin is per-domain rather than whole-state)
            expect(result.report.lastSavedObject).toBe(lastSaved);
            expect(result.data.title).toBe("title");
            expect(result.data.referencePoint).toBe(init.data.referencePoint);
        });
    });
});
