// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDateRangeParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { LOCAL_TABLE } from "../constants/visualization_types.js";
import { prepareForComparison } from "../selectors/save_report_selector.js";
import { type IDateFilter } from "../store/filter_bar/filter_bar_types.js";
import { dateCreated } from "../tests/constants.test.helpers.js";
import {
    type IVisualizationObjectContent,
    type IVisualizationObjectParameterizedDateFilter,
    type VisualizationObjectExtendedFilter,
} from "../typings/bear/bearTypes.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type IDecoratedBuckets } from "../typings/buckets.js";
import { type IReportContent } from "../typings/report.js";

import { type IDecoratedDateDatasetMeta } from "./date_dataset.js";
import { createDecoratedDateFilter } from "./date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "./date_item.js";
import {
    type IAdditionalData,
    bucketsToMetadata,
    filtersToMetadata,
    metadataToBuckets,
    normalizeEmptyDateValuesFilters,
} from "./metadata.js";
import { itemCache } from "./metadata.test.helpers.js";

const dateDatasets = { available: [dateCreated], unavailable: 0 };
const dataSet = { identifier: dateCreated.identifier };
const amountRef = idRef("amount", "measure");

function period(
    id: string,
    granularity: "GDC.time.month" | "GDC.time.week",
): IDateRangeParameterMetadataObject {
    return {
        type: "parameter",
        id,
        uri: `/${id}`,
        ref: idRef(id, "parameter"),
        title: id,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "DATE_RANGE", defaultValue: { granularity, from: "2025-08" } },
    };
}

const additionalData = (dateRangeParameters: IDateRangeParameterMetadataObject[] = []): IAdditionalData =>
    ({
        itemCache,
        dateDatasets,
        filterItems: {},
        properties: { controls: {} },
        dateRangeParameters,
    }) as unknown as IAdditionalData;

const stored = (
    body: Partial<IVisualizationObjectParameterizedDateFilter["parameterizedDateFilter"]> = {},
): IVisualizationObjectParameterizedDateFilter => ({
    parameterizedDateFilter: {
        localIdentifier: "period-filter",
        dataSet,
        parameter: { identifier: "lastQuarter" },
        ...body,
    },
});

const derivedMeasureBucket = {
    localIdentifier: "measures",
    items: [
        {
            measure: {
                localIdentifier: "m1",
                definition: { measureDefinition: { item: amountRef } },
            },
        },
        {
            measure: {
                localIdentifier: "m1_pop",
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: "m1",
                        popAttribute: dateCreated.attributes[0].dfRef,
                    },
                },
            },
        },
    ],
};

function readFilters(
    filters: VisualizationObjectExtendedFilter[],
    dateRangeParameters: IDateRangeParameterMetadataObject[] = [],
    buckets: unknown[] = [],
) {
    return metadataToBuckets({
        metadataObject: { buckets, filters } as unknown as IVisualizationObjectContent,
        additionalData: additionalData(dateRangeParameters),
    }).filters;
}

function readMeasureFilters(
    filters: VisualizationObjectExtendedFilter[],
    dateRangeParameters: IDateRangeParameterMetadataObject[] = [],
) {
    const { buckets } = metadataToBuckets({
        metadataObject: {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: amountRef, filters } },
                            },
                        },
                    ],
                },
            ],
        } as unknown as IVisualizationObjectContent,
        additionalData: additionalData(dateRangeParameters),
    });
    return buckets[0].items[0].filters as IBucketItemMetricFilter[];
}

function writeMeasureFilters(filters: IBucketItemMetricFilter[]) {
    const decoratedBuckets = [
        {
            localIdentifier: "measures",
            items: [
                {
                    localIdentifier: "m1",
                    isMeasure: true,
                    attribute: { ref: amountRef, type: "metric", identifier: "amount" },
                    filters: filters.map((filter) =>
                        createDecoratedDateFilter(filter, {
                            ref: dateCreated.ref,
                        } as IDecoratedDateDatasetMeta),
                    ),
                },
            ],
        },
    ] as unknown as IDecoratedBuckets;
    const [bucket] = bucketsToMetadata(decoratedBuckets);
    return (bucket.items[0] as { measure: { definition: { measureDefinition: { filters?: unknown[] } } } })
        .measure.definition.measureDefinition.filters;
}

function reportContent(
    filters: VisualizationObjectExtendedFilter[],
    metricFilters?: unknown[],
): IReportContent {
    return {
        visualizationClass: { uri: LOCAL_TABLE },
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: amountRef,
                                    ...(metricFilters ? { filters: metricFilters } : {}),
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters,
    } as unknown as IReportContent;
}

