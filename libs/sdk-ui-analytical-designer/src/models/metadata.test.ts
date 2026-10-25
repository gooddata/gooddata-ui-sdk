// (C) 2021-2026 GoodData Corporation

/** Other use cases are covered in `metadata_legacy.test.ts`. */
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { dateCreated } from "../tests/constants.test.helpers.js";
import { type IVisualizationObjectContent } from "../typings/bear/bearTypes.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type IDecoratedBuckets } from "../typings/buckets.js";
import { type IDecoratedMetricFilter } from "../typings/measure_filters.js";

import { type IDecoratedDateDatasetMeta } from "./date_dataset.js";
import { createDecoratedDateFilter } from "./date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "./date_item.js";
import {
    type IAdditionalData,
    bucketsToMetadata,
    filtersToMetadata,
    findItemInCache,
    metadataToBuckets,
} from "./metadata.js";
import {
    itemCache,
    visualizationWithAttributeWithoutCachedDisplayForms,
    visualizationWithNonDefaultSupportedDisplayForm,
    visualizationWithNonDefaultSupportedDisplayFormOfDateItem,
    visualizationWithNonDefaultUnsupportedDisplayForm,
} from "./metadata.test.helpers.js";

const defaultDateDatasets = {
    available: [dateCreated],
    unavailable: 1,
};
const defaultProperties = { controls: {} };
const defaultAdditionalData = {
    itemCache,
    dateDatasets: defaultDateDatasets,
    filterItems: {},
    properties: defaultProperties,
    enableDuplicatedLabelValuesInAttributeFilter: false,
} as unknown as IAdditionalData;

describe("metadata", () => {
    describe("metadataToBuckets", () => {
        it("should preserve non default attribute bucket item display form if it is supported", () => {
            const { buckets } = metadataToBuckets({
                metadataObject: visualizationWithNonDefaultSupportedDisplayForm.visualizationObject.content,
                additionalData: defaultAdditionalData,
            });
            expect(buckets).toMatchSnapshot();
        });

        it("should not preserve non default attribute bucket item display form if it is not supported", () => {
            const { buckets } = metadataToBuckets({
                metadataObject: visualizationWithNonDefaultUnsupportedDisplayForm.visualizationObject.content,
                additionalData: defaultAdditionalData,
            });
            expect(buckets).toMatchSnapshot();
        });

        it("should preserve non default date attribute bucket item display form", () => {
            const { buckets } = metadataToBuckets({
                metadataObject:
                    visualizationWithNonDefaultSupportedDisplayFormOfDateItem.visualizationObject.content,
                additionalData: defaultAdditionalData,
            });
            expect(buckets).toMatchSnapshot();
        });

        it("should fall back to the default display form when the cached attribute has no displayForms", () => {
            const { buckets } = metadataToBuckets({
                metadataObject:
                    visualizationWithAttributeWithoutCachedDisplayForms.visualizationObject.content,
                additionalData: defaultAdditionalData,
            });
            expect(buckets[0].items[0]["displayForm"]).toEqual({ uri: "/gdc/md/project/obj/no_df_list" });
        });

        it("should preserve multiple measure value filter conditions", () => {
            const metadataObject: IVisualizationObjectContent = {
                visualizationClass: { uri: "/gdc/md/p/obj/vc" },
                buckets: [],
                filters: [
                    {
                        measureValueFilter: {
                            measure: { localIdentifier: "m1" },
                            conditions: [
                                { comparison: { operator: "GREATER_THAN", value: 10 } },
                                { range: { operator: "BETWEEN", from: 20, to: 30 } },
                            ],
                        },
                    },
                ],
            };

            const { filters } = metadataToBuckets({ metadataObject, additionalData: defaultAdditionalData });

            expect(filters).toHaveLength(1);
            expect(filters[0]).toMatchObject({
                type: "measure",
                measureLocalIdentifier: "m1",
                conditions: [
                    { comparison: { operator: "GREATER_THAN", value: 10 } },
                    { range: { operator: "BETWEEN", from: 20, to: 30 } },
                ],
            });
        });
    });

    describe("computed attribute measures", () => {
        // a computed attribute dropped in a measure bucket becomes COUNT(<computed attribute>) - the
        // same fabric a plain attribute gets, with the computed attribute type on the ref
        const countOverComputedAttribute: IVisualizationObjectContent = {
            visualizationClass: { uri: "/gdc/md/p/obj/vc" },
            buckets: [
                {
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                title: "Count of Rep Performance",
                                definition: {
                                    measureDefinition: {
                                        item: idRef("rep_performance", "computedAttribute"),
                                        aggregation: "count",
                                    },
                                },
                            },
                        },
                    ],
                    localIdentifier: "measures",
                },
            ],
            filters: [],
        };

        it("should restore the computed attribute flag when reopening a saved insight", () => {
            const { buckets } = metadataToBuckets({
                metadataObject: countOverComputedAttribute,
                additionalData: defaultAdditionalData,
            });

            expect(buckets[0].items[0]).toMatchObject({
                type: "metric",
                aggregation: "count",
                attribute: "rep_performance",
                isComputedAttribute: true,
            });
        });

        it("should resolve the computed attribute even when an attribute shares its identifier", () => {
            // the itemCache holds BOTH `attribute.rep_performance` and
            // `computedAttribute.rep_performance`; only the saved ref's own type can break the tie
            const { buckets } = metadataToBuckets({
                metadataObject: countOverComputedAttribute,
                additionalData: defaultAdditionalData,
            });

            expect(buckets[0].items[0]).toMatchObject({
                attribute: "rep_performance",
                isComputedAttribute: true,
            });
        });

        it("should not flag a count over a plain attribute", () => {
            const { buckets } = metadataToBuckets({
                metadataObject: {
                    ...countOverComputedAttribute,
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1068",
                                                },
                                                aggregation: "count",
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                additionalData: defaultAdditionalData,
            });

            expect(buckets[0].items[0]).toMatchObject({
                attribute: "attr.opportunity.id",
            });
            expect(buckets[0].items[0]["isComputedAttribute"]).toBeUndefined();
        });
    });

    describe("filtersToMetadata", () => {
        it("should preserve a computed attribute ref in a saved filter", () => {
            const computedAttributeRef = idRef("rep_performance", "computedAttribute");

            expect(
                filtersToMetadata([
                    {
                        type: "attribute",
                        localIdentifier: "repPerformanceFilter",
                        cacheItemIdentifier: "rep_performance",
                        displayFormRef: computedAttributeRef,
                        filterConfig: {
                            isInverted: false,
                            selectedElements: [{ title: "High", uri: "High" }],
                            totalElementsCount: 3,
                        },
                    },
                ]),
            ).toEqual([
                {
                    positiveAttributeFilter: {
                        localIdentifier: "repPerformanceFilter",
                        displayForm: computedAttributeRef,
                        in: ["High"],
                    },
                },
            ]);
        });
    });
});

