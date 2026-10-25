// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { idRef, newInsightDefinition, newMeasure, uriRef } from "@gooddata/sdk-model";

import { selectVisualizationType } from "../actions/buckets_actions.js";
import { dropCatalogItem } from "../actions/dnd_actions.js";
import { extendedReferencePointChanged } from "../actions/report_actions.js";
import {
    applyAttributeShortcut,
    applyMetricOverTimeShortcut,
    shortcutDateDatasetsError,
    shortcutDateDatasetsUpdated,
} from "../actions/shortcuts_actions.js";
import { ATTRIBUTE, METRIC } from "../constants/bucket.js";
import { LOCAL_TABLE } from "../constants/visualization_types.js";
import { buildInitialState } from "../reducers/initial_state.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getInsightWithBucketsViaMd } from "../selectors/insight_selectors.js";
import { getDatasetIdentifier, getTagsConfiguration } from "../selectors/route_selector.js";
import { getDroppedCatalogItem } from "../selectors/shortcuts_selector.js";
import { getVisualizationClasses, isTableSelected } from "../services/visualization_class_service.js";
import { getDraggedCatalogItem } from "../store/drag_and_drop/dnd_selectors.js";
import { type IAppState } from "../store/types.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";
import { type ILoadDateDatasetsOptions, loadDateDatasets } from "../utils/api.js";

import { fetchDateDatasets, watchShortcuts } from "./shortcut_sagas.js";

describe("shortcut sagas", () => {
    describe("fetchDateDatasets", () => {
        const projectId = "my.project.id";
        const dataSetIdentifier = "my.csv.dataset.id";
        const dateDatasets: IDateDatasets = { available: [], unavailable: 0 };
        const uri = "/gdc/md/1";
        const catalogItem = { type: METRIC, ref: uriRef(uri) };
        const droppedMeasure = { ref: uriRef(uri) };
        const tagsConfiguration = { includeObjectsWithTags: [idRef("a")] };
        const insight = newInsightDefinition(LOCAL_TABLE);
        const options: ILoadDateDatasetsOptions = {
            items: [newMeasure(uriRef(uri))],
            dataSetIdentifier: idRef(dataSetIdentifier),
            includeObjectsWithTags: [idRef("a")],
            excludeObjectsWithTags: undefined,
        };

        it("should load date datasets", async () => {
            const { effects } = await expectSaga(fetchDateDatasets)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getDatasetIdentifier), dataSetIdentifier],
                    [select(getTagsConfiguration), tagsConfiguration],
                    [select(getInsightWithBucketsViaMd), insight],
                    [select(getDraggedCatalogItem), catalogItem],
                    [select(getDroppedCatalogItem), droppedMeasure],
                    [call(loadDateDatasets, projectId, options), dateDatasets],
                ])
                .dispatch(shortcutDateDatasetsUpdated(dateDatasets))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(shortcutDateDatasetsUpdated(dateDatasets)),
                put(applyMetricOverTimeShortcut(droppedMeasure)),
            ]);
        });

        it("should handle loading errors", async () => {
            const error = new Error("sample error");
            const { effects } = await expectSaga(fetchDateDatasets)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getDatasetIdentifier), dataSetIdentifier],
                    [select(getTagsConfiguration), tagsConfiguration],
                    [select(getInsightWithBucketsViaMd), insight],
                    [select(getDraggedCatalogItem), catalogItem],
                    [select(getDroppedCatalogItem), droppedMeasure],
                    [call(loadDateDatasets, projectId, options), throwError(error)],
                ])
                .dispatch(shortcutDateDatasetsError(error))
                .silentRun(0);

            expect(effects.put).toEqual([put(shortcutDateDatasetsError(error))]);
        });
    });

    describe("watchShortcuts", () => {
        describe("watchAttributeShortcut", () => {
            it("should only add attribute item to bucket when Table visualization is active", async () => {
                const mockedState: IAppState = buildInitialState();
                const catalogItem: ICatalogEntry = {};

                const { effects } = await expectSaga(watchShortcuts)
                    .withState(mockedState)
                    .provide([[select(isTableSelected), true]])
                    .dispatch(applyAttributeShortcut(catalogItem))
                    .silentRun(0);

                expect(effects.put).toEqual([put(dropCatalogItem(ATTRIBUTE, catalogItem))]);
            });

            it("should switch to table visualization and add attribute item to bucket", async () => {
                const mockedState: IAppState = buildInitialState();
                const catalogItem: ICatalogEntry = {};
                const visualizationClasses = [tableVisualizationClass];

                const { effects } = await expectSaga(watchShortcuts)
                    .withState(mockedState)
                    .provide([
                        [select(isTableSelected), false],
                        [select(getVisualizationClasses), visualizationClasses],
                    ])
                    .dispatch(applyAttributeShortcut(catalogItem))
                    .dispatch(extendedReferencePointChanged(null))
                    .silentRun(0);

                expect(effects.put).toEqual([
                    put(selectVisualizationType(visualizationClasses[0])),
                    put(dropCatalogItem(ATTRIBUTE, catalogItem)),
                ]);
            });
        });
    });
});
