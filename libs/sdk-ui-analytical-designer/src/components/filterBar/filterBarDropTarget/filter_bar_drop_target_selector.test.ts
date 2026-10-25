// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    type IAttributeFilter,
    type IFilterBarConfig,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { filterItems } from "../../../tests/filter.test.helpers.js";
import { type IRawBucketItem } from "../../../typings/buckets.js";

import { canAcceptMoreItems, isAllowedToDrop } from "./filter_bar_drop_target_selector.js";

describe("Filter bar drop target", () => {
    describe("isAllowedToDrop", () => {
        const testConfig: IFilterBarConfig = {
            itemsLimit: 10,
            acceptedTypes: ["attribute"],
        };

        it("returns true it the type of the checked item is accepted, the result number of items is within the limit and the item is not already present", () => {
            const isAllowedToDropFunction = isAllowedToDrop.resultFunc(filterItems, testConfig, true, []);

            const result = isAllowedToDropFunction("cacheIdentifier123", "attribute");

            expect(result).toBe(true);
        });

        it("returns false if the type of the checked item is not accepted", () => {
            const isAllowedToDropFunction = isAllowedToDrop.resultFunc(filterItems, testConfig, true, []);

            const result = isAllowedToDropFunction("cacheIdentifier123", "metric");

            expect(result).toBe(false);
        });

        it("returns true for a computed attribute wherever an attribute is accepted", () => {
            // no `accepts` list names the computed attribute type - the dragged type is normalized
            const isAllowedToDropFunction = isAllowedToDrop.resultFunc(
                filterItems,
                { ...testConfig, acceptedTypes: ["attribute"] },
                true,
                [],
            );

            expect(isAllowedToDropFunction("computedAttribute123", "computedAttribute")).toBe(true);
        });

        it("lets a computed attribute drop through a same-id ATTRIBUTE filter, and blocks a re-drop", () => {
            // a regular attribute filter on the shared identifier is already in the bar
            const attributeFilterOnSharedId: IAttributeFilter = {
                type: "attribute",
                localIdentifier: "f1",
                cacheItemIdentifier: "shared",
                displayFormRef: idRef("shared.df", "displayForm"),
                filterConfig: { selectedElements: [], totalElementsCount: 0, isInverted: true },
            };
            const computedAttributeFilterOnSharedId = {
                ...attributeFilterOnSharedId,
                localIdentifier: "f2",
                displayFormRef: idRef("shared", "computedAttribute"),
            };
            // acceptance is by the NORMALIZED type, so naming the attribute alone covers both kinds
            const config = { ...testConfig, acceptedTypes: ["attribute"] as const };

            const withAttributeFilter = isAllowedToDrop.resultFunc(
                [attributeFilterOnSharedId],
                config,
                true,
                [],
            );
            // the identifier collides but the KINDS differ - the computed attribute may still be dropped
            expect(withAttributeFilter("shared", "computedAttribute")).toBe(true);
            // while the same regular attribute is a real duplicate
            expect(withAttributeFilter("shared", "attribute")).toBe(false);

            const withComputedAttributeFilter = isAllowedToDrop.resultFunc(
                [computedAttributeFilterOnSharedId],
                config,
                true,
                [],
            );
            // and the mirror case: a computed-attribute filter blocks only its own kind
            expect(withComputedAttributeFilter("shared", "computedAttribute")).toBe(false);
            expect(withComputedAttributeFilter("shared", "attribute")).toBe(true);
        });

        it("returns false if the item is already present", () => {
            const isAllowedToDropFunction = isAllowedToDrop.resultFunc(filterItems, testConfig, true, []);

            const result = isAllowedToDropFunction("attr.product.id", "attribute");

            expect(result).toBe(false);
        });

        it("returns false if the limit number of items have been reached", () => {
            const testConfig: IFilterBarConfig = {
                itemsLimit: 3,
                acceptedTypes: ["attribute"],
            };
            const isAllowedToDropFunction = isAllowedToDrop.resultFunc(filterItems, testConfig, true, []);

            const result = isAllowedToDropFunction("cacheIdentifier123", "attribute");

            expect(result).toBe(false);
        });

        describe("measure value filter duplicate detection", () => {
            const metricConfig: IFilterBarConfig = {
                itemsLimit: 10,
                acceptedTypes: ["metric"],
            };

            const bucketMeasures: IRawBucketItem[] = [
                { localIdentifier: "m1", attribute: "metricIdentifier1" } as IRawBucketItem,
                { localIdentifier: "m2", attribute: "metricIdentifier2" } as IRawBucketItem,
            ];

            it("returns false when a bucket-based measure filter already exists for the same metric", () => {
                const filtersWithBucketMeasure: IMeasureValueFilter[] = [
                    {
                        type: "measure",
                        localIdentifier: "f1",
                        measureLocalIdentifier: "m1",
                    },
                ];

                const isAllowedToDropFunction = isAllowedToDrop.resultFunc(
                    filtersWithBucketMeasure,
                    metricConfig,
                    true,
                    bucketMeasures,
                );

                // Dragging metric with identifier "metricIdentifier1" should be blocked
                // because there's already a filter for bucket measure "m1" which maps to "metricIdentifier1"
                const result = isAllowedToDropFunction("metricIdentifier1", "metric");

                expect(result).toBe(false);
            });

            it("returns true when no measure filter exists for the metric", () => {
                const filtersWithBucketMeasure: IMeasureValueFilter[] = [
                    {
                        type: "measure",
                        localIdentifier: "f1",
                        measureLocalIdentifier: "m1",
                    },
                ];

                const isAllowedToDropFunction = isAllowedToDrop.resultFunc(
                    filtersWithBucketMeasure,
                    metricConfig,
                    true,
                    bucketMeasures,
                );

                // Dragging metric with identifier "metricIdentifier2" should be allowed
                // because there's no filter for that metric
                const result = isAllowedToDropFunction("metricIdentifier2", "metric");

                expect(result).toBe(true);
            });

            it("returns false when a catalog-based measure filter already exists for the same metric", () => {
                const filtersWithCatalogMeasure: IMeasureValueFilter[] = [
                    {
                        type: "measure",
                        localIdentifier: "f1",
                        measureRef: idRef("metricIdentifier1"),
                    },
                ];

                const isAllowedToDropFunction = isAllowedToDrop.resultFunc(
                    filtersWithCatalogMeasure,
                    metricConfig,
                    true,
                    bucketMeasures,
                );

                // Dragging the same metric should be blocked
                const result = isAllowedToDropFunction("metricIdentifier1", "metric");

                expect(result).toBe(false);
            });

            it("returns true when bucket measure is not found (orphaned filter)", () => {
                const filtersWithOrphanedMeasure: IMeasureValueFilter[] = [
                    {
                        type: "measure",
                        localIdentifier: "f1",
                        measureLocalIdentifier: "orphaned_m1",
                    },
                ];

                const isAllowedToDropFunction = isAllowedToDrop.resultFunc(
                    filtersWithOrphanedMeasure,
                    metricConfig,
                    true,
                    bucketMeasures,
                );

                // When the bucket measure is not found, the filter should not block drops
                const result = isAllowedToDropFunction("metricIdentifier1", "metric");

                expect(result).toBe(true);
            });
        });
    });

    describe("canAcceptMoreItems", () => {
        it("returns false when the number of filter items is higher than the limit", () => {
            const result = canAcceptMoreItems.resultFunc(filterItems, 2);

            expect(result).toBe(false);
        });

        it("returns false when the number of filter items is equal to the limit", () => {
            const result = canAcceptMoreItems.resultFunc(filterItems, 3);

            expect(result).toBe(false);
        });

        it("returns true when the number of filter items is lower to the limit", () => {
            const result = canAcceptMoreItems.resultFunc(filterItems, 10);

            expect(result).toBe(true);
        });
    });
});