describe("metric date filter empty date values mode", () => {
    const amountRef = idRef("amount", "measure");
    const storedMetricDateFilter = (filter: Partial<IBucketItemMetricFilter>) =>
        createDecoratedDateFilter(
            { attribute: DATE_DATASET_ATTRIBUTE, dimension: dateCreated.identifier, ...filter },
            { ref: dateCreated.ref } as IDecoratedDateDatasetMeta,
        );
    const measureBuckets = (filters: IDecoratedMetricFilter[]) =>
        [
            {
                localIdentifier: "measures",
                items: [
                    {
                        localIdentifier: "m1",
                        isMeasure: true,
                        attribute: { ref: amountRef, type: "metric", identifier: "amount" },
                        filters,
                    },
                ],
            },
        ] as unknown as IDecoratedBuckets;
    const measureFilters = (buckets: ReturnType<typeof bucketsToMetadata>) =>
        (buckets[0].items[0] as { measure: { definition: { measureDefinition: { filters?: unknown[] } } } })
            .measure.definition.measureDefinition.filters;

    describe("bucketsToMetadata", () => {
        it("writes only on All time as the real All time filter carrying the mode", () => {
            const buckets = bucketsToMetadata(
                measureBuckets([
                    storedMetricDateFilter({ interval: { name: "all_time" }, emptyDateValuesFilter: "only" }),
                ]),
            );

            expect(measureFilters(buckets)).toEqual([
                {
                    relativeDateFilter: {
                        dataSet: dateCreated.ref,
                        granularity: "ALL_TIME_GRANULARITY",
                        from: 0,
                        to: 0,
                        emptyValueHandling: "only",
                    },
                },
            ]);
        });

        it("writes exclude on a period as the date filter's emptyValueHandling", () => {
            const buckets = bucketsToMetadata(
                measureBuckets([
                    storedMetricDateFilter({
                        interval: { granularity: "GDC.time.year", interval: [-1, -1], name: "last_year" },
                        emptyDateValuesFilter: "exclude",
                    }),
                ]),
            );

            expect(measureFilters(buckets)).toEqual([
                {
                    relativeDateFilter: {
                        dataSet: dateCreated.ref,
                        granularity: "GDC.time.year",
                        from: -1,
                        to: -1,
                        emptyValueHandling: "exclude",
                    },
                },
            ]);
        });

        it("keeps the bare All time shape without a mode", () => {
            const buckets = bucketsToMetadata(
                measureBuckets([storedMetricDateFilter({ interval: { name: "all_time" } })]),
            );

            expect(measureFilters(buckets)).toEqual([
                { relativeDateFilter: { dataSet: dateCreated.ref, granularity: "GDC.time.year" } },
            ]);
        });
    });

    describe("metadataToBuckets", () => {
        const readMeasureFilters = (filters: unknown[]) => {
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
                additionalData: defaultAdditionalData,
            });
            return buckets[0].items[0].filters as IBucketItemMetricFilter[];
        };

        it("reads the All time filter carrying a mode as All time with the mode", () => {
            const filters = readMeasureFilters([
                {
                    relativeDateFilter: {
                        dataSet: dateCreated.ref,
                        granularity: "ALL_TIME_GRANULARITY",
                        from: 0,
                        to: 0,
                        emptyValueHandling: "only",
                    },
                },
            ]);

            expect(filters).toHaveLength(1);
            expect(filters[0]).toMatchObject({
                attribute: DATE_DATASET_ATTRIBUTE,
                interval: { name: "all_time" },
                emptyDateValuesFilter: "only",
            });
        });

        it("reads emptyValueHandling of a relative period together with the period", () => {
            const filters = readMeasureFilters([
                {
                    relativeDateFilter: {
                        dataSet: dateCreated.ref,
                        granularity: "GDC.time.year",
                        from: -1,
                        to: -1,
                        emptyValueHandling: "exclude",
                    },
                },
            ]);

            expect(filters[0]).toMatchObject({
                interval: { granularity: "GDC.time.year", interval: [-1, -1] },
                emptyDateValuesFilter: "exclude",
            });
        });

        it("keeps the boundedFilter of a to date metric filter", () => {
            const boundedFilter = { to: 0, granularity: "GDC.time.date" };
            const filters = readMeasureFilters([
                {
                    relativeDateFilter: {
                        dataSet: dateCreated.ref,
                        granularity: "GDC.time.year",
                        from: 0,
                        to: 0,
                        boundedFilter,
                    },
                },
            ]);

            expect(filters[0].interval).toMatchObject({
                granularity: "GDC.time.year",
                interval: [0, 0],
                boundedFilter,
            });
        });

        it("round-trips a to date metric filter without losing the boundedFilter", () => {
            const boundedFilter = { to: 0, granularity: "GDC.time.date" };
            const stored = {
                relativeDateFilter: {
                    dataSet: dateCreated.ref,
                    granularity: "GDC.time.year",
                    from: 0,
                    to: 0,
                    boundedFilter,
                },
            };
            const [loaded] = readMeasureFilters([stored]);

            const buckets = bucketsToMetadata(
                measureBuckets([
                    createDecoratedDateFilter(loaded, { ref: dateCreated.ref } as IDecoratedDateDatasetMeta),
                ]),
            );

            expect(measureFilters(buckets)).toEqual([stored]);
        });

        it("leaves a metric's single empty string attribute filter an ordinary attribute filter", () => {
            // unlike the insight level, a metric has no legacy representation of the mode: such a filter
            // is one of its additional date filters
            const filters = readMeasureFilters([
                { relativeDateFilter: { dataSet: dateCreated.ref, granularity: "GDC.time.year" } },
                {
                    negativeAttributeFilter: {
                        displayForm: dateCreated.attributes[0].dfRef,
                        notIn: [""],
                    },
                },
            ]);

            expect(filters).toHaveLength(2);
            expect(filters[0]).not.toHaveProperty("emptyDateValuesFilter");
        });
    });
});

