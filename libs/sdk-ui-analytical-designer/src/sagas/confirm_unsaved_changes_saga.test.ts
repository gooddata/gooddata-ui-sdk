// (C) 2020-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { GdcAdEventType } from "@gooddata/sdk-embedding";

import { resetApplication } from "../actions/app_context_actions.js";
import {
    type ILeaveAnywayButtonClickedAction,
    type IShowConfirmUnsavedChangesDialogAction,
    showConfirmUnsageChangesDialogAction,
} from "../actions/confirm_unsaved_changes_actions.js";
import { deleteDataSamplingPercentage } from "../actions/data_sample_actions.js";
import { hideDialog } from "../actions/dialogs_actions.js";
import { runPendingHostNavigation } from "../appMode/pendingHostNavigation.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { HOST_NAVIGATION } from "../constants/platform.js";
import { adPostEvent } from "../postMessageApi/outgoing/post_event_helper.js";
import { metricEditorShowUnsavedChangesDialog } from "../store/metric_editor/metric_editor_actions.js";
import { hasMetricEditorUnsavedChanges } from "../store/metric_editor/metric_editor_selector.js";

import {
    showConfirmUnsavedChangesDialog,
    unsaveChangeDialogLeaveAnywayButtonClicked,
} from "./confirm_unsaved_changes_sagas.js";

describe("confirm unsaved changes saga", () => {
    it("should dispatch showConfirmUnsageChangesDialogAction action", async () => {
        const action: IShowConfirmUnsavedChangesDialogAction = {
            type: ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG,
            payload: {
                active: true,
                data: {
                    goToPage: "/dashboards",
                },
            },
        };
        const saga: RunResult = await expectSaga(showConfirmUnsavedChangesDialog, action)
            .provide([[select(hasMetricEditorUnsavedChanges), false]])
            .silentRun();

        expect(saga.effects.put).toEqual([put(showConfirmUnsageChangesDialogAction(action.payload))]);
    });

    it("should dispatch metricEditorShowUnsavedChangesDialog action", async () => {
        const action: IShowConfirmUnsavedChangesDialogAction = {
            type: ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG,
            payload: {
                active: true,
                data: {
                    goToPage: "/dashboards",
                },
            },
        };
        const saga: RunResult = await expectSaga(showConfirmUnsavedChangesDialog, action)
            .provide([[select(hasMetricEditorUnsavedChanges), true]])
            .silentRun();

        expect(saga.effects.put).toEqual([put(metricEditorShowUnsavedChangesDialog(action.payload.data))]);
    });

    it("should resume the navigation the host handed over, leaving teardown to the host", async () => {
        const action: ILeaveAnywayButtonClickedAction = {
            type: ActionTypeKeys.UI_UNSAVE_CHANGES_DIALOG_LEAVE_ANYWAY_BUTTON_CLICKED,
            payload: {
                goToPage: HOST_NAVIGATION,
            },
        };
        const saga: RunResult = await expectSaga(
            unsaveChangeDialogLeaveAnywayButtonClicked,
            action,
        ).silentRun();

        expect(saga.effects.put).toEqual([put(hideDialog())]);
        expect(saga.effects.call).toEqual([call(runPendingHostNavigation)]);
    });

    it("should fire cancel post message", async () => {
        const action: ILeaveAnywayButtonClickedAction = {
            type: ActionTypeKeys.UI_UNSAVE_CHANGES_DIALOG_LEAVE_ANYWAY_BUTTON_CLICKED,
            payload: {
                firePostMessage: true,
            },
        };
        const saga: RunResult = await expectSaga(
            unsaveChangeDialogLeaveAnywayButtonClicked,
            action,
        ).silentRun();

        expect(saga.effects.call).toEqual([call(adPostEvent, GdcAdEventType.InsightEditingCancelled, null)]);
        expect(saga.effects.put).toEqual([
            put(resetApplication()),
            put(deleteDataSamplingPercentage()),
            put(hideDialog()),
        ]);
    });
});
