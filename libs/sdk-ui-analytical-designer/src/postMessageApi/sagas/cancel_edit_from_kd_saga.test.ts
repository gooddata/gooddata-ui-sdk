// (C) 2020-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { put, select } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import { cancelEditFromKDAction } from "../../actions/cancel_edit_from_kd_actions.js";
import { displayConfirmUnsavedChangesDialogWithPostMessageAction } from "../../actions/confirm_unsaved_changes_actions.js";
import { isReportChanging } from "../../selectors/confirm_unsaved_changes_dialog_selector.js";
import { isExploreFromKD } from "../../selectors/route_selector.js";
import { hasMetricEditorUnsavedChanges } from "../../store/metric_editor/metric_editor_selector.js";

import { watchCancelEditFromKD } from "./cancel_edit_from_kd_saga.js";

describe("cancel edit insight from KD", () => {
    it.each([
        [true, true],
        [false, true],
        [false, false],
    ])(
        "should post a message visualizationCancelled when report change state is '%s' and AD explored from KD state is '%s'",
        async (reportChanged: boolean, adExploredFromKd: boolean) => {
            const host = { postMessage: vi.fn() };
            messagingUtils.setHost(host);
            const postEvent = {
                gdc: {
                    product: "analyticalDesigner",
                    event: {
                        name: "insightEditingCancelled",
                        data: null as unknown,
                    },
                },
            };

            await expectSaga(watchCancelEditFromKD)
                .provide([
                    [select(isReportChanging), reportChanged],
                    [select(isExploreFromKD), adExploredFromKd],
                    [select(hasMetricEditorUnsavedChanges), false],
                ])
                .dispatch(cancelEditFromKDAction())
                .silentRun();

            expect(host.postMessage).toHaveBeenCalledWith(postEvent, "*");

            host.postMessage.mockReset();
        },
    );

    it("should call an action displaying cancel confirmation dialog if report is changed and AD is not explored from KD", async () => {
        const saga: RunResult = await expectSaga(watchCancelEditFromKD)
            .provide([
                [select(isReportChanging), true],
                [select(isExploreFromKD), false],
                [select(hasMetricEditorUnsavedChanges), false],
            ])
            .dispatch(cancelEditFromKDAction())
            .silentRun();

        expect(saga.effects.put).toEqual([put(displayConfirmUnsavedChangesDialogWithPostMessageAction())]);
    });

    it.each([
        [false, false],
        [false, true],
        [true, true],
    ])(
        "should ask for confirmation instead of posting the cancellation when the metric editor has unsaved changes (report changed '%s', explored from KD '%s')",
        async (reportChanged: boolean, adExploredFromKd: boolean) => {
            const host = { postMessage: vi.fn() };
            messagingUtils.setHost(host);

            const saga: RunResult = await expectSaga(watchCancelEditFromKD)
                .provide([
                    [select(isReportChanging), reportChanged],
                    [select(isExploreFromKD), adExploredFromKd],
                    [select(hasMetricEditorUnsavedChanges), true],
                ])
                .dispatch(cancelEditFromKDAction())
                .silentRun();

            expect(saga.effects.put).toEqual([
                put(displayConfirmUnsavedChangesDialogWithPostMessageAction()),
            ]);
            expect(host.postMessage).not.toHaveBeenCalled();
        },
    );
});
