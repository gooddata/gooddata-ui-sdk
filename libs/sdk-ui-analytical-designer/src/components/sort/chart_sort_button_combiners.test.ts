// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { newAttributeSort } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

import { buildBucketItemMock } from "../../tests/bucket_item.test.helpers.js";
import {
    areaSortAsc1,
    areaSortAsc2,
    areaSortDesc1,
    areaSortDesc2,
    attributeSortAsc1,
    attributeSortAsc2,
    attributeSortDesc1,
    attributeSortDesc2,
    buildSortConfig,
    buildSupportedSortConfig,
    chronoDateSortAsc1,
    chronoDateSortAsc2,
    chronoDateSortDesc1,
    chronoDateSortDesc2,
    disabledSortConfig,
    genericDateSortAsc1,
    genericDateSortAsc2,
    genericDateSortDesc1,
    genericDateSortDesc2,
    measureSortAsc1,
    measureSortAsc2,
    measureSortConfig,
    measureSortDesc1,
    measureSortDesc2,
} from "../../tests/chart_sort.test.helpers.js";
import { type IDecoratedBucketItems } from "../../typings/buckets.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";

import { sortButtonCurrentSortTypeCombiner } from "./chart_sort_button_combiners.js";
import { type CurrentSortType } from "./types.js";

