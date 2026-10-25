// (C) 2007-2026 GoodData Corporation

import { range } from "lodash-es";
import { beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { ATTRIBUTE, DATE, METRIC } from "../constants/bucket.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import {
    awarenessMetric,
    awarenessMetricLong,
    cartAdditionsFact,
    cityAttribute,
    countryAttribute,
    currencyAttribute,
    dateDataset,
    dateDatasets,
    emptyDateDatasets,
    itemCache,
    productAttribute,
    selectedDateDatasets,
} from "../tests/constants.test.helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../typings/buckets.js";
import { type ICatalogEntries } from "../typings/state_objects.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { buildBucketItem } from "./bucket_item.js";
import { type IDecoratedDateDatasetItem, type ISelectedDateDatasets } from "./date_dataset.js";
import { type IDateDatasetsMetaItem } from "./date_datasets_meta_item.js";
import { type IDecoratedDateFilter } from "./date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "./date_item.js";
import {
    type IMeasuresDescriptions,
    decoratedBucketItem,
    getAttribute,
    getGranularity,
    hasLocalIdentifier,
} from "./decorated_bucket_item.js";
import { metricAttributeFilter } from "./decorated_metric_attribute_filter.js";

const getItemCacheMock = (): ICatalogEntries => itemCache as ICatalogEntries;

