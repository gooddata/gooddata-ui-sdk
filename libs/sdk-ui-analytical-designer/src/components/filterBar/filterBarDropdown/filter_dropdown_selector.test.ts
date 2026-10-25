// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ATTRIBUTE, DATE, METRIC } from "../../../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../../../models/date_item.js";
import { type IMeasuresDescriptions } from "../../../models/decorated_bucket_item.js";
import { type IFilter, type IMeasureValueFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { buildBucketItemMock } from "../../../tests/bucket_item.test.helpers.js";
import { buildAttributeFilterMock, buildDateFilterMock } from "../../../tests/filter.test.helpers.js";
import { type IRawBucketItem } from "../../../typings/buckets.js";
import { type ICatalogEntries } from "../../../typings/state_objects.js";
import { mockIntlProp } from "../../../utils/with_intl.js";

import { getAttributeItems, getDateItem, getMeasureItems } from "./filter_dropdown_selector.js";

const customTranslations = {
    date: "Translated date title",
};

const DATE_ITEM = buildBucketItemMock({
    identifier: DATE_DATASET_ATTRIBUTE,
    type: DATE,
    localIdentifier: "dateLocalId",
});

const SECOND_DATE_ITEM = buildBucketItemMock({
    identifier: DATE_DATASET_ATTRIBUTE,
    type: DATE,
    localIdentifier: "dateLocalId_2",
});

const COUNTRY_ATTRIBUTE: IRawBucketItem = buildBucketItemMock({
    identifier: "attr.country.id",
    title: "Country",
    type: ATTRIBUTE,
    attribute: "attr.country.id",
    localIdentifier: "countryAttributeLocalId",
});

const SECOND_COUNTRY_ATTRIBUTE: IRawBucketItem = buildBucketItemMock({
    identifier: "attr.country.id",
    title: "Country",
    type: ATTRIBUTE,
    attribute: "attr.country.id",
    localIdentifier: "countryAttributeLocalId_2",
});

const PRODUCT_ATTRIBUTE: IRawBucketItem = buildBucketItemMock({
    identifier: "attr.product.id",
    title: "Product",
    type: ATTRIBUTE,
    attribute: "attr.product.id",
    localIdentifier: "productAttributeLocalId",
});

const AWARENESS_METRIC: IRawBucketItem = buildBucketItemMock({
    identifier: "metric.awareness.id",
    title: "Awareness",
    type: METRIC,
    attribute: "metric.awareness.id",
    localIdentifier: "awarenessMetricLocalId",
});

const AMOUNT_METRIC: IRawBucketItem = buildBucketItemMock({
    identifier: "metric.amount.id",
    title: "Amount",
    type: METRIC,
    attribute: "metric.amount.id",
    localIdentifier: "amountMetricLocalId",
});

const INCOMPLETE_ARITHMETIC_MEASURE: IRawBucketItem = buildBucketItemMock({
    title: "Ratio",
    type: METRIC,
    localIdentifier: "incompleteAM",
    operandLocalIdentifiers: [null, null],
    operator: "ratio",
});

const ARITHMETIC_MEASURE: IRawBucketItem = buildBucketItemMock({
    title: "Amount to awareness ratio",
    type: METRIC,
    localIdentifier: "amAmountAwarenessRatio",
    operandLocalIdentifiers: ["amountMetricLocalId", "awarenessMetricLocalId"],
    operator: "ratio",
});

const AMOUNT_MEASURE_FILTER: IMeasureValueFilter = {
    type: "measure",
    localIdentifier: "amountMeasureFilter",
    measureLocalIdentifier: "amountMetricLocalId",
    conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
};

const AWARENESS_MEASURE_FILTER: IMeasureValueFilter = {
    type: "measure",
    localIdentifier: "awarenessMeasureFilter",
    measureLocalIdentifier: "awarenessMetricLocalId",
    conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
};

const DATE_FILTER: IFilter = buildDateFilterMock({
    localIdentifier: "f_date",
});

const COUNTRY_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.country.id",
    localIdentifier: "f_country",
});

const PRODUCT_ATTRIBUTE_FILTER: IFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.product.id",
    localIdentifier: "f_product",
});

// a computed attribute sits in the buckets as an attribute item, but its cache entry lives in the
// computed attribute namespace
const COMPUTED_ATTRIBUTE_ITEM: IRawBucketItem = buildBucketItemMock({
    identifier: "rep-performance",
    title: "Rep performance",
    type: ATTRIBUTE,
    attribute: "rep-performance",
    localIdentifier: "repPerformanceLocalId",
    isComputedAttribute: true,
});

const ITEM_CACHE: ICatalogEntries = {
    "metric.awareness.id": AWARENESS_METRIC,
    "attribute.attr.product.id": PRODUCT_ATTRIBUTE,
    "attribute.attr.country.id": COUNTRY_ATTRIBUTE,
    "computedAttribute.rep-performance": { ...COMPUTED_ATTRIBUTE_ITEM, type: "computedAttribute" },
};

