// (C) 2020-2021 GoodData Corporation

import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import {
    IBucketFilter,
    IBucketFilterElement,
    IBucketItem,
    IExtendedReferencePoint,
} from "../../../../interfaces/Visualization";
import { IMeasureSortItem, ISortItem, SortDirection, uriRef } from "@gooddata/sdk-model";
import {
    adaptReferencePointSortItemsToPivotTable,
    addDefaultSort,
    isSortItemVisible,
} from "../sortItemsHelpers";
import {
    invalidAttributeSort,
    invalidMeasureSortInvalidAttribute,
    invalidMeasureSortInvalidMeasure,
    invalidMeasureSortLocatorsTooShort,
    invalidMeasureSortTooManyLocators,
    validAttributeSort,
    validMeasureSort,
} from "./sortMocks";
import { getMockReferencePoint } from "./mockReferencePoint";

describe("adaptReferencePointSortItemsToPivotTable", () => {
    const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;
    const mockPivotTableReferencePoint: IExtendedReferencePoint = getMockReferencePoint(
        sourceReferencePoint.buckets[0].items,
        sourceReferencePoint.buckets[1].items,
        sourceReferencePoint.buckets[2].items,
        [],
        [],
        true,
    );

    const sourceSortItems: ISortItem[] = [
        invalidAttributeSort,
        invalidMeasureSortInvalidMeasure,
        invalidMeasureSortInvalidAttribute,
        invalidMeasureSortLocatorsTooShort,
        invalidMeasureSortTooManyLocators,
        validAttributeSort,
        validMeasureSort,
    ];

    const measures: IBucketItem[] = mockPivotTableReferencePoint.buckets[0].items;
    const rowAttributes: IBucketItem[] = mockPivotTableReferencePoint.buckets[1].items;
    const columnAttributes: IBucketItem[] = mockPivotTableReferencePoint.buckets[2].items;

    it("should remove invalid sort items", async () => {
        const expectedSortItems: ISortItem[] = [validAttributeSort, validMeasureSort];

        expect(
            adaptReferencePointSortItemsToPivotTable(
                sourceSortItems,
                measures,
                rowAttributes,
                columnAttributes,
            ),
        ).toEqual(expectedSortItems);
    });
});

