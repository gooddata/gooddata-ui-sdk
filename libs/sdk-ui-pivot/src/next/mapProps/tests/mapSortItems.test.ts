// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { mapSortModelToSortItems, mapSortItemsToSortModel } from "../mapSortItems.js";
import { SortModelItem } from "ag-grid-community";
import {
    newAttribute,
    newMeasure,
    newAttributeSort,
    newMeasureSort,
    isAttributeSort,
    isMeasureLocator,
} from "@gooddata/sdk-model";

describe("sortUtils", () => {
    const mockRows = [
        newAttribute("attr1", (m) => m.localId("attr1")),
        newAttribute("attr2", (m) => m.localId("attr2")),
    ];

    const mockMeasures = [
        newMeasure("measure1", (m) => m.localId("measure1")),
        newMeasure("measure2", (m) => m.localId("measure2")),
    ];

    describe("mapSortModelToSortItems", () => {
        it("should map attribute sort model to sort items", () => {
            const sortModel: SortModelItem[] = [
                {
                    colId: "attr1",
                    sort: "asc",
                },
                {
                    colId: "attr2",
                    sort: "desc",
                },
            ];

            const result = mapSortModelToSortItems(sortModel, mockRows, mockMeasures);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                attributeSortItem: {
                    attributeIdentifier: "attr1",
                    direction: "asc",
                },
            });
            expect(result[1]).toEqual({
                attributeSortItem: {
                    attributeIdentifier: "attr2",
                    direction: "desc",
                },
            });
        });

        it("should map measure sort model to sort items", () => {
            const sortModel: SortModelItem[] = [
                {
                    colId: "measure1",
                    sort: "asc",
                },
            ];

            const result = mapSortModelToSortItems(sortModel, mockRows, mockMeasures);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                measureSortItem: {
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "measure1",
                            },
                        },
                    ],
                    direction: "asc",
                },
            });
        });

        it("should return empty array for empty sort model", () => {
            const result = mapSortModelToSortItems([], mockRows, mockMeasures);
            expect(result).toHaveLength(0);
        });

        it("should filter out invalid sort items", () => {
            const sortModel: SortModelItem[] = [
                {
                    colId: "attr1",
                    sort: "asc",
                },
                {
                    colId: "invalid",
                    sort: "desc",
                },
                {
                    colId: "measure1",
                    sort: "asc",
                },
            ];

            const result = mapSortModelToSortItems(sortModel, mockRows, mockMeasures);

            expect(result).toHaveLength(2);

            const attributeSort = result.find(isAttributeSort);
            expect(attributeSort?.attributeSortItem.attributeIdentifier).toBe("attr1");

            const measureSort = result.find((item) => !isAttributeSort(item));
            expect(measureSort).toBeDefined();
            if (measureSort && !isAttributeSort(measureSort)) {
                const measureLocator = measureSort.measureSortItem.locators.find(isMeasureLocator);
                expect(measureLocator?.measureLocatorItem.measureIdentifier).toBe("measure1");
            }
        });
    });

    describe("mapSortItemsToSortModel", () => {
        it("should map attribute sort items to sort model", () => {
            const sortItems = [newAttributeSort("attr1", "asc"), newAttributeSort("attr2", "desc")];

            const result = mapSortItemsToSortModel(sortItems, mockRows, mockMeasures);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                colId: "attr1",
                sort: "asc",
            });
            expect(result[1]).toEqual({
                colId: "attr2",
                sort: "desc",
            });
        });

        it("should map measure sort items to sort model", () => {
            const sortItems = [newMeasureSort("measure1", "asc")];

            const result = mapSortItemsToSortModel(sortItems, mockRows, mockMeasures);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                colId: "measure1",
                sort: "asc",
            });
        });

        it("should return empty array for empty sort items", () => {
            const result = mapSortItemsToSortModel([], mockRows, mockMeasures);
            expect(result).toHaveLength(0);
        });

        it("should filter out sort items for non-existent columns", () => {
            const sortItems = [
                newAttributeSort("attr1", "asc"),
                newAttributeSort("nonexistent", "desc"),
                newMeasureSort("measure1", "asc"),
            ];

            const result = mapSortItemsToSortModel(sortItems, mockRows, mockMeasures);

            expect(result).toHaveLength(2);
            expect(result[0].colId).toBe("attr1");
            expect(result[1].colId).toBe("measure1");
        });
    });
});
