// (C) 2021-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type DateFilterItem } from "@gooddata/sdk-embedding";
import { type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { updateDateFilter as createUpdateDateFilterAction } from "../../sagas/date_datasets/date_datasets_actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { activityDateDataset } from "../../tests/constants.test.helpers.js";
import { DATE_FILTER_DATASET_REF } from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { setMigratedAdditionalFilters } from "../filter_bar/filter_bar_actions.js";
import { getFirstDateFilter } from "../filter_bar/filter_bar_selector.js";
import { type IDateFilter, type IDateFilterConfig } from "../filter_bar/filter_bar_types.js";
import {
    addParameterFilters as addParameterFiltersAction,
    addParameterFiltersToState,
} from "../filter_bar/parameter_filter_actions.js";

import { addGlobalDateFilter } from "./bucket_filters.test.helpers.js";
import { dateFilterClosed, storeUpdateDateFilter } from "./bucket_filters_actions.js";
import {
    addParameterFilters,
    postFilterContextChangedWithAvailableCommands,
    updateDateFilter,
    watchBucketFilters,
} from "./bucket_filters_sagas.js";

describe("updateDateFilter", () => {
    const testFilterConfig: IDateFilterConfig = {
        granularity: "GDC.time.year",
        interval: [0, 1],
    };

    const testGlobalDateFilter: IDateFilter = {
        localIdentifier: "filterItemLocalIdentifier",
        type: "date",
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
        filterConfig: testFilterConfig,
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    };

    it("should use dateDataset of current date filter if new dateDataset is not between available dateDatasets", async () => {
        const stateWithDateFilter = addGlobalDateFilter(getInitializedState(), testGlobalDateFilter);
        const state = withData(stateWithDateFilter, {
            dateDatasets: {
                ...stateWithDateFilter.data.dateDatasets,
                available: [],
                unavailable: 2,
                loaded: true,
            },
        });

        const firstDateFilter = getFirstDateFilter(state);

        const action = createUpdateDateFilterAction({
            localIdentifier: firstDateFilter.localIdentifier,
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            overTimeComparisonMeasures: [],
            filterConfig: testFilterConfig,
            dateDatasetRef: activityDateDataset.ref,
        });

        const saga: RunResult = await expectSaga(updateDateFilter, action.payload)
            .provide([
                [select(getIsEmbedded), false],
                [select(), state],
                [select(getFirstDateFilter), testGlobalDateFilter],
            ])
            .put(
                storeUpdateDateFilter({
                    ...action.payload,
                    dateDatasetRef: testGlobalDateFilter.dateDatasetRef,
                }),
            )
            .silentRun();

        expect(saga.effects.put).toBe(undefined);
    });

    it("should put store action to update date filter if dateDataset is valid", async () => {
        const stateWithDateFilter = addGlobalDateFilter(getInitializedState(), testGlobalDateFilter);
        const state = withData(stateWithDateFilter, {
            dateDatasets: {
                ...stateWithDateFilter.data.dateDatasets,
                available: [activityDateDataset],
                unavailable: 2,
                loaded: true,
            },
        });

        const firstDateFilter = getFirstDateFilter(state);

        const action = createUpdateDateFilterAction({
            localIdentifier: firstDateFilter.localIdentifier,
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            overTimeComparisonMeasures: [],
            filterConfig: testFilterConfig,
            dateDatasetRef: activityDateDataset.ref,
        });

        return expectSaga(updateDateFilter, action.payload)
            .provide([
                [select(getIsEmbedded), false],
                [select(), state],
            ])
            .put(storeUpdateDateFilter(action.payload))
            .silentRun();
    });

    it("should inform about filter context changed with correct external filter if embedded", async () => {
        const stateWithDateFilter = addGlobalDateFilter(getInitializedState(), testGlobalDateFilter);
        const state = withData(stateWithDateFilter, {
            dateDatasets: {
                ...stateWithDateFilter.data.dateDatasets,
                available: [activityDateDataset],
                unavailable: 2,
                loaded: true,
            },
        });

        const firstDateFilter = getFirstDateFilter(state);

        const action = createUpdateDateFilterAction({
            localIdentifier: firstDateFilter.localIdentifier,
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            overTimeComparisonMeasures: [],
            filterConfig: testFilterConfig,
            dateDatasetRef: activityDateDataset.ref,
        });

        const expectedExternalFilter: DateFilterItem = {
            relativeDateFilter: {
                dataSet: activityDateDataset.ref,
                granularity: testFilterConfig.granularity,
                from: testFilterConfig.interval[0] as number,
                to: testFilterConfig.interval[1] as number,
            },
            localIdentifier: firstDateFilter.localIdentifier,
        };

        return expectSaga(updateDateFilter, action.payload)
            .provide([
                [select(getIsEmbedded), true],
                [select(), state],
            ])
            .call(postFilterContextChangedWithAvailableCommands, expectedExternalFilter)
            .silentRun();
    });
});

describe("UI_DATE_FILTER_CLOSED", () => {
    it("should put action to reset additional date filters reset flag", () => {
        return expectSaga(watchBucketFilters)
            .put(setMigratedAdditionalFilters([]))
            .dispatch(dateFilterClosed())
            .silentRun();
    });
});

describe("addParameterFilters", () => {
    const parameter = (id: string, title: string, defaultValue: number): IParameterMetadataObject =>
        ({
            type: "parameter",
            id,
            uri: `/parameters/${id}`,
            ref: idRef(id, "parameter"),
            title,
            description: "",
            tags: [],
            production: true,
            deprecated: false,
            unlisted: false,
            definition: { type: "NUMBER", defaultValue },
        }) as unknown as IParameterMetadataObject;

    it("should map metadata to parameter filters and put STORE_ADD_PARAMETER_FILTERS", async () => {
        const p1 = parameter("p1", "Param 1", 10);
        const p2 = parameter("p2", "Param 2", 20);

        const action = addParameterFiltersAction([p1, p2]);

        // The local identifiers come from the real generator, so they are matched by shape and only
        // checked for uniqueness. Replacing the generator module with a counting stub would leak
        // that stub into every other test file through the shared module cache.
        const saga: RunResult = await expectSaga(addParameterFilters, action).silentRun();

        const putActions = saga.effects.put.map((effect) => effect.payload.action);

        expect(putActions).toEqual([
            addParameterFiltersToState([
                {
                    type: "parameter",
                    localIdentifier: expect.any(String),
                    parameterRef: p1.ref,
                    name: p1.title,
                    value: 10,
                    definition: { type: "NUMBER", defaultValue: 10 },
                },
                {
                    type: "parameter",
                    localIdentifier: expect.any(String),
                    parameterRef: p2.ref,
                    name: p2.title,
                    value: 20,
                    definition: { type: "NUMBER", defaultValue: 20 },
                },
            ]),
        ]);

        const [firstItem, secondItem] = putActions[0].payload.items;

        expect(firstItem.localIdentifier).not.toEqual(secondItem.localIdentifier);
    });
});