describe("addDefaultSort", () => {
    const rowFor = (localIdentifier: string, attributeName: string): IBucketItem => ({
        aggregation: null,
        showInPercent: null,
        operator: null,
        operandLocalIdentifiers: null,
        granularity: null,
        masterLocalIdentifier: null,
        localIdentifier,
        showOnSecondaryAxis: null,
        type: "attribute",
        filters: [],
        attribute: attributeName,
    });

    const accountRowId = "d0f1043a2eec42daac004a10c41afdd5";
    const accountRow = rowFor(accountRowId, "attr.account");

    const countryRowId = "6d523113ca754409a8b685736e7fe32b";
    const countryRow = rowFor(countryRowId, "attr.country");

    const productRowId = "38f1d87b8b7c42c1b9a37395a24f7313";
    const productRow = rowFor(productRowId, "attr.product");

    const sortFor = (localId: string, direction: SortDirection): ISortItem => ({
        attributeSortItem: {
            attributeIdentifier: localId,
            direction,
        },
    });

    const defaultSortFor = (localId: string): ISortItem => sortFor(localId, "asc");

    describe("with no filters specified", () => {
        it("should not add the default sort if no row is specified", () => {
            const expected: ISortItem[] = [];
            const actual = addDefaultSort([], [], [], []);
            expect(actual).toEqual(expected);
        });
        it("should add the default sort for the first row added", () => {
            const expected = [defaultSortFor(accountRowId)];
            const actual = addDefaultSort([], [], [accountRow], []);
            expect(actual).toEqual(expected);
        });
        it("should add the default sort when a row is added to the first place", () => {
            const expected = [defaultSortFor(accountRowId)];
            const actual = addDefaultSort(
                [defaultSortFor(countryRowId)],
                [],
                [accountRow, countryRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change the default sort when a row is added to the second place", () => {
            const expected = [defaultSortFor(countryRowId)];
            const actual = addDefaultSort(
                [defaultSortFor(countryRowId)],
                [],
                [countryRow, accountRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a desc sort on the first item", () => {
            const expected = [sortFor(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "desc")],
                [],
                [countryRow, accountRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a desc sort on the second item", () => {
            const expected = [sortFor(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "desc")],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is an asc sort on the second item", () => {
            const expected = [sortFor(countryRowId, "asc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "asc")],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a measure sort", () => {
            const measureSort: IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [],
                },
            };
            const expected = [measureSort];
            const actual = addDefaultSort(
                [measureSort],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
    });

    it("should add default sort if existing measure sort is not visible due to filters (RAIL-1275)", () => {
        const expected = [sortFor(accountRowId, "asc")];
        const uri = "/gdc/md/mockproject/obj/attr.country/elements?id=1";
        const measureSort: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "attr.country",
                            element: uri,
                        },
                    },
                ],
            },
        };
        const filterElement: IBucketFilterElement = {
            title: "Matching",
            uri,
        };
        const actual = addDefaultSort(
            [measureSort],
            [
                {
                    attribute: "irrelevant",
                    displayFormRef: uriRef("irrelevant/attribute/df/uri"),
                    isInverted: true,
                    selectedElements: [filterElement],
                    totalElementsCount: 4,
                },
            ],
            [accountRow, countryRow, productRow],
            [accountRow, countryRow],
        );
        expect(actual).toEqual(expected);
    });
});

describe("isSortItemVisible", () => {
    describe("given attribute sort item", () => {
        it("should always return true", () => {
            const actual = isSortItemVisible(
                {
                    attributeSortItem: {
                        attributeIdentifier: "foo",
                        direction: "asc",
                    },
                },
                [],
            );
            const expected = true;
            expect(actual).toEqual(expected);
        });
    });

    describe("given measure sort item", () => {
        const createFilterBucketItem = (
            selectedElements: IBucketFilterElement[],
            isInverted: boolean,
        ): IBucketFilter => ({
            attribute: "irrelevant",
            displayFormRef: uriRef("irrelevant/attribute/df/uri"),
            isInverted,
            totalElementsCount: 5,
            selectedElements,
        });

        const matchingUri = "/gdc/md/mockproject/obj/attr.movie_genre/elements?id=1";
        const notMatchingUri = "/gdc/md/mockproject/obj/attr.movie_genre/elements?id=123";
        const sortItem: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "foo",
                            element: matchingUri,
                        },
                    },
                    {
                        measureLocatorItem: {
                            measureIdentifier: "bar",
                        },
                    },
                ],
            },
        };
        const matchingFilterElement: IBucketFilterElement = {
            title: "Matching",
            uri: matchingUri,
        };
        const notMatchingFilterElement: IBucketFilterElement = {
            title: "Not Matching",
            uri: notMatchingUri,
        };
        const measureValueFilter: IBucketFilter = {
            measureLocalIdentifier: "id",
            condition: {
                range: {
                    operator: "BETWEEN",
                    from: 0,
                    to: 0,
                },
            },
        };

        it("should return true when no filters are specified", () => {
            const actual = isSortItemVisible(sortItem, []);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return true when empty "notIn" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], true)]);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return false when "notIn" filter with matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([matchingFilterElement], true),
            ]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
        it('should return true when "notIn" filter without matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([notMatchingFilterElement], true),
            ]);
            const expected = true;
            expect(actual).toEqual(expected);
        });

        it('should return false when empty "in" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], false)]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
        it('should return true when "in" filter with matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([matchingFilterElement], false),
            ]);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return false when "in" filter without matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([notMatchingFilterElement], false),
            ]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
        it("should return true when filter is MVF", () => {
            const actual = isSortItemVisible(sortItem, [measureValueFilter]);
            expect(actual).toEqual(true);
        });
    });
});
