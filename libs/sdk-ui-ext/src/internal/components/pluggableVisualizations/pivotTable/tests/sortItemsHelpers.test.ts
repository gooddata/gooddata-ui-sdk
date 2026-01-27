// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IMeasureSortItem, type ISortItem, type SortDirection, uriRef } from "@gooddata/sdk-model";

import { getMockReferencePoint } from "./mockReferencePoint.js";
import {
    invalidAttributeSort,
    invalidMeasureSortInvalidAttribute,
    invalidMeasureSortInvalidMeasure,
    invalidMeasureSortLocatorsTooShort,
    invalidMeasureSortTooManyLocators,
    validAttributeSort,
    validMeasureSort,
} from "./sortMocks.js";
import {
    type IBucketFilter,
    type IBucketFilterElement,
    type IBucketItem,
    type IExtendedReferencePoint,
} from "../../../../interfaces/Visualization.js";
import { simpleStackedReferencePoint } from "../../../../tests/mocks/referencePointMocks.js";
import {
    adaptReferencePointSortItemsToPivotTable,
    addDefaultSort,
    isSortItemVisible,
} from "../sortItemsHelpers.js";

const createAttributeBucketItem = (localIdentifier: string, attributeName: string): IBucketItem => ({
    aggregation: null as unknown as undefined,
    showInPercent: null as unknown as undefined,
    operator: null as unknown as undefined,
    operandLocalIdentifiers: null as unknown as undefined,
    granularity: null as unknown as undefined,
    masterLocalIdentifier: null as unknown as undefined,
    localIdentifier,
    showOnSecondaryAxis: null as unknown as undefined,
    type: "attribute",
    filters: [],
    attribute: attributeName,
    dfRef: uriRef(`${attributeName}/df`),
});

const accountRowId = "d0f1043a2eec42daac004a10c41afdd5";
const accountRow = createAttributeBucketItem(accountRowId, "attr.account");

const countryRowId = "6d523113ca754409a8b685736e7fe32b";
const countryRow = createAttributeBucketItem(countryRowId, "attr.country");

const productRowId = "38f1d87b8b7c42c1b9a37395a24f7313";
const productRow = createAttributeBucketItem(productRowId, "attr.product");

const departmentColumnId = "93n48x63mn8c73nhd83jhd83jd83";
const departmentColumn = createAttributeBucketItem(departmentColumnId, "attr.department");

const countryColumnId = "9w9j3k4jh6k36kj6h5k7h4k3h8990k9j";
const countryColumn = createAttributeBucketItem(countryColumnId, "attr.country");
const germanyElement1Uri = "/attr.country/elements?id=1";
const polandElement2Uri = "/attr.country/elements?id=2";

