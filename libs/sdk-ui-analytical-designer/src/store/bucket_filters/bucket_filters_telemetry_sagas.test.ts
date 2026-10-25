// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import {
    logAddTextFilterToInsight,
    logAttributeFilterApplied,
    logTextAttributeFilterApplied,
} from "../../services/telemetry/tracking_events.js";

import {
    commandAddOrUpdateFilterItems,
    storeSetBucketItemUpdateMetricFilter,
    storeUpdateAttributeFilter,
} from "./bucket_filters_actions.js";
import {
    handleAddOrUpdateFilterItems,
    handleSetBucketItemUpdateMetricFilter,
    handleUpdateAttributeFilter,
} from "./bucket_filters_telemetry_sagas.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../services/telemetry/tracking_events.js", async (importActual) => {
    const actual = await importActual<Record<string, unknown>>();
    return {
        ...actual,
        logAddTextFilterToInsight: vi.fn(),
        logAttributeFilterApplied: vi.fn(),
        logTextAttributeFilterApplied: vi.fn(),
    };
});

// Pins the event set and the event COUNTS produced per action.

const state = {};

beforeEach(() => {
    (logAddTextFilterToInsight as Mock).mockClear();
    (logAttributeFilterApplied as Mock).mockClear();
    (logTextAttributeFilterApplied as Mock).mockClear();
});

describe("handleUpdateAttributeFilter", () => {
    it("should log a text-filter-applied event when the update carries a text mode filter", async () => {
        const action = storeUpdateAttributeFilter({
            filterLocalIdentifier: "f1",
            textModeFilter: { mode: "arbitrary", values: ["a"], negativeSelection: false },
        });

        await expectSaga(handleUpdateAttributeFilter, action).withState(state).silentRun();

        expect(logTextAttributeFilterApplied).toHaveBeenCalledTimes(1);
        expect(logAttributeFilterApplied).not.toHaveBeenCalled();
    });

    it("should log a filter-applied event with the inversion flag when elements are selected", async () => {
        const action = storeUpdateAttributeFilter({
            filterLocalIdentifier: "f1",
            selectedElements: [{ uri: "/element/1", title: "one" }],
            isInverted: true,
        });

        await expectSaga(handleUpdateAttributeFilter, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).toHaveBeenCalledTimes(1);
        expect((logAttributeFilterApplied as Mock).mock.calls[0][0].isInverted).toBe(true);
        expect(logTextAttributeFilterApplied).not.toHaveBeenCalled();
    });

    it("should log nothing when the selection is empty", async () => {
        const action = storeUpdateAttributeFilter({
            filterLocalIdentifier: "f1",
            selectedElements: [],
        });

        await expectSaga(handleUpdateAttributeFilter, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).not.toHaveBeenCalled();
        expect(logTextAttributeFilterApplied).not.toHaveBeenCalled();
    });
});

describe("handleAddOrUpdateFilterItems", () => {
    it("should log once per updated filter and once per added text filter, exactly as the reducer did", async () => {
        const action = commandAddOrUpdateFilterItems({
            attributeFilters: [
                // update of an existing filter with a selection → filter-applied event
                {
                    filterLocalIdentifier: "f1",
                    selectedElements: [{ uri: "/element/1", title: "one" }],
                    isInverted: false,
                },
                // newly added filter (no localIdentifier) → NO filter-applied event
                { filterLocalIdentifier: undefined, cacheItemIdentifier: "attr.a", dfIdentifier: "df.a" },
            ],
            arbitraryFilters: [
                // new text filter → added-to-insight event
                { values: ["x"], negativeSelection: false },
            ],
            matchFilters: [
                // update of an existing filter to text mode → text-filter-applied event
                {
                    filterLocalIdentifier: "f2",
                    operator: "contains",
                    literal: "x",
                },
            ],
        });

        await expectSaga(handleAddOrUpdateFilterItems, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).toHaveBeenCalledTimes(1);
        expect(logAddTextFilterToInsight).toHaveBeenCalledTimes(1);
        expect(logTextAttributeFilterApplied).toHaveBeenCalledTimes(1);
    });

    it("should log nothing for date, ranking and measure value filters", async () => {
        const action = commandAddOrUpdateFilterItems({
            dateFilters: [
                {
                    localIdentifier: "d1",
                    filterConfig: { granularity: "GDC.time.year", interval: [0, 1] },
                    dateDatasetRef: { identifier: "dt" },
                },
            ],
            measureValueFilters: [{ measureIdentifier: "m1" }],
        });

        await expectSaga(handleAddOrUpdateFilterItems, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).not.toHaveBeenCalled();
        expect(logAddTextFilterToInsight).not.toHaveBeenCalled();
        expect(logTextAttributeFilterApplied).not.toHaveBeenCalled();
    });
});

describe("handleSetBucketItemUpdateMetricFilter", () => {
    const attributeItem = {
        localIdentifier: "a1",
        attribute: "attr.a",
        filters: [{ attribute: "attr.a", localIdentifier: "f1" }],
    };
    const attributeFilter = { attribute: "attr.a", localIdentifier: "f1" };

    it("should log a filter-applied event for a modified attribute filter with a selection", async () => {
        const action = storeSetBucketItemUpdateMetricFilter(
            attributeItem,
            attributeFilter,
            { selectedElements: [{ uri: "/element/1" }], isInverted: false },
            true,
        );

        await expectSaga(handleSetBucketItemUpdateMetricFilter, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).toHaveBeenCalledTimes(1);
        expect((logAttributeFilterApplied as Mock).mock.calls[0][0].isInverted).toBe(false);
    });

    it("should log a text-filter-applied event for a modified text mode filter", async () => {
        const action = storeSetBucketItemUpdateMetricFilter(
            attributeItem,
            attributeFilter,
            { textModeFilter: { mode: "match", operator: "contains", literal: "x" } },
            true,
        );

        await expectSaga(handleSetBucketItemUpdateMetricFilter, action).withState(state).silentRun();

        expect(logTextAttributeFilterApplied).toHaveBeenCalledTimes(1);
    });

    it("should log nothing when the filter is not marked as modified", async () => {
        const action = storeSetBucketItemUpdateMetricFilter(
            attributeItem,
            attributeFilter,
            { selectedElements: [{ uri: "/element/1" }] },
            false,
        );

        await expectSaga(handleSetBucketItemUpdateMetricFilter, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).not.toHaveBeenCalled();
    });

    it("should log nothing for a non-attribute (date) metric filter", async () => {
        const dateItem = {
            localIdentifier: "m1",
            attribute: "metric.m",
            filters: [{ attribute: "attr.date", localIdentifier: "f1" }],
        };

        const action = storeSetBucketItemUpdateMetricFilter(
            dateItem,
            attributeFilter,
            { selectedElements: [{ uri: "/element/1" }] },
            true,
        );

        await expectSaga(handleSetBucketItemUpdateMetricFilter, action).withState(state).silentRun();

        expect(logAttributeFilterApplied).not.toHaveBeenCalled();
        expect(logTextAttributeFilterApplied).not.toHaveBeenCalled();
    });
});
