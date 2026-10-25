// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { type TextModeFilterData } from "../store/filter_bar/filter_bar_types.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type ICatalogEntries } from "../typings/state_objects.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { type IDateDatasetsMetaItem } from "./date_datasets_meta_item.js";
import { type IDecoratedAttributeElement } from "./decorated_attribute_elements.js";
import {
    DecoratedMetricAttributeFilter,
    type IDecoratedMetricAttributeFilter,
    buildFilterSelection,
    createDecoratedMetricAttributeFilter,
    getSelectionTitle,
    metricAttributeFilter,
} from "./decorated_metric_attribute_filter.js";

describe("Metric Attribute Filter", () => {
    let filter: IBucketItemMetricFilter;
    let decorated: IDecoratedMetricAttributeFilter;
    const intl = mockIntlProp();

    const itemCache: ICatalogEntries = {
        "attribute.attr.account_details.retail_company": {
            dateType: undefined,
            dfIdentifier: "label.account_details.retail_company",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15366",
            dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/15125",
            elementsUri: "/gdc/md/TeamOneGoodSales1/obj/15366/elements",
            granularity: "attr.account_details.retail_company",
            id: "attr.account_details.retail_company",
            identifier: "attr.account_details.retail_company",
            isAvailable: true,
            summary: "",
            title: "Account ID",
            type: "attribute",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15365",
        },
        "fact.fact.spend_analysis.cart_additions": {
            id: "fact.spend_analysis.cart_additions",
            identifier: "fact.spend_analysis.cart_additions",
            isAvailable: true,
            summary: "",
            title: "Cart Additions",
            type: "fact",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
            ref: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
            },
        },
        "attribute.aaeFKXFYiCc0": {
            expression: "SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])",
            format: "[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0",
            id: "aaeFKXFYiCc0",
            identifier: "aaeFKXFYiCc0",
            isAvailable: true,
            summary: "",
            title: "Awareness",
            type: "metric",
            uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
            ref: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
            },
        },
    };

    const elements = [
        { uri: "/1?id=1", title: "1 element 1" },
        { uri: "/2?id=2", title: "2 element 2" },
        { uri: "/3?id=3", title: "3 element 3" },
        // a'la backend sorting 40 before 4<space>
        { uri: "/4?id=4", title: "40element 4" },
        { uri: "/5?id=5", title: "4 element 5" },
    ];

    const unavailableElement = {
        uri: "/6?id=666",
        available: false,
    };

    function getDecorated(
        _filter: IBucketItemMetricFilter,
        bucketsMeta?: Partial<IBucketsMetaState>,
        isMeasure?: boolean,
    ) {
        return createDecoratedMetricAttributeFilter(_filter, itemCache, bucketsMeta, isMeasure);
    }

    describe("metricAttributeFilter factory", () => {
        it("builds a filter whose top-level prop values are all plain", () => {
            const built = metricAttributeFilter({ selectedElements: elements });

            expect(built["selectedElements"]).toHaveLength(5);
            expect(built["selectedElements"][0]).toEqual({ uri: "/1?id=1", title: "1 element 1" });
        });

        it("builds a filter whose nested array and object values are all plain", () => {
            const built = metricAttributeFilter({
                selectedElements: [{ uri: "/1?id=1", title: "1 element 1" }, unavailableElement],
                textModeFilter: { values: ["a", "b"] } as TextModeFilterData,
            });

            expect(built["selectedElements"][0]).toEqual({ uri: "/1?id=1", title: "1 element 1" });
            expect(built["selectedElements"][1]).toEqual(unavailableElement);
            expect(built["textModeFilter"]).toEqual({ values: ["a", "b"] });
        });
    });

    describe("decorated item", () => {
        beforeEach(() => {
            filter = metricAttributeFilter({
                attribute: "aaeFKXFYiCc0",
                selectedElements: [elements[0], elements[2], unavailableElement],
                isInverted: false,
                totalElementsCount: 3,
                allElements: elements,
            });
            decorated = getDecorated(filter);
        });

        it("should point to original object", () => {
            expect(decorated.original).toEqual(filter);
        });

        it("should set attribute to catalog item", () => {
            const attribute = decorated.attribute;
            expect(attribute).toEqual(itemCache[`attribute.${attribute.id}`]);
        });

        it("should set isDate to false", () => {
            decorated = getDecorated(filter);
            expect(decorated.isDate).toEqual(false);
        });

        describe("selectedElements", () => {
            it("should generate selected elements", () => {
                const selectedElements = decorated.selectedElements;
                expect(selectedElements.length).toEqual(3);
                expect(selectedElements[0].uri).toEqual("/1?id=1");
                expect(selectedElements[1].uri).toEqual("/3?id=3");
                expect(selectedElements[2].uri).toEqual("/6?id=666");
                expect(selectedElements[0].id).toEqual(1);
                expect(selectedElements[1].id).toEqual(3);
                expect(selectedElements[2].id).toEqual(666);
            });
        });

        describe("selectionSize", () => {
            it("should set selection size correctly", () => {
                expect(decorated.selectionSize).toEqual(2);
            });
        });

        describe("allSelected", () => {
            it("should be set correctly", () => {
                filter = { ...filter, selectedElements: [] };
                decorated = getDecorated(filter);
                expect(decorated.allSelected).toEqual(true);

                filter = { ...filter, selectedElements: [{ foo: "bar" }] };
                decorated = getDecorated(filter);

                expect(decorated.allSelected).toEqual(false);
            });
        });

        describe("getTitle", () => {
            it("should set correctly when all selected", () => {
                filter = { ...filter, selectedElements: [] };
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual("Awareness: All");
            });

            it("should set correctly when some elements are selected", () => {
                filter = { ...filter, totalElementsCount: 100 };
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: 1 element 1, 3 element 3",
                );
            });

            it("should set correctly when element has no name", () => {
                filter = { ...filter, selectedElements: [{ uri: "/1?id=1", title: "" }] };

                decorated = getDecorated(filter);

                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: (empty value)",
                );
            });

            it("should set correctly with inverse selection", () => {
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [elements[0], elements[2]],
                };
                decorated = getDecorated(filter);

                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: is not 1 element 1, 3 element 3",
                );
            });

            it("should set correctly with more than 3 attribute values and long title and NOT inverted", () => {
                filter = {
                    ...filter,
                    isInverted: false,
                    selectedElements: [elements[0], elements[1], elements[2], elements[5]],
                };
                decorated = getDecorated(filter);

                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual("Awareness (4)");
            });

            it("should set correctly with more than 3 attribute values and long title and inverted", () => {
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [elements[0], elements[1], elements[2], elements[5]],
                };
                decorated = getDecorated(filter);

                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness (is not 4)",
                );
            });

            it("should set correctly with not all elements available, but some selected and inverted", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [...Array(100).map(() => elements[0])],
                    isInverted: true,
                    totalElementsCount: 200,
                    allElements: elements,
                    isModified: false,
                } as IBucketItemMetricFilter);
                decorated = getDecorated(filter);

                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness (is not 100)",
                );
            });
        });

        describe("selectionEquals", () => {
            it("should be true when selection is the same", () => {
                expect(
                    DecoratedMetricAttributeFilter.selectionEquals(
                        decorated,
                        [
                            { uri: "/1?id=1" },
                            { uri: "/3?id=3" },
                            { uri: "/6?id=666" },
                        ] as IDecoratedAttributeElement[],
                        false,
                    ),
                ).toEqual(true);
            });

            it("should be false when selection is different", () => {
                expect(
                    DecoratedMetricAttributeFilter.selectionEquals(
                        decorated,
                        [
                            { uri: "/1?id=1" },
                            { uri: "/2?id=2" },
                            { uri: "/6?id=666" },
                        ] as IDecoratedAttributeElement[],
                        false,
                    ),
                ).toEqual(false);
                expect(
                    DecoratedMetricAttributeFilter.selectionEquals(
                        decorated,
                        [{ uri: "/1?id=1" }] as IDecoratedAttributeElement[],
                        false,
                    ),
                ).toEqual(false);
                expect(
                    DecoratedMetricAttributeFilter.selectionEquals(
                        decorated,
                        [
                            { uri: "/1?id=1" },
                            { uri: "/3?id=3" },
                            { uri: "/6?id=666" },
                        ] as IDecoratedAttributeElement[],
                        true,
                    ),
                ).toEqual(false);
            });
        });

        describe("correctly set isModified", () => {
            it("should always set isModified to true on metric filter", () => {
                const decoratedFilter = getDecorated(filter, {}, true);
                expect(decoratedFilter.isModified).toEqual(true);
            });

            it("should set isModified:true from buckets meta for non-metric filter", () => {
                const decoratedFilter = getDecorated(
                    filter,
                    {
                        modified: {
                            aaeFKXFYiCc0: true,
                        },
                    },
                    false,
                );
                expect(decoratedFilter.isModified).toEqual(true);
            });

            it("should set isModified:false from buckets meta for non-metric filter", () => {
                const decoratedFilter = getDecorated(filter, {}, false);
                expect(decoratedFilter.isModified).toEqual(false);
            });
        });

        describe("buildFilterSelection", () => {
            it("should build expected filter selection", () => {
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [elements[0], elements[1], elements[2]],
                };
                decorated = getDecorated(filter);

                expect(buildFilterSelection(decorated)).toMatchSnapshot();
            });
        });

        describe("getSelectionTitle", () => {
            it("should build expected selection title for filter with some selected values", () => {
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [elements[0], elements[1], elements[2]],
                };
                decorated = getDecorated(filter);

                const selection = buildFilterSelection(decorated);
                expect(getSelectionTitle("My attribute", selection, intl)).toEqual(
                    "is not 1 element 1, 2 element 2, 3 element 3",
                );
            });
            it("should build expected selection title for filter with all selected values", () => {
                filter = { ...filter, isInverted: false, selectedElements: [] };
                decorated = getDecorated(filter);

                const selection = buildFilterSelection(decorated);
                expect(getSelectionTitle("My attribute", selection, intl)).toEqual("All");
            });

            it("shows date attribute values the way the backend formats them, as the filter bar does", () => {
                // a month-of-year filter: the stored value is the raw number, the backend adds the name
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [
                        { uri: "1", title: "1", formattedTitle: "Jan" },
                        { uri: "2", title: "2", formattedTitle: "Feb" },
                    ],
                };
                decorated = getDecorated(filter);

                const selection = buildFilterSelection(decorated);
                expect(selection.selectedElements.map((element) => element.formattedTitle)).toEqual([
                    "Jan",
                    "Feb",
                ]);
                expect(getSelectionTitle("Month of Year", selection, intl)).toEqual("is not Jan, Feb");
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: is not Jan, Feb",
                );
            });
        });

        describe("getEllipsedTitle", () => {
            it("should return expected text", () => {
                filter = {
                    ...filter,
                    isInverted: true,
                    selectedElements: [elements[0], elements[1], elements[2]],
                };
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getEllipsedTitle(decorated, intl)).toEqual(
                    "Awareness: is not 1 element 1, 2 element 2, 3 element 3",
                );
            });
        });

        describe("text-mode filters", () => {
            it("should show title for arbitrary positive filter", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: ["foo", "bar"] },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: foo, bar",
                );
            });

            it("should show title for arbitrary negative filter", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: ["foo"], negativeSelection: true },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: is not foo",
                );
            });

            it("should show title for match contains filter", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "match", operator: "contains", literal: "test" },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: contains test",
                );
            });

            it("should show title for match negative startsWith filter", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: {
                        mode: "match",
                        operator: "startsWith",
                        literal: "abc",
                        negativeSelection: true,
                    },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: doesn't start with abc",
                );
            });

            it("should show ellipsed title for text-mode filter", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "match", operator: "endsWith", literal: "xyz" },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getEllipsedTitle(decorated, intl)).toEqual(
                    "Awareness: ends with xyz",
                );
            });

            it("should show count for arbitrary positive filter with more than 3 values", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: {
                        mode: "arbitrary",
                        values: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
                    },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual("Awareness: (10)");
            });

            it("should show count for arbitrary negative filter with more than 3 values", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: {
                        mode: "arbitrary",
                        values: ["a", "b", "c", "d"],
                        negativeSelection: true,
                    },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: is not (4)",
                );
            });

            it("should list values for arbitrary filter with exactly 3 values", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: ["foo", "bar", "baz"] },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    "Awareness: foo, bar, baz",
                );
            });

            it("should show All for text filter with All condition", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: [], negativeSelection: true },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual("Awareness: All");
            });

            it("should show All in ellipsed title for text filter with All condition", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: [], negativeSelection: true },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getEllipsedTitle(decorated, intl)).toEqual(
                    "Awareness: All",
                );
            });

            it("should handle empty string in arbitrary values", () => {
                filter = metricAttributeFilter({
                    attribute: "aaeFKXFYiCc0",
                    selectedElements: [],
                    isInverted: false,
                    totalElementsCount: 0,
                    allElements: elements,
                    textModeFilter: { mode: "arbitrary", values: ["", "val"] },
                });
                decorated = getDecorated(filter);
                expect(DecoratedMetricAttributeFilter.getTitle(decorated, intl)).toEqual(
                    'Awareness: "", val',
                );
            });
        });
    });
    describe("additional date filter title", () => {
        const dateAttribute = {
            identifier: "expected_ship_date.quarterOfYear",
            ref: idRef("expected_ship_date.quarterOfYear", "attribute"),
            dfRef: idRef("expected_ship_date.quarterOfYear", "displayForm"),
            title: "Expected ship date - Quarter of Year",
            dateType: "GDC.time.quarter_in_year",
            type: "attribute",
        };
        const dateItemCache: ICatalogEntries = { "expected_ship_date.quarterOfYear": dateAttribute };
        const dateDatasetsMeta = [
            {
                identifier: "expected_ship_date",
                title: "Expected ship date",
                attributes: [
                    {
                        ref: idRef("expected_ship_date.quarterOfYear", "attribute"),
                        dfRef: idRef("expected_ship_date.quarterOfYear", "displayForm"),
                    },
                ],
            },
        ] as unknown as IDateDatasetsMetaItem[];
        const dateFilter = metricAttributeFilter({
            attribute: "expected_ship_date.quarterOfYear",
            selectedElements: [],
            isInverted: true,
        });
        const vietnameseIntl = mockIntlProp({ quarter_in_year: "Quý trong năm" });

        it("titles the filter from its date dataset and the translated granularity", () => {
            const decoratedDateFilter = createDecoratedMetricAttributeFilter(
                dateFilter,
                dateItemCache,
                {},
                false,
                {},
                dateDatasetsMeta,
            );

            expect(decoratedDateFilter.dateDatasetTitle).toBe("Expected ship date");
            expect(DecoratedMetricAttributeFilter.getTitle(decoratedDateFilter, vietnameseIntl)).toBe(
                "Expected ship date - Quý trong năm: All",
            );
            expect(DecoratedMetricAttributeFilter.getEllipsedTitle(decoratedDateFilter, vietnameseIntl)).toBe(
                "Expected ship date - Quý trong năm: All",
            );
        });

        it("keeps the attribute's own title when the date dataset is not known", () => {
            const decoratedDateFilter = createDecoratedMetricAttributeFilter(dateFilter, dateItemCache);

            expect(decoratedDateFilter.dateDatasetTitle).toBeUndefined();
            expect(DecoratedMetricAttributeFilter.getTitle(decoratedDateFilter, vietnameseIntl)).toBe(
                "Expected ship date - Quarter of Year: All",
            );
        });
    });
});
