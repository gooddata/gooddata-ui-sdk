// (C) 2022-2026 GoodData Corporation

// @vitest-environment node
import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { selectVisualizationType } from "../actions/buckets_actions.js";
import { storeAppliedChartSort, storeChartSortConfig } from "../store/chart_sort/chart_sort_actions.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";

import { watchSelectVisualizationType } from "./select_visualization_type_sagas.js";

const visualizationClass = tableVisualizationClass;

describe("watchSelectVisualizationType", () => {
    describe("BUCKETS_SELECT_VISUALIZATION_TYPE", () => {
        it("should put two actions to reset sort config and applied sort", async () => {
            const action = selectVisualizationType(visualizationClass);
            const saga: RunResult = await expectSaga(watchSelectVisualizationType)
                .dispatch(action)
                .silentRun(0);

            expect(saga.effects.put).toEqual([
                put(
                    storeChartSortConfig({
                        supported: false,
                        disabled: true,
                        defaultSort: [],
                        availableSorts: [],
                    }),
                ),
                put(storeAppliedChartSort([])),
            ]);
        });
    });
});
