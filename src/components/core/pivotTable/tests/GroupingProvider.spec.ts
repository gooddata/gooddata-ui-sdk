// (C) 2007-2019 GoodData Corporation
import { GroupingProviderFactory, IGroupingProvider } from '../GroupingProvider';
import {
    oneAttributeTwoMeasures,
    oneAttributeTwoMeasuresSameValuesDifferentURIs,
    oneAttributeTwoMeasuresOneGroupInFirstAttribute,
    twoAttributesTwoMeasuresUnEvenGroups,
    twoAttributesTwoMeasuresEvenGroups,
    twoAttributesTwoMeasuresEvenGroupsFristPage,
    twoAttributesTwoMeasuresEvenGroupsSecondPage
} from './GroupingProvider.mock';

function expectBoundaries(groupingProvider: IGroupingProvider, expectedBoundaries: boolean[]) {
    const boundaries = new Array(expectedBoundaries.length).fill(null)
        .reduce((acc, _, index) => acc.concat(groupingProvider.isGroupBoundary(index)), []);
    expect(boundaries).toEqual(expectedBoundaries);
}

function expectRepeats(groupingProvider: IGroupingProvider, attributeId: string, expectedRepeats: boolean[]) {
    const repeats = new Array(expectedRepeats.length).fill(null)
        .reduce((acc, _, index) => acc.concat(groupingProvider.isRepeated(attributeId, index)), []);
    expect(repeats).toEqual(expectedRepeats);
}

describe('DefaultGroupingProvider', () => {
    it('should not group at all', () => {
        const groupingProvider = GroupingProviderFactory.createProvider(false);

        groupingProvider.processPage(
            twoAttributesTwoMeasuresEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs
        );

        const falses = Array(twoAttributesTwoMeasuresEvenGroups.rowData.length).fill(false);
        const firstAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[0];
        const secondAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[1];
        expectBoundaries(groupingProvider, falses);
        expectRepeats(groupingProvider, firstAttributeID, falses);
        expectRepeats(groupingProvider, secondAttributeID, falses);
    });
});

describe('AttributeGroupingProvider', () => {
    function createAttributeGroupingProvider() {
        return GroupingProviderFactory.createProvider(true);
    }

    it('should group items by only by URI', () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            oneAttributeTwoMeasuresSameValuesDifferentURIs.rowData,
            0,
            oneAttributeTwoMeasuresSameValuesDifferentURIs.rowAttributeIDs
        );

        expectBoundaries(groupingProvider, [false, false, false, false]);
    });

    it('should not group items if there are unique values in first column', () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            oneAttributeTwoMeasures.rowData,
            0,
            oneAttributeTwoMeasures.rowAttributeIDs
        );

        expectBoundaries(groupingProvider, [false, false, false, false]);
    });

    it('should group all unique values if there is at least one group', () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            oneAttributeTwoMeasuresOneGroupInFirstAttribute.rowData,
            0,
            oneAttributeTwoMeasuresOneGroupInFirstAttribute.rowAttributeIDs
        );

        const attributeID = oneAttributeTwoMeasuresOneGroupInFirstAttribute.rowAttributeIDs[0];
        expectBoundaries(groupingProvider, [true, false, false, true, true]);
        expectRepeats(groupingProvider, attributeID, [false, true, true, false, false]);
    });

    it('should group correctly', () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            twoAttributesTwoMeasuresEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs
        );

        const firstAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[0];
        const secondAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[1];
        expectBoundaries(
            groupingProvider,
            [true, false, false, true, false, false, true, false, false, true, false, false]
        );
        expectRepeats(
            groupingProvider,
            firstAttributeID,
            [false, true, true, false, true, true, false, true, true, false, true, true]
        );
        expectRepeats(
            groupingProvider,
            secondAttributeID,
            [false, false, false, false, false, false, false, false, false, false, false, false]
        );
    });

    it('should end group on column if previous column group ends', () => {
        const groupingProvider = createAttributeGroupingProvider();

        groupingProvider.processPage(
            twoAttributesTwoMeasuresUnEvenGroups.rowData,
            0,
            twoAttributesTwoMeasuresUnEvenGroups.rowAttributeIDs
        );

        const firstAttributeID = twoAttributesTwoMeasuresUnEvenGroups.rowAttributeIDs[0];
        const secondAttributeID = twoAttributesTwoMeasuresUnEvenGroups.rowAttributeIDs[1];
        expect(groupingProvider.isGroupBoundary(3)).toEqual(true);
        expect(groupingProvider.isRepeated(firstAttributeID, 3)).toEqual(false);
        expect(groupingProvider.isRepeated(secondAttributeID, 3)).toEqual(false);
    });

    describe('paging', () => {
        const firstAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[0];
        const secondAttributeID = twoAttributesTwoMeasuresEvenGroups.rowAttributeIDs[1];

        describe('single page', () => {
            const groupingProvider = createAttributeGroupingProvider();

            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData,
                5,
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowAttributeIDs
            );

            it('should return correct boundaries for the page and empty rows around it', () => {
                expectBoundaries(groupingProvider, [
                    true, true, true, true, true, // not defined data
                    true, false, false, true, false, // single data page
                    true, true, true, true, true //  not defined data
                ]);
            });

            it('should return correct repetitions for the page and empty rows around it', () => {
                expectRepeats(groupingProvider, firstAttributeID, [
                    false, false, false, false, false, // not defined data
                    false, true, true, false, true, // single data page
                    false, false, false, false, false // not defined data
                ]);
                expectRepeats(groupingProvider, secondAttributeID, [
                    false, false, false, false, false, // not defined data
                    false, false, false, false, false, // single data page
                    false, false, false, false, false // not defined data
                ]);
            });
        });

        describe('two pages with undefined rows in between', () => {
            const groupingProvider = createAttributeGroupingProvider();

            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData,
                5,
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowAttributeIDs
            );
            groupingProvider.processPage(
                twoAttributesTwoMeasuresEvenGroupsSecondPage.rowData,
                twoAttributesTwoMeasuresEvenGroupsFristPage.rowData.length + 10,
                twoAttributesTwoMeasuresEvenGroupsSecondPage.rowAttributeIDs
            );

            it('should return correct boundaries for the page and empty rows around it', () => {
                expectBoundaries(groupingProvider, [
                    true, true, true, true, true, // not defined data
                    true, false, false, true, false, // first page
                    true, true, true, true, true, // not defined data
                    false, true, false, false, true, false, false, // second page
                    true, true, true, true, true //  not defined data
                ]);
            });

            it('should return correct repetitions for the page and empty rows around it', () => {
                expectRepeats(groupingProvider, firstAttributeID, [
                    false, false, false, false, false, // not defined data
                    false, true, true, false, true, // first page
                    false, false, false, false, false, // not defined data
                    true, false, true, true, false, true, true, // second page
                    false, false, false, false, false // not defined data
                ]);
                expectRepeats(groupingProvider, secondAttributeID, [
                    false, false, false, false, false, // not defined data
                    false, false, false, false, false, // first page
                    false, false, false, false, false, // not defined data
                    false, false, false, false, false, false, false, // second page
                    false, false, false, false, false // not defined data
                ]);
            });
        });
    });
});
