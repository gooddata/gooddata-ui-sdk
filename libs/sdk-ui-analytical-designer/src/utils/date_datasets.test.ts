// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { MEASURES, VIEW } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { GRANULARITY } from "../models/granularity.js";
import { save } from "../models/item_cache.js";
import { initialState } from "../reducers/initial_state.js";
import { getDateBucketItemsInBucket } from "../store/buckets/buckets_read_helpers.js";
import { withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import {
    activityDateDataset,
    closedDateDataset,
    defaultBuckets,
    defaultUiConfig,
    defaultVisualizationClasses,
    setupAppStateWithDateDatasetMeta,
} from "../tests/constants.test.helpers.js";
import { itemCache } from "../tests/data_layer.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { DateDatasetUtils } from "./date_datasets.js";

describe("DateDatasetUtils", () => {
    // the state form died with the shortcuts/recommendations wrappers; the pins now
    // run over the value-level helper the operations use
    describe("getDateBucketItemsInBucket", () => {
        const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(initialState);
        const base = withData(save(stateWithDateDatasetMeta, itemCache), {
            buckets: defaultBuckets,
            visualizationClasses: defaultVisualizationClasses,
            visualizationClass: defaultVisualizationClasses[1],
        });
        const stateWithCache = withData(base, {
            extendedReferencePoint: { ...base.data.extendedReferencePoint, uiConfig: defaultUiConfig },
        });

        it("should not find date item in Metrics", () => {
            const date = getDateBucketItemsInBucket(stateWithCache.data.buckets, MEASURES);

            expect(date).toEqual([]);
        });

        it("should find date item in Metrics", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const state = withData(stateWithCache, {
                buckets: withBucketItems(stateWithCache.data.buckets, 0, [date]),
            });
            const res = getDateBucketItemsInBucket(state.data.buckets, MEASURES);

            expect(res).toBeDefined();
            expect(res).toEqual([date]);
        });

        it("should find date item in View", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const state = withData(stateWithCache, {
                buckets: withBucketItems(stateWithCache.data.buckets, 1, [date]),
            });
            const res = getDateBucketItemsInBucket(state.data.buckets, VIEW);

            expect(res).toBeDefined();
            expect(res).toEqual([date]);
        });

        it("should find date item in Categories with multiple item", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const state = withData(stateWithCache, {
                buckets: withBucketItems(stateWithCache.data.buckets, 1, [{}, {}, date, {}]),
            });
            const res = getDateBucketItemsInBucket(state.data.buckets, VIEW);

            expect(res).toBeDefined();
            expect(res).toEqual([date]);
        });
    });

    describe("getDateDatasetUri", () => {
        it("should return undefined when date dataset is null", () => {
            const uri = DateDatasetUtils.getDateDatasetUri(null);
            expect(uri).toBeUndefined();
        });

        it("should return undefined when date dataset is undefined", () => {
            const uri = DateDatasetUtils.getDateDatasetUri(undefined);
            expect(uri).toBeUndefined();
        });

        it("should return date dataset uri when date dataset is provided", () => {
            const uri = DateDatasetUtils.getDateDatasetUri({
                attributes: [
                    {
                        ref: uriRef("active.dfUri"),
                        dfRef: {
                            identifier: "active.dfIdentifier",
                        },
                        dateType: GRANULARITY.DATE,
                        dfIdentifier: "active.dfIdentifier",
                        dfUri: "active.dfUri",
                        granularity: "",
                        uri: "active.uri",
                        displayForms: [],
                    },
                ],
                id: "active.dd",
                ref: {
                    identifier: "active.dd",
                },
                identifier: "active.dd",
                isAvailable: true,
                relevance: 0,
                title: "Active",
                summary: "",
                type: "",
                uri: "/mock/active.dataseturi",
            });
            expect(uri).toEqual("/mock/active.dataseturi");
        });
    });

    describe("getMostRelevantDateDatasetUri", () => {
        it("should return undefined when provided date datasets are null", () => {
            const uri = DateDatasetUtils.getMostRelevantDateDatasetUri(null);
            expect(uri).toBeUndefined();
        });

        it("should return undefined when provided date datasets are undefined", () => {
            const uri = DateDatasetUtils.getMostRelevantDateDatasetUri(undefined);
            expect(uri).toBeUndefined();
        });

        it("should return URI of the most relevant date dataset from the provided list", () => {
            const uri = DateDatasetUtils.getMostRelevantDateDatasetUri([
                activityDateDataset,
                closedDateDataset,
            ]);
            expect(uri).toEqual(closedDateDataset.uri);
        });
    });
});