const MEASURE_DESCRIPTIONS: IMeasuresDescriptions = {
    awarenessMetricLocalId: {
        title: "Awareness",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
    amountMetricLocalId: {
        title: "Amount",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
    amAmountAwarenessRatio: {
        title: "Amount to awareness ratio",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
    incompleteAM: {
        title: "Ratio",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
};

const expectedLocalIdentifierMatcher = expect.stringMatching(/[a-z0-9]+/);

describe("Filter dropdown selector", () => {
    describe("getAttributeItems", () => {
        it("should return attribute items both from attributes bucket and filter bar", () => {
            const bucketItems = [COUNTRY_ATTRIBUTE];
            const filters = [PRODUCT_ATTRIBUTE_FILTER];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, filters);

            expect(attributeItems).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Country",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["countryAttributeLocalId"],
                },
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Product",
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: [],
                },
            ]);
        });

        it("should offer a computed attribute as a filter", () => {
            const bucketItems = [COUNTRY_ATTRIBUTE, COMPUTED_ATTRIBUTE_ITEM];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, []);

            expect(attributeItems).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Country",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["countryAttributeLocalId"],
                },
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Rep performance",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["repPerformanceLocalId"],
                },
            ]);
        });

        it("should resolve a computed attribute from its own cache namespace", () => {
            expect(getAttributeItems.resultFunc([COMPUTED_ATTRIBUTE_ITEM], ITEM_CACHE, [])).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Rep performance",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["repPerformanceLocalId"],
                },
            ]);
        });

        it("should return attribute items without duplicates of attribute and its filter", () => {
            const bucketItems = [COUNTRY_ATTRIBUTE];
            const filters = [COUNTRY_ATTRIBUTE_FILTER];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, filters);

            expect(attributeItems).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Country",
                    filterLocalIdentifier: "f_country",
                    bucketItemLocalIdentifiers: ["countryAttributeLocalId"],
                },
            ]);
        });

        it("should return only attributes and filters (no measures, no date item)", () => {
            const bucketItems = [COUNTRY_ATTRIBUTE, AWARENESS_METRIC, DATE_ITEM];
            const filters = [PRODUCT_ATTRIBUTE_FILTER];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, filters);

            expect(attributeItems).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Country",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["countryAttributeLocalId"],
                },
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Product",
                    filterLocalIdentifier: "f_product",
                    bucketItemLocalIdentifiers: [],
                },
            ]);
        });

        it("should return empty when there is no attribute bucket item or attribute filter", () => {
            const bucketItems = [AWARENESS_METRIC, DATE_ITEM];
            const filters = [DATE_FILTER];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, filters);

            expect(attributeItems).toEqual([]);
        });

        it("should return only unique attribute items", () => {
            const bucketItems = [COUNTRY_ATTRIBUTE, SECOND_COUNTRY_ATTRIBUTE];
            const filters = [COUNTRY_ATTRIBUTE_FILTER];

            const attributeItems = getAttributeItems.resultFunc(bucketItems, ITEM_CACHE, filters);

            expect(attributeItems).toEqual([
                {
                    id: expectedLocalIdentifierMatcher,
                    title: "Country",
                    filterLocalIdentifier: "f_country",
                    bucketItemLocalIdentifiers: ["countryAttributeLocalId", "countryAttributeLocalId_2"],
                },
            ]);
        });
    });

    describe("getDateItem", () => {
        it("should return null when there is no date filter and no date bucket item", () => {
            const bucketItems = [AWARENESS_METRIC];
            const filters: ReadonlyArray<IFilter> = [];

            const dateItem = getDateItem.resultFunc(mockIntlProp(customTranslations), bucketItems, filters);

            expect(dateItem).toBeNull();
        });

        it("should return dateItem with filterLocalIdentifier and bucketItemLocalIdentifiers if there is a date filter and date bucket item", () => {
            const bucketItems = [AWARENESS_METRIC, DATE_ITEM];
            const filters = [DATE_FILTER];

            const dateItem = getDateItem.resultFunc(mockIntlProp(customTranslations), bucketItems, filters);

            expect(dateItem).toEqual({
                id: expectedLocalIdentifierMatcher,
                title: "Translated date title",
                filterLocalIdentifier: "f_date",
                bucketItemLocalIdentifiers: ["dateLocalId"],
            });
        });

        it("should return dateItem with bucketItemLocalIdentifiers if there is no date filter just date bucket item", () => {
            const bucketItems = [AWARENESS_METRIC, DATE_ITEM];
            const filters: ReadonlyArray<IFilter> = [];

            const dateItem = getDateItem.resultFunc(mockIntlProp(customTranslations), bucketItems, filters);

            expect(dateItem).toEqual({
                id: expectedLocalIdentifierMatcher,
                title: "Translated date title",
                filterLocalIdentifier: null,
                bucketItemLocalIdentifiers: ["dateLocalId"],
            });
        });

        it("should return dateItem with two bucketItemLocalIdentifiers if there is no date filter just two date bucket items", () => {
            const bucketItems = [AWARENESS_METRIC, DATE_ITEM, SECOND_DATE_ITEM];
            const filters: ReadonlyArray<IFilter> = [];

            const dateItem = getDateItem.resultFunc(mockIntlProp(customTranslations), bucketItems, filters);
            expect(dateItem).toEqual({
                id: expectedLocalIdentifierMatcher,
                title: "Translated date title",
                filterLocalIdentifier: null,
                bucketItemLocalIdentifiers: ["dateLocalId", "dateLocalId_2"],
            });
        });

        it("should return dateItem with filterLocalIdentifier if there is a date filter only", () => {
            const bucketItems = [AWARENESS_METRIC];
            const filters = [DATE_FILTER];

            const dateItem = getDateItem.resultFunc(mockIntlProp(customTranslations), bucketItems, filters);

            expect(dateItem).toEqual({
                id: expectedLocalIdentifierMatcher,
                title: "Translated date title",
                filterLocalIdentifier: "f_date",
                bucketItemLocalIdentifiers: [],
            });
        });
    });

    describe("getMeasureItems", () => {
        const bucketItems: IRawBucketItem[] = [DATE_ITEM, COUNTRY_ATTRIBUTE, AWARENESS_METRIC];

        it("should return empty measures if insight is not sliced", () => {
            const bucketItemsWithJustMeasure: IRawBucketItem[] = [AWARENESS_METRIC];
            const filters: IFilter[] = [];

            const measures = getMeasureItems.resultFunc(
                false,
                bucketItemsWithJustMeasure,
                MEASURE_DESCRIPTIONS,
                filters,
            );

            expect(measures).toEqual([]);
        });

        it("should return measure which has no filter", () => {
            const filters: IFilter[] = [];

            const measures = getMeasureItems.resultFunc(true, bucketItems, MEASURE_DESCRIPTIONS, filters);

            expect(measures).toEqual([
                {
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Awareness",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["awarenessMetricLocalId"],
                },
            ]);
        });

        it("should return measure with alias", () => {
            const filters: IFilter[] = [];
            const measureDescriptions: IMeasuresDescriptions = {
                awarenessMetricLocalId: {
                    title: "Awareness",
                    alias: "Awareness_alias",
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
            };

            const measures = getMeasureItems.resultFunc(true, bucketItems, measureDescriptions, filters);

            expect(measures).toEqual([
                {
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Awareness_alias",
                    filterLocalIdentifier: null,
                    bucketItemLocalIdentifiers: ["awarenessMetricLocalId"],
                },
            ]);
        });

        it("should return measure which has filter", () => {
            const filters: IFilter[] = [AWARENESS_MEASURE_FILTER];

            const measures = getMeasureItems.resultFunc(true, bucketItems, MEASURE_DESCRIPTIONS, filters);

            expect(measures).toEqual([
                {
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Awareness",
                    filterLocalIdentifier: "awarenessMeasureFilter",
                    bucketItemLocalIdentifiers: ["awarenessMetricLocalId"],
                },
            ]);
        });

        it("should return multiple measure filters", () => {
            const bucketItemsWithMultipleMeasures = [...bucketItems, AMOUNT_METRIC];
            const filters: IFilter[] = [AWARENESS_MEASURE_FILTER, AMOUNT_MEASURE_FILTER];

            const measures = getMeasureItems.resultFunc(
                true,
                bucketItemsWithMultipleMeasures,
                MEASURE_DESCRIPTIONS,
                filters,
            );

            expect(measures).toEqual([
                {
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Awareness",
                    filterLocalIdentifier: "awarenessMeasureFilter",
                    bucketItemLocalIdentifiers: ["awarenessMetricLocalId"],
                },
                {
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Amount",
                    filterLocalIdentifier: "amountMeasureFilter",
                    bucketItemLocalIdentifiers: ["amountMetricLocalId"],
                },
            ]);
        });

        it("should return arithmetic measures with operands", () => {
            const bucketsWithArithmeticMeasure = [DATE_ITEM, ARITHMETIC_MEASURE];
            const filters: IFilter[] = [];

            const measures = getMeasureItems.resultFunc(
                true,
                bucketsWithArithmeticMeasure,
                MEASURE_DESCRIPTIONS,
                filters,
            );

            expect(measures).toEqual([
                {
                    bucketItemLocalIdentifiers: ["amAmountAwarenessRatio"],
                    filterLocalIdentifier: null,
                    id: expect.stringMatching(/[a-z0-9]+/),
                    title: "Amount to awareness ratio",
                },
            ]);
        });

        it("should not return arithmetic measures without operands", () => {
            const bucketsWithArithmeticMeasure = [DATE_ITEM, INCOMPLETE_ARITHMETIC_MEASURE];
            const filters: IFilter[] = [];

            const measures = getMeasureItems.resultFunc(
                true,
                bucketsWithArithmeticMeasure,
                MEASURE_DESCRIPTIONS,
                filters,
            );

            expect(measures).toEqual([]);
        });
    });
});