describe("adaptReferencePointSortItemsToPivotTable", () => {
    const sourceReferencePoint = simpleStackedReferencePoint;
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

    it("should remove invalid sort items", () => {
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
    const sortForAttribute = (attributeLocalIdentifier: string, direction: SortDirection): ISortItem => ({
        attributeSortItem: {
            attributeIdentifier: attributeLocalIdentifier,
            direction,
        },
    });

    const defaultSortFor = (localId: string): ISortItem => sortForAttribute(localId, "asc");

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
            const expected = [sortForAttribute(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortForAttribute(countryRowId, "desc")],
                [],
                [countryRow, accountRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a desc sort on the second item", () => {
            const expected = [sortForAttribute(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortForAttribute(countryRowId, "desc")],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is an asc sort on the second item", () => {
            const expected = [sortForAttribute(countryRowId, "asc")];
            const actual = addDefaultSort(
                [sortForAttribute(countryRowId, "asc")],
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

    describe("with filters specified", () => {
        const measureSort: IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: countryColumnId,
                            element: germanyElement1Uri,
                        },
                    },
                ],
            },
        };

        const allCountriesExceptGermanyFilter: IBucketFilter = {
            attribute: countryColumn.attribute!,
            displayFormRef: countryColumn.dfRef!,
            isInverted: true,
            selectedElements: [
                {
                    title: "Germany",
                    uri: germanyElement1Uri,
                },
            ],
            totalElementsCount: 4,
        };

        const onlyPolandFilter: IBucketFilter = {
            attribute: countryColumn.attribute!,
            displayFormRef: countryColumn.dfRef!,
            isInverted: false,
            selectedElements: [
                {
                    title: "Poland",
                    uri: polandElement2Uri,
                },
            ],
            totalElementsCount: 4,
        };

        it("should add default sort if existing measure sort is not visible due to negative filter", () => {
            const actual = addDefaultSort(
                [measureSort],
                [allCountriesExceptGermanyFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [countryColumn],
            );
            expect(actual).toEqual([sortForAttribute(accountRowId, "asc")]);
        });

        it("should add default sort if existing measure sort is not visible due to positive filter", () => {
            const actual = addDefaultSort(
                [measureSort],
                [onlyPolandFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [countryColumn],
            );
            expect(actual).toEqual([sortForAttribute(accountRowId, "asc")]);
        });

        it("should add default sort if filter is unrelated with the column attribute and tableSortingCheckDisabled is true", () => {
            const actual = addDefaultSort(
                [measureSort],
                [allCountriesExceptGermanyFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [
                    {
                        localIdentifier: "another_attribute_local_identifier",
                        dfRef: uriRef("another/attribute/df/uri"),
                    },
                ],
                true,
            );
            expect(actual).toEqual([measureSort]);
        });

        it("should add default sort if there is no attribute in the column bucket and tableSortingCheckDisabled is true", () => {
            const actual = addDefaultSort(
                [measureSort],
                [allCountriesExceptGermanyFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [],
                true,
            );
            expect(actual).toEqual([measureSort]);
        });

        it("should not add default sort if filter is unrelated with the column attribute and tableSortingCheckDisabled is false", () => {
            const actual = addDefaultSort(
                [measureSort],
                [allCountriesExceptGermanyFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [
                    {
                        localIdentifier: "another_attribute_local_identifier",
                        dfRef: uriRef("another/attribute/df/uri"),
                    },
                ],
                false,
            );
            expect(actual).toEqual([sortForAttribute(accountRowId, "asc")]);
        });

        it("should not add default sort if there is no attribute in the column bucket and tableSortingCheckDisabled is false", () => {
            const actual = addDefaultSort(
                [measureSort],
                [allCountriesExceptGermanyFilter],
                [accountRow, departmentColumn, productRow],
                [accountRow, departmentColumn],
                [],
                false,
            );
            expect(actual).toEqual([sortForAttribute(accountRowId, "asc")]);
        });
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
            attribute: countryColumn.attribute!,
            displayFormRef: countryColumn.dfRef!,
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
                            attributeIdentifier: countryColumnId,
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
            const actual = isSortItemVisible(sortItem, [], [countryColumn]);

            expect(actual).toBe(true);
        });

        it('should return true when empty "notIn" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], true)], [countryColumn]);

            expect(actual).toBe(true);
        });

        it('should return false when "notIn" filter with matching element is specified', () => {
            const actual = isSortItemVisible(
                sortItem,
                [createFilterBucketItem([matchingFilterElement], true)],
                [countryColumn],
            );

            expect(actual).toBe(false);
        });

        it('should return true when "notIn" filter with matching element is specified but the attribute is not in columns and tableSortingCheckDisabled is true', () => {
            const actual = isSortItemVisible(
                sortItem,
                [createFilterBucketItem([matchingFilterElement], true)],
                [departmentColumn],
                true,
            );

            expect(actual).toBe(true);
        });

        it('should return false when "notIn" filter with matching element is specified but the attribute is not in columns and tableSortingCheckDisabled is false', () => {
            const actual = isSortItemVisible(
                sortItem,
                [createFilterBucketItem([matchingFilterElement], true)],
                [departmentColumn],
                false,
            );

            expect(actual).toBe(false);
        });

        it('should return true when "notIn" filter without matching element is specified', () => {
            const actual = isSortItemVisible(
                sortItem,
                [createFilterBucketItem([notMatchingFilterElement], true)],
                [countryColumn],
            );

            expect(actual).toBe(true);
        });

        it('should return false when empty "in" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], false)], [countryColumn]);

            expect(actual).toBe(false);
        });

        it('should return true when "in" filter with matching element is specified', () => {
            const actual = isSortItemVisible(
                sortItem,
                [createFilterBucketItem([matchingFilterElement], false)],
                [countryColumn],
            );

            expect(actual).toBe(true);
        });

        it("should return true when filter is MVF", () => {
            const actual = isSortItemVisible(sortItem, [measureValueFilter], [countryColumn]);

            expect(actual).toBe(true);
        });
    });
});