describe("chart sort button combiners", () => {
    describe("sortButtonCurrentSortTypeCombiner", () => {
        const bucketItems: IDecoratedBucketItems = [
            buildBucketItemMock({
                localIdentifier: "attr1",
                attribute: "attr1_attr",
            }),
            buildBucketItemMock({
                localIdentifier: "attr2",
                attribute: "attr2_attr",
            }),
            buildBucketItemMock({
                localIdentifier: "area1",
                attribute: "area1_attr",
            }),
            buildBucketItemMock({
                localIdentifier: "area2",
                attribute: "area2_attr",
            }),
            buildBucketItemMock({
                localIdentifier: "m1",
                attribute: "m1_measure",
            }),
            buildBucketItemMock({
                localIdentifier: "m2",
                attribute: "m2_measure",
            }),
            {
                localIdentifier: "cd1",
                attribute: "cd1_attr",
                granularity: {
                    dateType: "GDC.time.date",
                },
            },
            {
                localIdentifier: "cd2",
                attribute: "cd2_attr",
                granularity: {
                    dateType: "GDC.time.year",
                },
            },
            {
                localIdentifier: "gd1",
                attribute: "gd1_attr",
                granularity: {
                    dateType: "GDC.time.day_in_week",
                },
            },
            {
                localIdentifier: "gd2",
                attribute: "gd2_attr",
                granularity: {
                    dateType: "GDC.time.day_in_week",
                },
            },
        ] as unknown as IDecoratedBucketItems;
        const itemCache: ICatalogEntries = {
            attr1_attr: {},
            attr2_attr: {},
            area1_attr: {},
            area2_attr: {},
            m1_measure: {},
            m2_measure: {},
            cd1_attr: {
                dateType: "GDC.time.date",
            },
            cd2_attr: {
                dateType: "GDC.time.year",
            },
            gd1_attr: {
                dateType: "GDC.time.day_in_week",
            },
            gd2_attr: {
                dateType: "GDC.time.month_in_year",
            },
        };

        it.each<[CurrentSortType, string, ISortConfig]>([
            ["DISABLED", "disabled sort", disabledSortConfig],
            ["DISABLED", "no current sort", buildSupportedSortConfig()],
            ["DATE_ASC", "one chrono date, asc", buildSupportedSortConfig([chronoDateSortAsc1])],
            [
                "DATE_ASC",
                "two chrono date, asc",
                buildSupportedSortConfig([chronoDateSortAsc1, chronoDateSortAsc2]),
            ],
            ["DATE_DESC", "one chrono date, desc", buildSupportedSortConfig([chronoDateSortDesc1])],
            [
                "DATE_DESC",
                "two chrono date, desc",
                buildSupportedSortConfig([chronoDateSortDesc1, chronoDateSortDesc2]),
            ],
            [
                "MIXED",
                "two chrono date, asc, desc",
                buildSupportedSortConfig([chronoDateSortAsc1, chronoDateSortDesc1]),
            ],

            ["DEFAULT", "one generic date, asc", buildSupportedSortConfig([genericDateSortAsc1])],
            [
                "DEFAULT",
                "two generic date, asc",
                buildSupportedSortConfig([genericDateSortAsc1, genericDateSortAsc2]),
            ],
            ["DEFAULT", "one generic date, desc", buildSupportedSortConfig([genericDateSortDesc1])],
            [
                "DEFAULT",
                "two generic date, desc",
                buildSupportedSortConfig([genericDateSortDesc1, genericDateSortDesc2]),
            ],
            [
                "DEFAULT",
                "two generic date, asc, desc",
                buildSupportedSortConfig([genericDateSortAsc1, genericDateSortDesc1]),
            ],

            ["NUMERICAL_ASC", "one area, asc", buildSupportedSortConfig([areaSortAsc1])],
            ["NUMERICAL_ASC", "two area, asc", buildSupportedSortConfig([areaSortAsc1, areaSortAsc2])],
            ["NUMERICAL_DESC", "one area, desc", buildSupportedSortConfig([areaSortDesc1])],
            ["NUMERICAL_DESC", "two area, desc", buildSupportedSortConfig([areaSortDesc1, areaSortDesc2])],
            ["MIXED", "two area, asc, desc", buildSupportedSortConfig([areaSortAsc1, areaSortDesc1])],

            ["ALPHABETICAL_ASC", "one attr, asc", buildSupportedSortConfig([attributeSortAsc1])],
            [
                "ALPHABETICAL_ASC",
                "two attr, asc",
                buildSupportedSortConfig([attributeSortAsc1, attributeSortAsc2]),
            ],
            ["ALPHABETICAL_DESC", "one attr, desc", buildSupportedSortConfig([attributeSortDesc1])],
            [
                "ALPHABETICAL_DESC",
                "two attr, desc",
                buildSupportedSortConfig([attributeSortDesc1, attributeSortDesc2]),
            ],
            [
                "MIXED",
                "two attr, asc, desc",
                buildSupportedSortConfig([attributeSortAsc1, attributeSortDesc1]),
            ],

            ["NUMERICAL_ASC", "one measure, asc", buildSupportedSortConfig([measureSortAsc1])],
            [
                "NUMERICAL_ASC",
                "two measure, asc",
                buildSupportedSortConfig([measureSortAsc1, measureSortAsc2]),
            ],
            ["NUMERICAL_DESC", "one measure, desc", buildSupportedSortConfig([measureSortDesc1])],
            [
                "NUMERICAL_DESC",
                "two measure, desc",
                buildSupportedSortConfig([measureSortDesc1, measureSortDesc2]),
            ],
            [
                "MIXED",
                "two measure, asc, desc",
                buildSupportedSortConfig([measureSortAsc1, measureSortDesc1]),
            ],

            [
                "MIXED",
                "one attr, one measure, asc",
                buildSupportedSortConfig([attributeSortAsc1, measureSortAsc1]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, asc",
                buildSupportedSortConfig([attributeSortAsc1, measureSortAsc1, chronoDateSortAsc1]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, one generic date, asc",
                buildSupportedSortConfig([
                    attributeSortAsc1,
                    measureSortAsc1,
                    chronoDateSortAsc1,
                    genericDateSortAsc1,
                ]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, one generic date, one area, asc",
                buildSupportedSortConfig([
                    attributeSortAsc1,
                    measureSortAsc1,
                    chronoDateSortAsc1,
                    genericDateSortAsc1,
                    areaSortAsc1,
                ]),
            ],

            [
                "MIXED",
                "one attr, one measure, desc",
                buildSupportedSortConfig([attributeSortDesc1, measureSortDesc1]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, desc",
                buildSupportedSortConfig([attributeSortDesc1, measureSortDesc1, chronoDateSortDesc1]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, one generic date, desc",
                buildSupportedSortConfig([
                    attributeSortDesc1,
                    measureSortDesc1,
                    chronoDateSortDesc1,
                    genericDateSortDesc1,
                ]),
            ],
            [
                "MIXED",
                "one attr, one measure, one chrono date, one generic date, one area, desc",
                buildSupportedSortConfig([
                    attributeSortDesc1,
                    measureSortDesc1,
                    chronoDateSortDesc1,
                    genericDateSortDesc1,
                    areaSortDesc1,
                ]),
            ],
            [
                "MIXED",
                "one attr, one chrono date",
                buildSupportedSortConfig([attributeSortAsc1, chronoDateSortAsc1]),
            ],
            [
                "MIXED",
                "one attr, one generic date",
                buildSupportedSortConfig([attributeSortAsc1, genericDateSortAsc1]),
            ],
            [
                "MIXED",
                "one attr, one chrono date, one generic date",
                buildSupportedSortConfig([attributeSortAsc1, chronoDateSortAsc1, genericDateSortAsc1]),
            ],
            [
                "MIXED",
                "one chrono date, one generic date",
                buildSupportedSortConfig([chronoDateSortAsc1, genericDateSortAsc1]),
            ],
            [
                "NUMERICAL_ASC",
                "one area asc, one measure asc",
                buildSupportedSortConfig([areaSortAsc1, measureSortAsc1]),
            ],
            [
                "NUMERICAL_DESC",
                "one area desc, one measure desc",
                buildSupportedSortConfig([areaSortDesc1, measureSortDesc1]),
            ],
            [
                "MIXED",
                "one area desc, one measure asc",
                buildSupportedSortConfig([areaSortDesc1, measureSortAsc1]),
            ],
            ["MIXED", "one attr, one area", buildSupportedSortConfig([areaSortDesc1, attributeSortDesc1])],
        ])(
            "should return expected current sort type `%s` for %s when provided as sort config",
            (expectedType, _sortDescription, sortConfig) => {
                const value = sortButtonCurrentSortTypeCombiner(sortConfig, [], bucketItems, itemCache);
                expect(value).toEqual(expectedType);
            },
        );

        it("should return expected current sort when applied sort is provided as it takes precedent over sort config", () => {
            const value = sortButtonCurrentSortTypeCombiner(
                measureSortConfig,
                [areaSortDesc1, measureSortAsc1],
                bucketItems,
                itemCache,
            );
            expect(value).toEqual("MIXED");
        });

        it("should not fail when attribute sort reference invalid bucket item (sort will be considered as an attribute)", () => {
            const invalidSort = buildSortConfig(true, false, [newAttributeSort("invalid")]);
            const value = sortButtonCurrentSortTypeCombiner(invalidSort, [], bucketItems, itemCache);
            expect(value).toEqual("ALPHABETICAL_ASC");
        });
    });
});
