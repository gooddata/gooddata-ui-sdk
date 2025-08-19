// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    getRecommendedDateDataset,
    otherHeader,
    preselectDateDataset,
    recommendedHeader,
    transform2Dropdown,
} from "../dateDatasets.js";

describe("dateDatasets", () => {
    describe("getRecommendedDateDataset", () => {
        it("should return first item for different relevance", () => {
            expect(
                getRecommendedDateDataset([
                    { id: "c", title: "c", relevance: 2 },
                    { id: "a", title: "a", relevance: 2 },
                    { id: "b", title: "b", relevance: 1 },
                ]),
            ).toEqual({ id: "a", title: "a", relevance: 2 });
        });

        it("should return nothing for same relevance", () => {
            expect(
                getRecommendedDateDataset([
                    { id: "c", title: "c", relevance: 2 },
                    { id: "a", title: "a", relevance: 2 },
                    { id: "b", title: "b", relevance: 2 },
                ]),
            ).toEqual(null);
        });

        it("should not mutate input param", () => {
            const input = [
                { id: "c", title: "c", relevance: 2 },
                { id: "a", title: "a", relevance: 1 },
                { id: "b", title: "b", relevance: 2 },
            ];
            const backup = [...input];
            getRecommendedDateDataset(input);
            expect(backup).toEqual(input);
        });
    });

    describe("transform2Dropdown", () => {
        it("should return empty array by default", () => {
            expect(transform2Dropdown([])).toEqual([]);
        });

        it("should not mutate input param", () => {
            const input = [
                { id: "c", title: "c", relevance: 2 },
                { id: "a", title: "a", relevance: 1 },
                { id: "b", title: "b", relevance: 2 },
            ];
            const backup = [...input];
            transform2Dropdown(input);
            expect(backup).toEqual(input);
        });

        it("should always recommend up to 3 dates with different relevance greater than 0", () => {
            expect(
                transform2Dropdown([
                    { id: "c", title: "c", relevance: 2 },
                    { id: "a", title: "a", relevance: 2 },
                    { id: "b", title: "b", relevance: 1 },
                ]),
            ).toEqual([
                recommendedHeader,
                { id: "a", title: "a", relevance: 2 },
                { id: "c", title: "c", relevance: 2 },
                { id: "b", title: "b", relevance: 1 },
            ]);

            expect(
                transform2Dropdown([
                    { id: "b", title: "b", relevance: 1 },
                    { id: "c", title: "c", relevance: 2 },
                ]),
            ).toEqual([
                recommendedHeader,
                { id: "c", title: "c", relevance: 2 },
                { id: "b", title: "b", relevance: 1 },
            ]);
        });

        describe("should separate items with different relevance", () => {
            it("should Recommended by relevance and alphabetically", () => {
                const items = [
                    { id: "c", title: "c", relevance: 3 },
                    { id: "b", title: "b", relevance: 2 },
                    { id: "a", title: "a", relevance: 3 },
                    { id: "d", title: "d", relevance: 1 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { id: "a", title: "a", relevance: 3 },
                    { id: "c", title: "c", relevance: 3 },
                    { id: "b", title: "b", relevance: 2 },
                    otherHeader,
                    { id: "d", title: "d", relevance: 1 },
                ]);
            });

            it("should sort Others alphabetically", () => {
                const items = [
                    { id: "c", title: "c", relevance: 3 },
                    { id: "d", title: "d", relevance: 3 },
                    { id: "x", title: "x", relevance: 1 },
                    { id: "b", title: "b", relevance: 0 },
                    { id: "a", title: "a", relevance: 2 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { id: "c", title: "c", relevance: 3 },
                    { id: "d", title: "d", relevance: 3 },
                    { id: "a", title: "a", relevance: 2 },
                    otherHeader,
                    { id: "b", title: "b", relevance: 0 },
                    { id: "x", title: "x", relevance: 1 },
                ]);
            });

            it("should move date with 0 relevance always to Others", () => {
                const items = [
                    { id: "c", title: "c", relevance: 3 },
                    { id: "b", title: "b", relevance: 0 },
                    { id: "a", title: "a", relevance: 2 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { id: "c", title: "c", relevance: 3 },
                    { id: "a", title: "a", relevance: 2 },
                    otherHeader,
                    { id: "b", title: "b", relevance: 0 },
                ]);
            });
        });

        it("should sort list alphabetically with same relevance", () => {
            const items = [
                { id: "b", title: "b", relevance: 1 },
                { id: "a", title: "a", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
            ];

            expect(transform2Dropdown(items)).toEqual([
                { id: "a", title: "a", relevance: 1 },
                { id: "b", title: "b", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
            ]);
        });
    });

    describe("preselectDateDataset", () => {
        it("should return array with only recommended item if no other items are present", () => {
            const recommendedItem = { id: "b", title: "b", relevance: 1 };
            expect(preselectDateDataset([], recommendedItem)).toEqual([
                { id: "b", title: "b", relevance: 1 },
            ]);
        });

        it("should add the recommended item to the list if it is not present in items", () => {
            const items = [
                { id: "f", title: "f", relevance: 1 },
                { id: "a", title: "a", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
            ];

            const recommendedItem = { id: "b", title: "b", relevance: 0 };
            expect(preselectDateDataset(items, recommendedItem)).toEqual([
                recommendedHeader,
                { id: "b", title: "b", relevance: 0 },
                otherHeader,
                { id: "a", title: "a", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
                { id: "f", title: "f", relevance: 1 },
            ]);
        });

        it("should remove explicitly defined recommended item from items list", () => {
            const items = [
                { id: "f", title: "f", relevance: 1 },
                { id: "a", title: "a", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
            ];

            const recommendedItem = { id: "f", title: "f", relevance: 1 };
            expect(preselectDateDataset(items, recommendedItem)).toEqual([
                recommendedHeader,
                { id: "f", title: "f", relevance: 1 },
                otherHeader,
                { id: "a", title: "a", relevance: 1 },
                { id: "c", title: "c", relevance: 1 },
                { id: "d", title: "d", relevance: 1 },
            ]);
        });
    });
});
