// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    noAttributesTwoMeasures,
    oneAttributeTwoMeasures,
    oneAttributeTwoMeasuresOneGroupInFirstAttribute,
    oneAttributeTwoMeasuresSameValuesDifferentURIs,
    twoAttributesTwoMeasuresEvenGroups,
    twoAttributesTwoMeasuresEvenGroupsFristPage,
    twoAttributesTwoMeasuresEvenGroupsSecondPage,
    twoAttributesTwoMeasuresUnEvenGroups,
} from "./GroupingProvider.fixtures.js";
import { GroupingProviderFactory, type IGroupingProvider } from "../rowGroupingProvider.js";

function expectBoundaries(groupingProvider: IGroupingProvider, expectedBoundaries: boolean[]) {
    const boundaries = new Array(expectedBoundaries.length)
        .fill(null)
        .reduce((acc, _, index) => acc.concat(groupingProvider.isGroupBoundary(index)), []);
    expect(boundaries).toEqual(expectedBoundaries);
}

function expectRepeats(groupingProvider: IGroupingProvider, columnId: string, expectedRepeats: boolean[]) {
    const repeats = new Array(expectedRepeats.length)
        .fill(null)
        .reduce((acc, _, index) => acc.concat(groupingProvider.isRepeatedValue(columnId, index)), []);
    expect(repeats).toEqual(expectedRepeats);
}

describe("DefaultGroupingProvider", () => {
    it("should not group at all", () => {
        const groupingProvider = GroupingProviderFactory.createProvider(false);

        groupingProvider.processPage(
            twoAttributesTwoMeasuresEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresEvenGroups.columnIds,
        );

        const falses = Array(twoAttributesTwoMeasuresEvenGroups.rowData.length).fill(false);
        const firstColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[0];
        const secondColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[1];
        expectBoundaries(groupingProvider, falses);
        expectRepeats(groupingProvider, firstColumnId, falses);
        expectRepeats(groupingProvider, secondColumnId, falses);
    });
});

describe("AttributeGroupingProvider", () => {
    function createAttributeGroupingProvider() {
        return GroupingProviderFactory.createProvider(true);
    }

    it("should not group items when there are no attributes", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(noAttributesTwoMeasures.rowData, 0, noAttributesTwoMeasures.columnIds);

        expectBoundaries(groupingProvider, [false, false, false, false]);
    });

    it("should group items by only by URI", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            oneAttributeTwoMeasuresSameValuesDifferentURIs.rowData,
            0,
            oneAttributeTwoMeasuresSameValuesDifferentURIs.columnIds,
        );

        expectBoundaries(groupingProvider, [false, false, false, false]);
    });

    it("should not group items if there are unique values in first column", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(oneAttributeTwoMeasures.rowData, 0, oneAttributeTwoMeasures.columnIds);

        expectBoundaries(groupingProvider, [false, false, false, false]);
    });

    it("should group all unique values if there is at least one group", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            oneAttributeTwoMeasuresOneGroupInFirstAttribute.rowData,
            0,
            oneAttributeTwoMeasuresOneGroupInFirstAttribute.columnIds,
        );

        const columnId = oneAttributeTwoMeasuresOneGroupInFirstAttribute.columnIds[0];
        expectBoundaries(groupingProvider, [true, false, false, true, true]);
        expectRepeats(groupingProvider, columnId, [false, true, true, false, false]);
    });

    it("should group correctly", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            twoAttributesTwoMeasuresEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresEvenGroups.columnIds,
        );

        const firstColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[0];
        const secondColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[1];
        expectBoundaries(groupingProvider, [
            true,
            false,
            false,
            true,
            false,
            false,
            true,
            false,
            false,
            true,
            false,
            false,
        ]);
        expectRepeats(groupingProvider, firstColumnId, [
            false,
            true,
            true,
            false,
            true,
            true,
            false,
            true,
            true,
            false,
            true,
            true,
        ]);
        expectRepeats(groupingProvider, secondColumnId, [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
        ]);
        expect(groupingProvider.isColumnWithGrouping(firstColumnId)).toBe(true);
        expect(groupingProvider.isColumnWithGrouping(secondColumnId)).toBe(false);
    });

    it("should end group on column if previous column group ends", () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            twoAttributesTwoMeasuresUnEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresUnEvenGroups.columnIds,
        );

        const firstColumnId = twoAttributesTwoMeasuresUnEvenGroups.columnIds[0];
        const secondColumnId = twoAttributesTwoMeasuresUnEvenGroups.columnIds[1];
        expect(groupingProvider.isGroupBoundary(3)).toEqual(true);
        expect(groupingProvider.isRepeatedValue(firstColumnId, 3)).toEqual(false);
        expect(groupingProvider.isRepeatedValue(secondColumnId, 3)).toEqual(false);
    });

    describe("paging", () => {
        const firstColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[0];
        const secondColumnId = twoAttributesTwoMeasuresEvenGroups.columnIds[1];

        describe("single page", () => {
            const groupingProvider = createAttributeGroupingProvider();

            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData,
                5,
                twoAttributesTwoMeasuresEvenGroupsFristPage.columnIds,
            );

            it("should return correct boundaries for the page and empty rows around it", () => {
                expectBoundaries(groupingProvider, [
                    true,
                    true,
                    true,
                    true,
                    true, // not defined data
                    true,
                    false,
                    false,
                    true,
                    false, // single data page
                    true,
                    true,
                    true,
                    true,
                    true, //  not defined data
                ]);
            });

            it("should return correct repetitions for the page and empty rows around it", () => {
                expectRepeats(groupingProvider, firstColumnId, [
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    false,
                    true,
                    true,
                    false,
                    true, // single data page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                ]);
                expectRepeats(groupingProvider, secondColumnId, [
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    false,
                    false,
                    false,
                    false,
                    false, // single data page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                ]);
            });
        });

        describe("two pages with undefined rows in between", () => {
            const groupingProvider = createAttributeGroupingProvider();

            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData,
                5,
                twoAttributesTwoMeasuresEvenGroupsFristPage.columnIds,
            );
            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsSecondPage.rowData,
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData.length + 10,
                twoAttributesTwoMeasuresEvenGroupsSecondPage.columnIds,
            );

            it("should return correct boundaries for the page and empty rows around it", () => {
                expectBoundaries(groupingProvider, [
                    true,
                    true,
                    true,
                    true,
                    true, // not defined data
                    true,
                    false,
                    false,
                    true,
                    false, // first page
                    true,
                    true,
                    true,
                    true,
                    true, // not defined data
                    false,
                    true,
                    false,
                    false,
                    true,
                    false,
                    false, // second page
                    true,
                    true,
                    true,
                    true,
                    true, //  not defined data
                ]);
            });

            it("should return correct repetitions for the page and empty rows around it", () => {
                expectRepeats(groupingProvider, firstColumnId, [
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    false,
                    true,
                    true,
                    false,
                    true, // first page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    true,
                    false,
                    true,
                    true,
                    false,
                    true,
                    true, // second page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                ]);
                expectRepeats(groupingProvider, secondColumnId, [
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    false,
                    false,
                    false,
                    false,
                    false, // first page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false, // second page
                    false,
                    false,
                    false,
                    false,
                    false, // not defined data
                ]);
            });
        });
    });
});
