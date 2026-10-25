// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { updateItemCache } from "../actions/data_actions.js";
import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { GRANULARITY } from "../models/granularity.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { addFiltersToState } from "../store/filter_bar/filter_bar_actions.js";
import { type IAttributeFilter } from "../store/filter_bar/filter_bar_types.js";
import { buildAttributeFilterMock } from "../tests/filter.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type ICacheItem } from "../typings/state_objects.js";

import { getAdditionalDateFiltersLabel } from "./additional_date_filter_selector.js";

const itemCache: Record<string, ICacheItem> = {
    "attr.activity.day.in.week": {
        summary: "",
        identifier: "attr.attr.activity.day.in.week",
        dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
        dfIdentifier: "label.attr.activity.day.in.week",
        uri: "/gdc/md/TeamOneGoodSales1/obj/949",
        ref: {
            uri: "/gdc/md/TeamOneGoodSales1/obj/949",
        },
        title: "Day in Week",
        type: "attribute",
        dateType: GRANULARITY.DAY_IN_WEEK,
    },
};

const additionalDateFilters: IAttributeFilter[] = [
    buildAttributeFilterMock({
        cacheItemIdentifier: "attr.activity.day.in.week",
        localIdentifier: "activity.dayInWeek",
        displayFormRef: { uri: "/activity.days.in.week" },
        filterConfig: {
            selectedElements: [
                {
                    title: "First",
                    available: true,
                    uri: "/1",
                },
                {
                    title: "Second",
                    available: false,
                    uri: "/2",
                },
                {
                    title: "Third",
                    uri: "/3",
                },
            ],
            isInverted: true,
            totalElementsCount: 3,
        },
    }),
    buildAttributeFilterMock({
        cacheItemIdentifier: "attr.activity.day.in.week",
        localIdentifier: "activity.dayInWeek",
        displayFormRef: { uri: "/activity.days.in.week" },
        filterConfig: {
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 0,
        },
    }),
    buildAttributeFilterMock({
        cacheItemIdentifier: "attr.activity.day.in.week",
        localIdentifier: "activity.dayInWeek",
        displayFormRef: { uri: "/activity.days.in.week" },
        filterConfig: {
            selectedElements: [
                {
                    title: "First",
                    available: false,
                    uri: "/1",
                },
            ],
            isInverted: true,
            totalElementsCount: 1,
        },
    }),
];

const DATE_DATASET_ITEMS = [
    {
        attributes: [
            { dfRef: { uri: "/activity.days.in.week" } },
            { dfRef: { uri: "/activity.days.in.month" } },
            { dfRef: { uri: "/activity.days.in.year" } },
        ],
    },
];

describe("additional_date_filter_selector", () => {
    describe("getAdditionalDateFiltersLabel", () => {
        it("should return empty array when no additional date attribute filter is found", () => {
            const result = getAdditionalDateFiltersLabel(getInitializedState());
            expect(result).toEqual([]);
        });

        it("should return label props for additional filters with selection", () => {
            let state = getInitializedState();
            state = rootReducer(state, updateItemCache(itemCache));
            state = rootReducer(state, addFiltersToState(additionalDateFilters, true));
            state = withData(state, {
                dateDatasetsMeta: {
                    ...state.data.dateDatasetsMeta,
                    items: DATE_DATASET_ITEMS as unknown as IDateDatasetsMetaItem[],
                },
            });

            const result = getAdditionalDateFiltersLabel(state);
            expect(result).toMatchSnapshot();
        });
    });
});