describe("a filter bar date filter with a period", () => {
    describe("metadataToBuckets", () => {
        it("reads the period with the granularity the catalog knows and the stored local identifier", () => {
            const [filter] = readFilters(
                [stored({ emptyValueHandling: "exclude" })],
                [period("lastQuarter", "GDC.time.month")],
            );

            expect(filter).toMatchObject({
                type: "date",
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                dateDatasetRef: { identifier: dateCreated.identifier, type: "dataSet" },
                emptyDateValuesFilter: "exclude",
                filterConfig: {
                    type: "parameterized",
                    parameterRef: idRef("lastQuarter", "parameter"),
                    granularity: "GDC.time.month",
                    localIdentifier: "period-filter",
                },
            });
        });

        it("reads a period's week as the week attribute's granularity", () => {
            const [filter] = readFilters([stored()], [period("lastQuarter", "GDC.time.week")]);

            expect((filter as IDateFilter).filterConfig).toMatchObject({ granularity: "GDC.time.week_us" });
        });

        it("reads a period that is not in the catalog without a granularity", () => {
            const [filter] = readFilters([stored()]);

            expect((filter as IDateFilter).filterConfig).toEqual({
                type: "parameterized",
                parameterRef: idRef("lastQuarter", "parameter"),
                localIdentifier: "period-filter",
            });
        });

        it("keeps the comparison of a saved derived metric, as a date filter with a range does", () => {
            const [period] = readFilters([stored()], [], [derivedMeasureBucket]);
            const [range] = readFilters(
                [{ relativeDateFilter: { dataSet, granularity: "GDC.time.year", from: -1, to: -1 } }],
                [],
                [derivedMeasureBucket],
            );

            // with "nothing" the chart's configuration drops the saved derived metric on the first render
            expect(range).toMatchObject({ overTimeComparisonType: "same_period_previous_year" });
            expect(period).toMatchObject({ overTimeComparisonType: "same_period_previous_year" });
        });

        it("takes the mode of a legacy empty values attribute filter on the same date data set", () => {
            const filters = readFilters([
                {
                    parameterizedDateFilter: {
                        dataSet: dateCreated.ref,
                        parameter: { identifier: "lastQuarter" },
                    },
                },
                { negativeAttributeFilter: { displayForm: dateCreated.attributes[0].dfRef, notIn: [""] } },
            ]);

            expect(filters).toHaveLength(1);
            expect(filters[0]).toMatchObject({ emptyDateValuesFilter: "exclude" });
        });
    });

    describe("filtersToMetadata", () => {
        it.each([
            ["with the empty values handling setting", true],
            ["with the legacy empty values filter", false],
        ])("writes the stored filter back unchanged %s", (_, useEmptyValueHandling) => {
            const filters = readFilters(
                [stored({ emptyValueHandling: "include" })],
                [period("lastQuarter", "GDC.time.month")],
            );

            expect(filtersToMetadata(filters, {}, dateDatasets, useEmptyValueHandling)).toEqual([
                {
                    parameterizedDateFilter: {
                        localIdentifier: "period-filter",
                        dataSet: idRef(dateCreated.identifier, "dataSet"),
                        parameter: idRef("lastQuarter", "parameter"),
                        emptyValueHandling: "include",
                    },
                },
            ]);
        });

        it("writes no local identifier when the stored filter has none", () => {
            const filters = readFilters([stored({ localIdentifier: undefined })]);

            expect(filtersToMetadata(filters, {}, dateDatasets, true)).toEqual([
                {
                    parameterizedDateFilter: {
                        dataSet: idRef(dateCreated.identifier, "dataSet"),
                        parameter: idRef("lastQuarter", "parameter"),
                    },
                },
            ]);
        });
    });

    it("compares equal to the stored visualization after it is opened", () => {
        const storedFilters = [stored({ emptyValueHandling: "exclude" })];
        const written = filtersToMetadata(readFilters(storedFilters), {}, dateDatasets, false);

        expect(prepareForComparison(reportContent(written), { dateDatasets })).toEqual(
            prepareForComparison(reportContent(storedFilters), { dateDatasets }),
        );
    });
});

describe("a metric date filter with a period", () => {
    // the metric's date filter writes the ref of the date data set its dimension resolves to
    const storedOnMetric = (body: Parameters<typeof stored>[0] = {}) =>
        stored({ dataSet: dateCreated.ref, ...body });

    it("reads the period as the metric filter's interval", () => {
        const [filter] = readMeasureFilters(
            [storedOnMetric({ emptyValueHandling: "only" })],
            [period("lastQuarter", "GDC.time.month")],
        );

        expect(filter).toMatchObject({
            attribute: DATE_DATASET_ATTRIBUTE,
            dimension: dateCreated.identifier,
            emptyDateValuesFilter: "only",
            interval: {
                type: "parameterized",
                parameterRef: idRef("lastQuarter", "parameter"),
                granularity: "GDC.time.month",
                localIdentifier: "period-filter",
            },
        });
    });

    it("writes the stored filter back unchanged", () => {
        const written = writeMeasureFilters(
            readMeasureFilters([storedOnMetric({ emptyValueHandling: "exclude" })]),
        );

        expect(written).toEqual([
            {
                parameterizedDateFilter: {
                    localIdentifier: "period-filter",
                    dataSet: dateCreated.ref,
                    parameter: idRef("lastQuarter", "parameter"),
                    emptyValueHandling: "exclude",
                },
            },
        ]);
    });

    it("compares equal to the stored visualization after it is opened", () => {
        const storedFilters = [storedOnMetric({ emptyValueHandling: "exclude" })];
        const written = writeMeasureFilters(readMeasureFilters(storedFilters));

        expect(prepareForComparison(reportContent([], written))).toEqual(
            prepareForComparison(reportContent([], storedFilters)),
        );
    });
});

describe("normalizeEmptyDateValuesFilters with a period", () => {
    // the period writer keeps include whether the filter bar's writer keeps it with a period or not
    it.each([true, false])("keeps the stored mode, include too (include kept with a period: %s)", (kept) => {
        expect(
            normalizeEmptyDateValuesFilters([stored({ emptyValueHandling: "include" })], dateDatasets, kept),
        ).toEqual([stored({ emptyValueHandling: "include" })]);
    });

    it("folds a legacy empty values attribute filter into the period", () => {
        expect(
            normalizeEmptyDateValuesFilters(
                [
                    stored({ dataSet: dateCreated.ref }),
                    { positiveAttributeFilter: { displayForm: dateCreated.attributes[0].dfRef, in: [""] } },
                ],
                dateDatasets,
                true,
            ),
        ).toEqual([stored({ dataSet: dateCreated.ref, emptyValueHandling: "only" })]);
    });
});
