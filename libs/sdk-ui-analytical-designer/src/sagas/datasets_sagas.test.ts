// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { datasetChanged } from "../actions/data_actions.js";
import { datasetParamChanged, getDataSet } from "../selectors/route_selector.js";

import { updateSelectedDataset } from "./datasets_sagas.js";

describe("datasets", () => {
    describe("updateSelectedDataset", () => {
        it("should update dataset when query parameter changed", async () => {
            const { effects } = await expectSaga(updateSelectedDataset)
                .provide([
                    [select(datasetParamChanged), true],
                    [select(getDataSet), "newDatasetId"],
                ])
                .returns(true)
                .silentRun(0);

            expect(effects.put).toEqual([put(datasetChanged("newDatasetId", false))]);
        });

        it("should Not update dataset when query parameter not changed", async () => {
            const { effects } = await expectSaga(updateSelectedDataset)
                .provide([
                    [select(datasetParamChanged), false],
                    [select(getDataSet), "datasetId"],
                ])
                .returns(false)
                .silentRun(0);

            expect(effects.put).toBeUndefined();
        });

        it("should set preselect flag for dataset changed action", async () => {
            const { effects } = await expectSaga(updateSelectedDataset, true)
                .provide([
                    [select(datasetParamChanged), true],
                    [select(getDataSet), "newDatasetId"],
                ])
                .returns(true)
                .silentRun(0);

            expect(effects.put).toEqual([put(datasetChanged("newDatasetId", true))]);
        });
    });
});
