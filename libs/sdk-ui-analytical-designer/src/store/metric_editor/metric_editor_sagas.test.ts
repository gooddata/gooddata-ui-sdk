// (C) 2022-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type ISaveMetricInfo, SaveNameMode } from "@gooddata/sdk-ui-metric-component";

import {
    type IConfirmUnsavedChangesDialogActionPayloadData,
    createLeaveAnywayButtonClickedAction,
} from "../../actions/confirm_unsaved_changes_actions.js";
import { addMessage } from "../../actions/messages_actions.js";
import { HOST_NAVIGATION } from "../../constants/platform.js";
import { initialState } from "../../reducers/initial_state.js";
import { CatalogUiActions } from "../../sagas/catalog/catalog_ui_actions.js";
import { setLoadingGroups, setLoadingItems } from "../catalog/catalog_store_actions.js";

import { exampleCatalogMetric, exampleMetric } from "./metric_editor.test.helpers.js";
import {
    metricEditorCancelUnsavedChangesDialog,
    metricEditorCloseTabs,
    metricEditorFocusMetric,
    metricEditorMetricDeleteError,
    metricEditorMetricDeleted,
    metricEditorMetricSaveError,
    metricEditorMetricSaved,
    metricEditorOpen,
    metricEditorOpenTabWithMetric,
} from "./metric_editor_actions.js";
import {
    HIDE_ERROR_MESSAGE_AFTER,
    HIDE_SUCCESS_MESSAGE_AFTER,
    removeMetricFromBucket,
    watchMetricEditor,
} from "./metric_editor_sagas.js";
import { getUnsavedChangesData, isMetricEditorMetricOpened } from "./metric_editor_selector.js";
import { createTabIdentifier } from "./metric_editor_services.js";

const exampleIdentifier = createTabIdentifier(exampleMetric.ref);

const exampleError = new Error("test error");

describe("metric editor saga", () => {
    it("should open new tab when metric con opened", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide({
                select({ selector }) {
                    if (selector === isMetricEditorMetricOpened) {
                        return false;
                    }

                    // I am not able to specify selector statically, because it is factory...
                    return exampleCatalogMetric;
                },
            })
            .dispatch(metricEditorOpen(exampleMetric))
            .silentRun();

        expect(saga.effects.put).toEqual([put(metricEditorOpenTabWithMetric(exampleMetric))]);
    });

    it("should focus existing tab when metric is opened", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([[select(isMetricEditorMetricOpened, exampleMetric), true]])
            .dispatch(metricEditorOpen(exampleMetric))
            .silentRun();

        expect(saga.effects.put).toEqual([put(metricEditorFocusMetric(exampleMetric))]);
    });

    it("should process metric delete", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([
                [select(), initialState],
                [call(removeMetricFromBucket), undefined],
            ])
            .dispatch(metricEditorMetricDeleted(exampleMetric))
            .silentRun();

        expect(saga.effects.put).toEqual([
            put(
                addMessage({
                    type: "success",
                    translationKey: "messages.deleteMetric",
                    durationInMs: HIDE_SUCCESS_MESSAGE_AFTER,
                }),
            ),
            put(metricEditorCloseTabs([exampleIdentifier])),
            put(setLoadingItems(true)),
            put(setLoadingGroups(true)),
            put(CatalogUiActions.requestCatalogRefresh(true)),
        ]);
    });

    it("should addMessage when delete metric failed", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .dispatch(metricEditorMetricDeleteError(exampleMetric, exampleError))
            .silentRun();

        expect(saga.effects.put).toEqual([
            put(
                addMessage({
                    type: "error",
                    translationKey: "messages.deleteMetricFailed",
                }),
            ),
        ]);
    });

    it("should process metric save", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([
                [select(), initialState],
                [call(removeMetricFromBucket), undefined],
            ])
            .dispatch(
                metricEditorMetricSaved(
                    {
                        ...exampleMetric,
                        description: "",
                    },
                    {
                        saveMode: SaveNameMode.save,
                        regenerateId: false,
                        previousMetric: {
                            ...exampleMetric,
                        },
                    } as ISaveMetricInfo,
                    "new",
                ),
            )
            .silentRun();

        expect(saga.effects.put).toEqual([
            put(
                addMessage({
                    type: "success",
                    translationKey: "messages.saveMetric",
                    durationInMs: HIDE_SUCCESS_MESSAGE_AFTER,
                }),
            ),
            put(CatalogUiActions.requestCatalogRefresh()),
        ]);
    });

    it("now show message if not changed", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([
                [select(), initialState],
                [call(removeMetricFromBucket), undefined],
            ])
            .dispatch(
                metricEditorMetricSaved(
                    exampleMetric,
                    {
                        saveMode: SaveNameMode.save,
                        regenerateId: false,
                        previousMetric: {
                            ...exampleMetric,
                        },
                    } as ISaveMetricInfo,
                    "new",
                ),
            )
            .silentRun();

        expect(saga.effects.put).toEqual([put(CatalogUiActions.requestCatalogRefresh())]);
    });

    it("should addMessage when save metric failed", async () => {
        const saga: RunResult = await expectSaga(watchMetricEditor)
            .dispatch(metricEditorMetricSaveError(exampleMetric, exampleError))
            .silentRun();

        expect(saga.effects.put).toEqual([
            put(
                addMessage({
                    type: "error",
                    translationKey: "messages.metricSaveError",
                    durationInMs: HIDE_ERROR_MESSAGE_AFTER,
                }),
            ),
        ]);
    });

    it("should pass IConfirmUnsavedChangesDialogActionPayloadData when", async () => {
        const redirectData: IConfirmUnsavedChangesDialogActionPayloadData = {
            goToPage: "some-page",
        };

        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([[select(getUnsavedChangesData), redirectData]])
            .dispatch(metricEditorCancelUnsavedChangesDialog())
            .silentRun();

        expect(saga.effects.put).toEqual([put(createLeaveAnywayButtonClickedAction(redirectData))]);
    });

    it("should keep the host navigation target when cancelling the unsaved changes dialog", async () => {
        const hostNavigationData: IConfirmUnsavedChangesDialogActionPayloadData = {
            goToPage: HOST_NAVIGATION,
        };

        const saga: RunResult = await expectSaga(watchMetricEditor)
            .provide([[select(getUnsavedChangesData), hostNavigationData]])
            .dispatch(metricEditorCancelUnsavedChangesDialog())
            .silentRun();

        expect(saga.effects.put).toEqual([put(createLeaveAnywayButtonClickedAction(hostNavigationData))]);
    });
});