describe("Decorated Bucket Item", () => {
    let decorated: IDecoratedBucketItem;
    let elements: Array<{ uri: string; title: string }>;
    const intl = mockIntlProp();

    interface IDecorateOptions {
        measuresDescriptions?: IMeasuresDescriptions;
        bucketsMeta?: Partial<IBucketsMetaState>;
        selectedDateDatasets?: ISelectedDateDatasets;
    }

    function createDecoratedBucketItem(item: IRawBucketItem, options: IDecorateOptions = {}) {
        const measuresDescriptions: IMeasuresDescriptions = options.measuresDescriptions || {
            [item?.localIdentifier]: {
                title: "item title",
                alias: item?.alias,
                isFormattedAsPercentage: false,
                showInPercent: false,
            },
        };

        const bucketsMeta = options.bucketsMeta || {};
        const testDateDatasets = options.selectedDateDatasets || selectedDateDatasets;

        return decoratedBucketItem(
            item,
            getItemCacheMock(),
            testDateDatasets,
            measuresDescriptions,
            bucketsMeta,
            {},
            intl,
        );
    }

    beforeEach(() => {
        elements = range(1, 50).map((idx) => ({ uri: `/${idx}`, title: `element ${idx}` }));
    });

    describe("basic tests", () => {
        let item: IRawBucketItem;
        beforeEach(() => {
            item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                alias: "item alias",
                localIdentifier: "locId123",
                aggregation: "count",
                format: "#,##0.00",
                type: "attribute",
            });
            decorated = createDecoratedBucketItem(item);
        });

        describe("decorated item", () => {
            it("should point to original object", () => {
                expect(decorated.original).toEqual(item);
            });

            it("should set aggregation property from the original item", () => {
                expect(decorated.aggregation).toBe(item?.aggregation);
            });

            it("should set the alias property from the original item", () => {
                expect(decorated.alias).toBe(item?.alias);
            });

            it("should set attribute property to catalog item based on attribute id from the original object", () => {
                expect(decorated.attribute).toEqual(getItemCacheMock()?.[`attribute.${item?.attribute}`]);
            });

            it("should set dateDataset property to null by default", () => {
                expect(decorated.dateDataset).toBeNull();
            });

            it("should set granularity property to undefined by default", () => {
                expect(decorated.granularity).toBeUndefined();
            });

            it("should set the isArithmeticMeasure property to false, when item is not an arithmetic measure", () => {
                expect(decorated.isArithmeticMeasure).toEqual(false);
            });

            it("should set the localIdentifier property from the original item", () => {
                expect(decorated.localIdentifier).toBe(item?.localIdentifier);
            });

            it("should set the format property from the original item", () => {
                expect(decorated.format).toBe(item?.format);
            });

            describe("collapsed property", () => {
                it.each([[METRIC], [DATE], [ATTRIBUTE]])(
                    "should set collapsed property to true by default",
                    (type: string) => {
                        item = buildBucketItem({
                            attribute: awarenessMetric.identifier,
                            type: type === DATE ? ATTRIBUTE : type,
                        });
                        const bucketsMeta = {};

                        decorated = createDecoratedBucketItem(item, { bucketsMeta });

                        expect(decorated.collapsed).toEqual(true);
                    },
                );

                it.each([
                    [METRIC, "measureExpanded"],
                    [DATE, "attributeExpanded"],
                    [ATTRIBUTE, "attributeExpanded"],
                ])(
                    "should set collapsed property to false if it set as expanded in buckets meta",
                    (type: string, bucketsMetaProp: string) => {
                        item = buildBucketItem({
                            attribute: awarenessMetric.identifier,
                            type: type === DATE ? ATTRIBUTE : type,
                        });
                        const identifier = item?.localIdentifier;
                        const bucketsMeta = { [bucketsMetaProp]: identifier };

                        decorated = createDecoratedBucketItem(item, { bucketsMeta });

                        expect(decorated.collapsed).toEqual(false);
                    },
                );
            });

            describe("label property", () => {
                it("should set label property to alias value if it is set", () => {
                    item = buildBucketItem({
                        attribute: awarenessMetric.identifier,
                        alias: "Alias",
                        type: METRIC,
                    });
                    decorated = createDecoratedBucketItem(item);
                    expect(decorated.label).toEqual("Alias");
                });

                it("should set label property to measure title value if alias is not set", () => {
                    item = buildBucketItem({
                        attribute: awarenessMetric.identifier,
                        type: METRIC,
                    });
                    decorated = createDecoratedBucketItem(item);
                    expect(decorated.label).toEqual("item title");
                });
            });

            describe("filters property", () => {
                it("should set filters property correctly", () => {
                    const attributeFilter = metricAttributeFilter({ attribute: "attr.id" });
                    const dateFilter = metricAttributeFilter({ attribute: "date.id" });
                    const measureValueFilter = metricAttributeFilter({});
                    const filters = [attributeFilter, dateFilter, measureValueFilter];

                    item = buildBucketItem({ filters });
                    decorated = createDecoratedBucketItem(item);

                    expect(decorated.filters.length).toBe(2);
                    expect(decorated.filters[0].original).toEqual(filters[0]);
                    expect(decorated.filters[1].original).toEqual(filters[1]);
                });
            });
        });
    });

    describe("measure", () => {
        let item;
        beforeEach(() => {
            item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                type: METRIC,
            });
            decorated = createDecoratedBucketItem(item);
        });

        it("should set isDate property to false", () => {
            expect(decorated.isDate).toEqual(false);
        });

        it("should set measureTitle property to the value from measuresDescriptions", () => {
            expect(decorated.measureTitle).toEqual("item title");
        });

        it("should set uri property to the uri of the catalog item", () => {
            expect(decorated.uri).toEqual(awarenessMetric.uri);
        });
    });

    describe("attribute based measure", () => {
        let item;
        beforeEach(() => {
            item = buildBucketItem({
                attribute: productAttribute.identifier,
                filters: [],
                aggregation: "count",
                type: METRIC,
            });
            decorated = createDecoratedBucketItem(item);
        });

        it("should set isDate property to false", () => {
            expect(decorated.isDate).toEqual(false);
        });

        it("should set measureTitle property to the value from measuresDescriptions", () => {
            expect(decorated.measureTitle).toEqual("item title");
        });

        it("should set uri property to the uri of the catalog item", () => {
            expect(decorated.uri).toEqual(productAttribute.uri);
        });
    });

    describe("fact based measure", () => {
        let item;
        beforeEach(() => {
            item = buildBucketItem({
                attribute: cartAdditionsFact.identifier,
                type: METRIC,
                aggregation: "sum",
            });
            decorated = createDecoratedBucketItem(item);
        });

        it("should set isDate property to false", () => {
            expect(decorated.isDate).toEqual(false);
        });

        it("should set measureTitle property the value from measuresDescriptions", () => {
            expect(decorated.measureTitle).toEqual("item title");
        });

        it("should set uri property to the uri of the catalog item", () => {
            expect(decorated.uri).toEqual(cartAdditionsFact.uri);
        });
    });

    describe("date attribute item", () => {
        let item;
        beforeEach(() => {
            item = buildBucketItem({
                attribute: DATE_DATASET_ATTRIBUTE,
                dateDatasetRef: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                },
            });
            decorated = createDecoratedBucketItem(item);
        });

        it("should set isDate property to true", () => {
            expect(decorated.isDate).toEqual(true);
        });

        it("should set dateDataset property to correct value", () => {
            expect(decorated.dateDataset).toEqual(dateDatasets.items[0]);
        });

        it("should set uri property to the dateType of the first attribute of current global date dataset", () => {
            expect(decorated.granularity).toEqual(dateDatasets.items[0].attributes[0]);
        });

        it("should set uri property to the uri of the first attribute of current global date dataset if granularity property has not been set", () => {
            expect(decorated.uri).toEqual(dateDatasets.items[0].attributes[0].uri);
        });
    });

    describe("date attribute item when global date dataset is not set", () => {
        it("should set uri property to undefined", () => {
            const item = buildBucketItem({
                attribute: DATE_DATASET_ATTRIBUTE,
            });

            decorated = createDecoratedBucketItem(item, {
                selectedDateDatasets: {
                    globalDateDatasets: emptyDateDatasets,
                    measureDateDatasets: new Map(),
                },
            });

            expect(decorated.uri).toBeUndefined();
        });
    });

    describe("date attribute item with set granularity", () => {
        it("should set uri property to the uri of the last attribute of current global date dataset if granularity property has not been set", () => {
            const item = buildBucketItem({
                attribute: DATE_DATASET_ATTRIBUTE,
                granularity: "GDC.time.date",
                dateDatasetRef: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                },
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.uri).toEqual(dateDatasets.items[0].attributes[1].uri);
        });
    });

    describe("measure with date filter", () => {
        const filters = [
            {
                attribute: DATE_DATASET_ATTRIBUTE,
                isInverted: true,
                totalElementsCount: 0,
                dimension: "date.dim_date",
                interval: {
                    granularity: "GDC.time.year",
                    type: "relative",
                    interval: [-5, -5],
                },
            },
        ];

        it("should add date filter if selected date dataset is applicable to measure", () => {
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                type: "attribute",
            });

            const bucketsMeta = {};

            decorated = createDecoratedBucketItem(item, { bucketsMeta });

            expect(decorated.filters.length === 0).toEqual(false);
        });

        it("resolves every date filter by its own dataset, the measure selection standing in for one without", () => {
            const closedDateDataset: IDateDatasetsMetaItem = {
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/999"),
                identifier: "closed.dataset",
                uri: "/gdc/md/TeamOneGoodSales1/obj/999",
                type: "date",
                title: "Closed",
                summary: "",
                attributes: [],
            };
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m1",
                filters: [
                    { ...filters[0], dimension: "closed.dataset" },
                    { ...filters[0], dimension: "closed.dataset", interval: { name: "all_time" } },
                ],
                type: "attribute",
            });

            decorated = createDecoratedBucketItem(item, {
                bucketsMeta: {},
                selectedDateDatasets: { ...selectedDateDatasets, dateDatasetsMeta: [closedDateDataset] },
            });

            const [primary, further] = decorated.filters as IDecoratedDateFilter[];
            expect(primary.dateDataset?.identifier).toEqual("closed.dataset");
            expect(further.dateDataset?.identifier).toEqual("closed.dataset");
        });

        it("lists every date filter in measureAxisLabel", () => {
            const closedDateDataset: IDateDatasetsMetaItem = {
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/999"),
                identifier: "closed.dataset",
                uri: "/gdc/md/TeamOneGoodSales1/obj/999",
                type: "date",
                title: "Closed",
                summary: "",
                attributes: [],
            };
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m1",
                filters: [
                    filters[0],
                    { ...filters[0], dimension: "closed.dataset", interval: { name: "all_time" } },
                ],
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item, {
                bucketsMeta: {},
                selectedDateDatasets: { ...selectedDateDatasets, dateDatasetsMeta: [closedDateDataset] },
            });

            expect(decorated.measureAxisLabel).toEqual(
                "item title, Week/Year (Activity): 5 years ago; Closed: All time",
            );
        });

        it.each([
            ["exclude", "item title, Week/Year (Activity): All time except Empty values"],
            ["only", "item title, Week/Year (Activity): Empty values"],
        ] as const)("words the %s empty date values mode in measureAxisLabel", (mode, expected) => {
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m1",
                filters: [{ ...filters[0], interval: { name: "all_time" }, emptyDateValuesFilter: mode }],
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item, { bucketsMeta: {}, selectedDateDatasets });

            expect(decorated.measureAxisLabel).toEqual(expected);
        });

        it("words a date filter range not ending at the current period in measureAxisLabel", () => {
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m1",
                filters: [
                    {
                        ...filters[0],
                        interval: { granularity: "GDC.time.minute", type: "relative", interval: [-5, -2] },
                    },
                ],
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item, { bucketsMeta: {}, selectedDateDatasets });

            expect(decorated.measureAxisLabel).toEqual(
                "item title, Week/Year (Activity): From 5 to 2 minutes ago",
            );
        });

        it("falls back to the measure selection for a date filter that names no dataset", () => {
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m1",
                filters: [{ ...filters[0], dimension: undefined }],
                type: "attribute",
            });

            decorated = createDecoratedBucketItem(item, { bucketsMeta: {} });

            expect((decorated.filters[0] as IDecoratedDateFilter).dateDataset?.identifier).toEqual(
                "attr.datedataset",
            );
        });

        it("resolves a date filter by its own dataset even when the measure has no selection", () => {
            const closedDateDataset: IDateDatasetsMetaItem = {
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/999"),
                identifier: "closed.dataset",
                uri: "/gdc/md/TeamOneGoodSales1/obj/999",
                type: "date",
                title: "Closed",
                summary: "",
                attributes: [],
            };
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier: "m-without-selection",
                filters: [{ ...filters[0], dimension: "closed.dataset" }],
                type: "attribute",
            });

            decorated = createDecoratedBucketItem(item, {
                bucketsMeta: {},
                selectedDateDatasets: { ...selectedDateDatasets, dateDatasetsMeta: [closedDateDataset] },
            });

            expect((decorated.filters[0] as IDecoratedDateFilter).dateDataset?.identifier).toEqual(
                "closed.dataset",
            );
        });

        it("should not add date filter if selected date dataset is not applicable to measure", () => {
            const item = buildBucketItem({ identifier: awarenessMetricLong.identifier, type: "attribute" });
            const bucketsMeta = {};

            decorated = createDecoratedBucketItem(item, { bucketsMeta });

            expect(decorated.filters.length === 0).toEqual(true);
        });
    });

    describe("measure with filters", () => {
        it("should correctly set measureAxisLabel property", () => {
            const filters = [
                metricAttributeFilter({
                    attribute: productAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[2]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 3,
                }),
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.measureAxisLabel).toEqual("item title (Product: element 1, element 3)");
        });

        it("should crop measureAxisLabel property to 1000 characters", () => {
            const filters: IBucketItemMetricFilter[] = [
                {
                    attribute: DATE_DATASET_ATTRIBUTE,
                    allElements: [],
                    selectedElements: [],
                    isInverted: true,
                    totalElementsCount: 0,
                    noData: false,
                    interval: {
                        granularity: "GDC.time.year",
                        interval: ["-4", "-4"],
                        name: "four_years_ago",
                    },
                },
                metricAttributeFilter({
                    attribute: currencyAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[1], elements?.[2]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                localIdentifier: "m1",
                type: METRIC,
            });

            const measuresDescriptions: IMeasuresDescriptions = {
                [item?.localIdentifier]: {
                    title: "x".repeat(965),
                    alias: null,
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
            };

            decorated = createDecoratedBucketItem(item, { measuresDescriptions });

            expect(decorated.measureAxisLabel.length).toEqual(1000);
        });
    });

    describe("measure with multiple attribute filters", () => {
        it("should correctly set measureAxisLabel property for more filters", () => {
            const filters = [
                metricAttributeFilter({
                    attribute: productAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[2]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
                metricAttributeFilter({
                    attribute: currencyAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[1], elements?.[2]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
                metricAttributeFilter({
                    // all elements selected
                    attribute: countryAttribute.identifier,
                    selectedElements: [],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.measureAxisLabel).toEqual(
                "item title (Product: element 1, element 3; Currency: element 1, element 2, element 3)",
            );
        });

        it("should correctly set measureAxisLabel property for more filters including at least one summarized", () => {
            const filters = [
                metricAttributeFilter({
                    attribute: productAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[2]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
                metricAttributeFilter({
                    attribute: currencyAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[1], elements?.[2], elements?.[3]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
                metricAttributeFilter({
                    // all elements selected
                    attribute: countryAttribute.identifier,
                    selectedElements: [],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.measureAxisLabel).toEqual(
                'item title: "Product: element 1, element 3; Currency (4)"',
            );
        });
    });

    describe("measure with date and attribute filters", () => {
        it("should generate filter title for date filter only", () => {
            const filters = [
                {
                    attribute: DATE_DATASET_ATTRIBUTE,
                    isInverted: true,
                    totalElementsCount: 0,
                    noData: false,
                    interval: {
                        granularity: "GDC.time.year",
                        interval: ["-4", "-4"],
                        name: "four_years_ago",
                    },
                },
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                localIdentifier: "m1",
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.measureAxisLabel).toEqual("item title, Week/Year (Activity): 4 years ago");
        });

        it("should generate filter title for date filter and attribute filter", () => {
            const filters: IBucketItemMetricFilter[] = [
                {
                    attribute: DATE_DATASET_ATTRIBUTE,
                    allElements: [],
                    selectedElements: [],
                    isInverted: true,
                    totalElementsCount: 0,
                    noData: false,
                    interval: {
                        granularity: "GDC.time.year",
                        interval: ["-4", "-4"],
                        name: "four_years_ago",
                    },
                },
                metricAttributeFilter({
                    attribute: currencyAttribute.identifier,
                    selectedElements: [elements?.[0], elements?.[1], elements?.[2], elements?.[3]],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 49,
                }),
            ];
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                filters,
                localIdentifier: "m1",
                type: METRIC,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.measureAxisLabel).toEqual(
                "item title, Week/Year (Activity): 4 years ago: Currency (4)",
            );
        });
    });

    describe("derived measure", () => {
        it("should have isDerived property set to false by default", () => {
            const item = buildBucketItem({ attribute: awarenessMetric.identifier, type: "attribute" });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.isDerived).toBeFalsy();
        });

        it("should have isDerived property set to false by default if it is an derived measure", () => {
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                type: METRIC,
                masterLocalIdentifier: "m1",
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.isDerived).toBeTruthy();
        });
    });

    describe("arithmetic measure", () => {
        it("should have the isArithmeticMeasure property set to true", () => {
            const item = buildBucketItem({
                localIdentifier: "am1",
                operandLocalIdentifiers: ["m1", "m2"],
                operator: ArithmeticOperatorType.CHANGE,
            });

            decorated = createDecoratedBucketItem(item);

            expect(decorated.isArithmeticMeasure).toEqual(true);
        });
    });

    describe("helper functions", () => {
        describe("getAttribute", () => {
            const itemCacheMock = getItemCacheMock();

            it("should return null when attribute property is 'null'", () => {
                const item = buildBucketItem({});

                const attribute = getAttribute(item, itemCacheMock);

                expect(attribute).toEqual(null);
            });

            it("should return catalog item from itemCache", () => {
                const item = buildBucketItem({
                    attribute: awarenessMetric.identifier,
                    type: "attribute",
                });

                const attribute = getAttribute(item, itemCacheMock);

                expect(attribute).toEqual(awarenessMetric);
            });

            it("should return catalog item from itemCache with visible location icon", () => {
                const item = buildBucketItem({
                    attribute: cityAttribute.identifier,
                    type: "attribute",
                    displayForms: cityAttribute.displayForms,
                });

                const attribute = getAttribute(item, itemCacheMock, true, "location");

                expect(attribute).toEqual(cityAttribute);
            });

            it("should keep display-form overrides merged from a bucket item plain", () => {
                const dfRef = { uri: "/gdc/md/project/obj/df-text" };
                const areaRef = { uri: "/gdc/md/project/obj/df-area" };
                const item: IRawBucketItem = {
                    attribute: awarenessMetric.identifier,
                    type: "attribute",
                    displayForm: dfRef,
                    dfRef,
                    dfUri: dfRef.uri,
                    dfIdentifier: "df.text",
                    areaDisplayFormRef: areaRef,
                };

                const attribute = getAttribute(item, itemCacheMock);

                expect(attribute.dfRef).toEqual(dfRef);
                expect(attribute.displayForm).toEqual(dfRef);
                expect(attribute.areaDisplayFormRef).toEqual(areaRef);
                // the string-valued overrides stay primitives
                expect(attribute.dfUri).toBe(dfRef.uri);
                expect(attribute.dfIdentifier).toBe("df.text");
            });
        });

        describe("hasLocalIdentifier", () => {
            const localIdentifier = "m1";
            const item = buildBucketItem({
                attribute: awarenessMetric.identifier,
                localIdentifier,
                type: "attribute",
            });
            const decoratedItem = createDecoratedBucketItem(item);
            it("should be truthy if bucketItem localIdentifier is equal to given one", () => {
                expect(hasLocalIdentifier(decoratedItem, localIdentifier)).toEqual(true);
            });

            it("should be falsy if bucketItem localIdentifier is not equal to given one", () => {
                expect(hasLocalIdentifier(decoratedItem, "differentIdentifier")).toEqual(false);
            });
        });

        describe("getGranularity", () => {
            it("should return undefined when attribute is not of date", () => {
                const attribute = { type: "attribute" };
                const item = buildBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                    granularity: "GDC.time.date",
                });
                expect(getGranularity(item, attribute, dateDataset as IDecoratedDateDatasetItem)).toEqual(
                    undefined,
                );
            });

            it("should return first available granularity when there is no granularity matching the attribute", () => {
                const attribute = { type: "date" };
                const item = buildBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                    granularity: "other.granularity",
                });
                const granularity = getGranularity(item, attribute, dateDataset as IDecoratedDateDatasetItem);
                expect(granularity).toEqual(dateDataset.attributes[0]);
            });

            it("should return the matching attribute", () => {
                const attribute = { type: "date" };
                const item = buildBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                    granularity: "GDC.time.date",
                });
                const granularity = getGranularity(item, attribute, dateDataset as IDecoratedDateDatasetItem);
                expect(granularity).toEqual(dateDataset.attributes[0]);
            });

            it("should return the selected display form of the matching attribute", () => {
                const attribute = { type: "date" };
                const item = buildBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                    granularity: "GDC.time.week_us",
                    dfRef: {
                        uri: "/gdc/md/project/obj/df2",
                    },
                });
                const granularity = getGranularity(item, attribute, dateDataset as IDecoratedDateDatasetItem);
                const expectedDisplayForm = dateDataset.attributes[1].displayForms[1];
                expect(granularity).toEqual({
                    ...dateDataset.attributes[1],
                    dfRef: expectedDisplayForm.ref,
                    dfUri: expectedDisplayForm.uri,
                    dfIdentifier: expectedDisplayForm.id,
                });
            });

            it("should return the first available display form of the matching attribute when selected is not available", () => {
                const attribute = { type: "date" };
                const item = buildBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                    granularity: "GDC.time.week_us",
                    dfRef: {
                        uri: "/gdc/md/project/obj/df3",
                    },
                });
                const granularity = getGranularity(item, attribute, dateDataset as IDecoratedDateDatasetItem);
                const expectedDisplayForm = dateDataset.attributes[1].displayForms[0];
                expect(granularity).toEqual({
                    ...dateDataset.attributes[1],
                    dfRef: expectedDisplayForm.ref,
                    dfUri: expectedDisplayForm.uri,
                    dfIdentifier: expectedDisplayForm.id,
                });
            });
        });
    });
});
