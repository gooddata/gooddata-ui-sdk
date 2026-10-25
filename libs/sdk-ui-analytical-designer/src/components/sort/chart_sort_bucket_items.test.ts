// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { METRIC } from "../../constants/bucket.js";
import { type IDecoratedDateDatasetItem } from "../../models/date_dataset.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IBucketSequenceNumbers } from "../../selectors/measure_sequence_numbers_selector.js";
import { buildBucketItemMock } from "../../tests/bucket_item.test.helpers.js";
import { type IDecoratedGranularity, type IRawBucketItem } from "../../typings/buckets.js";
import { type IMeasuresDescriptions } from "../../typings/measure_descriptions.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";
import { mockIntlProp } from "../../utils/with_intl.js";

import { getAttributeItems, getBucketItemNames, getMeasureItems } from "./chart_sort_bucket_items.js";

const attribute = newDecoratedBucketItem({
    attribute: { identifier: "attr.country.id" },
    localIdentifier: "a1",
});

const renamedAttribute = newDecoratedBucketItem({
    alias: "My state",
    attribute: { identifier: "attr.state.id" },
    localIdentifier: "a2",
});

const chronologicalDate = newDecoratedBucketItem({
    granularity: { dateType: "GDC.time.date" } as IDecoratedGranularity,
    dateDataset: {
        attributeTitle: "Closed",
        attributes: [
            { dateType: "GDC.time.date", title: "Closed - Day" },
            { dateType: "GDC.time.year", title: "Closed - Year" },
        ],
    } as IDecoratedDateDatasetItem,
    localIdentifier: "a3",
    isDate: true,
});

const renamedChronologicalDate = newDecoratedBucketItem({
    granularity: { dateType: "GDC.time.date" } as IDecoratedGranularity,
    dateDataset: {
        attributeTitle: "Closed",
        attributes: [
            { dateType: "GDC.time.date", title: "Closed - Day" },
            { dateType: "GDC.time.year", title: "Closed - Year" },
        ],
    } as IDecoratedDateDatasetItem,
    localIdentifier: "a4",
    isDate: true,
    alias: "Renamed chronological date",
});

const genericDate = newDecoratedBucketItem({
    granularity: { dateType: "GDC.time.day_in_week" } as IDecoratedGranularity,
    dateDataset: {
        attributeTitle: "Closed",
        attributes: [{ dateType: "GDC.time.day_in_week", title: "Closed - Day of Week" }],
    } as IDecoratedDateDatasetItem,
    localIdentifier: "a5",
    isDate: true,
});

const measure = newDecoratedBucketItem({
    attribute: { identifier: "measure.won.id" },
    localIdentifier: "m3",
    isMeasure: true,
});

const snapshotMeasure: IRawBucketItem = buildBucketItemMock({
    identifier: "measure.snapshot.id",
    title: "Snapshot",
    type: METRIC,
    attribute: "metric.snapshot.id",
    localIdentifier: "m1",
});

const probabilityMeasure: IRawBucketItem = buildBucketItemMock({
    identifier: "metric.probability.id",
    title: "Probability",
    type: METRIC,
    attribute: "metric.probability.id",
    localIdentifier: "m2",
});

const itemCache: ICatalogEntries = {
    "attribute.attr.country.id": {
        title: "Country",
    },
    "attribute.attr.state.id": {
        title: "State",
    },
};

const MEASURE_DESCRIPTIONS: IMeasuresDescriptions = {
    m1: {
        title: "Snapshot",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
    m2: {
        title: "Probability",
        isFormattedAsPercentage: false,
        showInPercent: false,
    },
};

const MEASURE_SEQUENCE_NUMBERS: IBucketSequenceNumbers = {
    m1: 1,
    m2: 2,
};

const mockedTranslations = {
    ["bucket.title.measureSequenceNumber"]: "M{measureSequenceNumber}",
};

describe("chart sort bucket items", () => {
    describe("getBucketItemNames", () => {
        it("should return merged attributes and measures names from buckets", () => {
            const attributeItems = getAttributeItems.resultFunc(
                [
                    attribute,
                    renamedAttribute,
                    measure,
                    chronologicalDate,
                    genericDate,
                    renamedChronologicalDate,
                ],
                itemCache,
                mockIntlProp(),
            );
            const measureItems = getMeasureItems.resultFunc(
                [snapshotMeasure, probabilityMeasure],
                MEASURE_DESCRIPTIONS,
                MEASURE_SEQUENCE_NUMBERS,
                mockIntlProp(mockedTranslations),
            );

            const result = getBucketItemNames.resultFunc(attributeItems, measureItems);

            expect(result).toMatchSnapshot();
        });
    });
});