describe("findItemInCache computed attribute disambiguation", () => {
    // A regular attribute and a computed attribute may share an identifier. Callers that resolve a
    // SAVED display form ref address both as `attribute.<id>`, so the ref's object type is the only
    // thing that says which was meant - drop it and a computed-attribute filter silently re-binds
    // to the regular attribute on reload (wrong title, wrong elements, drift written back on save).
    const itemCache = {
        "attribute.shared": {
            type: "attribute" as const,
            identifier: "shared",
            dfIdentifier: "shared.df",
            title: "Regular attribute",
            ref: idRef("shared", "attribute"),
            uri: "",
        },
        "computedAttribute.shared": {
            type: "computedAttribute" as const,
            identifier: "shared",
            dfIdentifier: "shared.df",
            title: "Computed attribute",
            ref: idRef("shared", "computedAttribute"),
            uri: "",
        },
    };

    it("should resolve a computed attribute ref to the computed attribute entry", () => {
        const found = findItemInCache("attribute.shared.df", itemCache, idRef("shared", "computedAttribute"));

        expect(found?.title).toEqual("Computed attribute");
    });

    it("should resolve a display form ref to the regular attribute entry", () => {
        const found = findItemInCache("attribute.shared.df", itemCache, idRef("shared.df", "displayForm"));

        expect(found?.title).toEqual("Regular attribute");
    });

    it("should keep preferring the regular attribute when no ref is available", () => {
        // callers that genuinely only have an identifier must not change behaviour
        expect(findItemInCache("attribute.shared.df", itemCache)?.title).toEqual("Regular attribute");
    });
});
