// (C) 2007-2020 GoodData Corporation
import {
    transform2Dropdown,
    recommendedHeader,
    otherHeader,
    getRecommendedDateDataset,
    preselectDateDataset,
} from "../dateDatasets";

describe("dateDatasets", () => {
    describe("getRecommendedDateDataset", () => {
        it("should return first item for different relevance", () => {
            expect(
                getRecommendedDateDataset([
                    { identifier: "c", title: "c", relevance: 2 },
                    { identifier: "a", title: "a", relevance: 2 },
                    { identifier: "b", title: "b", relevance: 1 },
                ]),
            ).toEqual({ identifier: "a", title: "a", relevance: 2 });
        });

        it("should return nothing for same relevance", () => {
            expect(
                getRecommendedDateDataset([
                    { identifier: "c", title: "c", relevance: 2 },
                    { identifier: "a", title: "a", relevance: 2 },
                    { identifier: "b", title: "b", relevance: 2 },
                ]),
            ).toEqual(null);
        });

        it("should not mutate input param", () => {
            const input = [
                { identifier: "c", title: "c", relevance: 2 },
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "b", title: "b", relevance: 2 },
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
                { identifier: "c", title: "c", relevance: 2 },
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "b", title: "b", relevance: 2 },
            ];
            const backup = [...input];
            transform2Dropdown(input);
            expect(backup).toEqual(input);
        });

        it("should always recommend up to 3 dates with different relevance greater than 0", () => {
            expect(
                transform2Dropdown([
                    { identifier: "c", title: "c", relevance: 2 },
                    { identifier: "a", title: "a", relevance: 2 },
                    { identifier: "b", title: "b", relevance: 1 },
                ]),
            ).toEqual([
                recommendedHeader,
                { identifier: "a", title: "a", relevance: 2 },
                { identifier: "c", title: "c", relevance: 2 },
                { identifier: "b", title: "b", relevance: 1 },
            ]);

            expect(
                transform2Dropdown([
                    { identifier: "b", title: "b", relevance: 1 },
                    { identifier: "c", title: "c", relevance: 2 },
                ]),
            ).toEqual([
                recommendedHeader,
                { identifier: "c", title: "c", relevance: 2 },
                { identifier: "b", title: "b", relevance: 1 },
            ]);
        });

        describe("should separate items with different relevance", () => {
            it("should Recommended by relevance and alphabetically", () => {
                const items = [
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "b", title: "b", relevance: 2 },
                    { identifier: "a", title: "a", relevance: 3 },
                    { identifier: "d", title: "d", relevance: 1 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { identifier: "a", title: "a", relevance: 3 },
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "b", title: "b", relevance: 2 },
                    otherHeader,
                    { identifier: "d", title: "d", relevance: 1 },
                ]);
            });

            it("should sort Others alphabetically", () => {
                const items = [
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "d", title: "d", relevance: 3 },
                    { identifier: "x", title: "x", relevance: 1 },
                    { identifier: "b", title: "b", relevance: 0 },
                    { identifier: "a", title: "a", relevance: 2 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "d", title: "d", relevance: 3 },
                    { identifier: "a", title: "a", relevance: 2 },
                    otherHeader,
                    { identifier: "b", title: "b", relevance: 0 },
                    { identifier: "x", title: "x", relevance: 1 },
                ]);
            });

            it("should move date with 0 relevance always to Others", () => {
                const items = [
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "b", title: "b", relevance: 0 },
                    { identifier: "a", title: "a", relevance: 2 },
                ];

                expect(transform2Dropdown(items)).toEqual([
                    recommendedHeader,
                    { identifier: "c", title: "c", relevance: 3 },
                    { identifier: "a", title: "a", relevance: 2 },
                    otherHeader,
                    { identifier: "b", title: "b", relevance: 0 },
                ]);
            });
        });

        it("should sort list alphabetically with same relevance", () => {
            const items = [
                { identifier: "b", title: "b", relevance: 1 },
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
            ];

            expect(transform2Dropdown(items)).toEqual([
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "b", title: "b", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
            ]);
        });
    });

    describe("preselectDateDataset", () => {
        it("should return array with only recommended item if no other items are present", () => {
            const recommendedItem = { identifier: "b", title: "b", relevance: 1 };
            expect(preselectDateDataset([], recommendedItem)).toEqual([
                { identifier: "b", title: "b", relevance: 1 },
            ]);
        });

        it("should add the recommended item to the list if it is not present in items", () => {
            const items = [
                { identifier: "f", title: "f", relevance: 1 },
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
            ];

            const recommendedItem = { identifier: "b", title: "b", relevance: 0 };
            expect(preselectDateDataset(items, recommendedItem)).toEqual([
                recommendedHeader,
                { identifier: "b", title: "b", relevance: 0 },
                otherHeader,
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
                { identifier: "f", title: "f", relevance: 1 },
            ]);
        });

        it("should remove explicitly defined recommended item from items list", () => {
            const items = [
                { identifier: "f", title: "f", relevance: 1 },
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
            ];

            const recommendedItem = { identifier: "f", title: "f", relevance: 1 };
            expect(preselectDateDataset(items, recommendedItem)).toEqual([
                recommendedHeader,
                { identifier: "f", title: "f", relevance: 1 },
                otherHeader,
                { identifier: "a", title: "a", relevance: 1 },
                { identifier: "c", title: "c", relevance: 1 },
                { identifier: "d", title: "d", relevance: 1 },
            ]);
        });
    });
});
