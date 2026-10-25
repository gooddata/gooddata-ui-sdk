// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal, idRef } from "@gooddata/sdk-model";
import { BucketNames, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { getMetricMDObject } from "../services/metadata_service.js";
import {
    type IBucket as IVisualizationObjectBucket,
    isVisualizationObjectAttribute,
    isVisualizationObjectMeasure,
} from "../typings/bear/bearTypes.js";
import { type IRawBucketItem } from "../typings/buckets.js";
import { type IDateDataset } from "../typings/datasets.js";
import { type ICatalogEntries } from "../typings/state_objects.js";

import { newDecoratedBucket } from "./decorated_bucket.js";
import { getAttribute, newDecoratedBucketItem } from "./decorated_bucket_item.js";
import { createDecoratedMetricAttributeFilter } from "./decorated_metric_attribute_filter.js";
import { GRANULARITY } from "./granularity.js";
import { type IBucketsToMetadataAdditionalData, bucketsToMetadata } from "./metadata.js";

/**
 * Risk-focused characterization of bucketsToMetadata over the decorated bucket models. What these
 * pin is the boundary behavior: nothing a decorated bucket carries may leak into the MD object in a
 * shape the downstream property reads cannot see.
 */
type MdBucketItem = IVisualizationObjectBucket["items"][number];

function measureOf(item: MdBucketItem) {
    if (!isVisualizationObjectMeasure(item)) {
        throw new Error("expected a measure bucket item");
    }
    return item.measure;
}

function attributeOf(item: MdBucketItem) {
    if (!isVisualizationObjectAttribute(item)) {
        throw new Error("expected an attribute bucket item");
    }
    return item.visualizationAttribute;
}

describe("bucketsToMetadata with plain decorated buckets", () => {
    const simpleMeasure = newDecoratedBucketItem({
        localIdentifier: "m1",
        isMeasure: true,
        aggregation: "sum",
        attribute: { type: "fact", ref: { uri: "/gdc/md/project/obj/1" } },
        measureAxisLabel: "Cart Additions (Sum)",
        format: "#,##0",
    });

    it("carries a computed attribute into the saved MD object by its own reference", () => {
        // What a dropped computed attribute looks like in the buckets: an ATTRIBUTE item flagged as
        // computed, whose dfRef is the fabricated display form - a ref of the COMPUTED ATTRIBUTE
        // type, because a computed attribute has no real labels.
        const computedAttributeRef = idRef("rep_performance", "computedAttribute");
        const computedAttributeItem = newDecoratedBucketItem({
            localIdentifier: "ca1",
            attribute: {
                type: "computedAttribute",
                identifier: "rep_performance",
                ref: computedAttributeRef,
                dfRef: computedAttributeRef,
            },
            original: {
                type: "attribute",
                attribute: "rep_performance",
                isComputedAttribute: true,
                dfRef: computedAttributeRef,
            },
        });

        const md = bucketsToMetadata([
            newDecoratedBucket({ localIdentifier: "view", items: [computedAttributeItem] }),
        ]);

        expect(md).toEqual([
            {
                localIdentifier: "view",
                items: [
                    {
                        visualizationAttribute: {
                            localIdentifier: "ca1",
                            displayForm: computedAttributeRef,
                        },
                    },
                ],
            },
        ]);
    });

    it("counts a computed attribute in a measure bucket by its own reference", () => {
        // The attribute -> measure fabric is unchanged: COUNT over the dropped item. Only the ref
        // differs - it carries the COMPUTED ATTRIBUTE type instead of the attribute one.
        const computedAttributeRef = idRef("rep_performance", "computedAttribute");
        const countedComputedAttribute = newDecoratedBucketItem({
            localIdentifier: "m1",
            isMeasure: true,
            aggregation: "count",
            format: "#,##0",
            attribute: {
                type: "computedAttribute",
                identifier: "rep_performance",
                ref: computedAttributeRef,
                dfRef: computedAttributeRef,
            },
            original: {
                type: "metric",
                attribute: "rep_performance",
                aggregation: "count",
                isComputedAttribute: true,
            },
        });

        const md = bucketsToMetadata([
            newDecoratedBucket({ localIdentifier: "measures", items: [countedComputedAttribute] }),
        ]);

        expect(md).toEqual([
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "",
                            format: "#,##0",
                            definition: {
                                measureDefinition: {
                                    item: computedAttributeRef,
                                    aggregation: "count",
                                },
                            },
                        },
                    },
                ],
            },
        ]);
    });

    it("produces the measure MD object as a fully plain structure (no additionalData path)", () => {
        const buckets = [newDecoratedBucket({ localIdentifier: "measures", items: [simpleMeasure] })];

        const md = bucketsToMetadata(buckets);

        expect(md).toEqual([
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: { uri: "/gdc/md/project/obj/1" },
                                    aggregation: "sum",
                                },
                            },
                            title: "Cart Additions (Sum)",
                            format: "#,##0",
                        },
                    },
                ],
            },
        ]);
    });

    it("drops empty buckets and copies the raw totals through the boundary", () => {
        const rawTotals = [{ type: "sum" }] as ITotal[];
        const buckets = [
            newDecoratedBucket({ localIdentifier: "measures", items: [simpleMeasure], totals: rawTotals }),
            newDecoratedBucket({ localIdentifier: "empty", items: [] }),
        ];

        const md = bucketsToMetadata(buckets);

        expect(md.length).toBe(1);
        expect(md[0].totals).toEqual([{ type: "sum" }]);
    });

    it("resolves the fiscal-year PoP attribute from the plain decorated buckets stored in additionalData", () => {
        const dateDatasetRef = { uri: "/gdc/md/project/obj/dd1" };
        const yearRef = { uri: "/gdc/md/project/obj/year" };
        const fiscalYearRef = { uri: "/gdc/md/project/obj/fiscal-year" };

        const popMeasure = newDecoratedBucketItem({
            localIdentifier: "m1_pop",
            isMeasure: true,
            isDerived: true,
            original: {
                localIdentifier: "m1_pop",
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
        });
        // a date item whose RAW granularity is fiscal — read through item.original by
        // usesFiscalGranularity, which iterates the decorated buckets inside additionalData
        const fiscalDateItem = newDecoratedBucketItem({
            localIdentifier: "date1",
            isDate: true,
            original: { granularity: GRANULARITY.FISCAL_YEAR },
        });

        const buckets = [
            newDecoratedBucket({ localIdentifier: "measures", items: [popMeasure] }),
            newDecoratedBucket({ localIdentifier: "attribute", items: [fiscalDateItem] }),
        ];

        const additionalData: IBucketsToMetadataAdditionalData = {
            dateFilterDateDatasetRef: dateDatasetRef,
            dateDatasets: {
                unavailable: 0,
                available: [
                    {
                        ref: dateDatasetRef,
                        attributes: [
                            { dateType: GRANULARITY.YEAR, ref: yearRef },
                            { dateType: GRANULARITY.FISCAL_YEAR, ref: fiscalYearRef },
                        ],
                    } as unknown as IDateDataset,
                ],
            },
            usedDateDatasets: { used: [] },
            activeCalendars: { fiscal: true, standard: true, default: "STANDARD" },
        };

        const md = bucketsToMetadata(buckets, additionalData);
        const popDefinition = measureOf(md[0].items[0]).definition;

        expect(popDefinition).toEqual({
            popMeasureDefinition: {
                measureIdentifier: "m1",
                popAttribute: fiscalYearRef,
            },
        });
    });

    it("falls back to the standard year PoP attribute when no bucket uses fiscal granularity", () => {
        const dateDatasetRef = { uri: "/gdc/md/project/obj/dd1" };
        const yearRef = { uri: "/gdc/md/project/obj/year" };
        const fiscalYearRef = { uri: "/gdc/md/project/obj/fiscal-year" };

        const popMeasure = newDecoratedBucketItem({
            localIdentifier: "m1_pop",
            isMeasure: true,
            isDerived: true,
            original: {
                localIdentifier: "m1_pop",
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
        });
        const standardDateItem = newDecoratedBucketItem({
            localIdentifier: "date1",
            isDate: true,
            original: { granularity: GRANULARITY.YEAR },
        });

        const buckets = [
            newDecoratedBucket({ localIdentifier: "measures", items: [popMeasure] }),
            newDecoratedBucket({ localIdentifier: "attribute", items: [standardDateItem] }),
        ];

        const additionalData: IBucketsToMetadataAdditionalData = {
            dateFilterDateDatasetRef: dateDatasetRef,
            dateDatasets: {
                unavailable: 0,
                available: [
                    {
                        ref: dateDatasetRef,
                        attributes: [
                            { dateType: GRANULARITY.YEAR, ref: yearRef },
                            { dateType: GRANULARITY.FISCAL_YEAR, ref: fiscalYearRef },
                        ],
                    } as unknown as IDateDataset,
                ],
            },
            usedDateDatasets: { used: [] },
            activeCalendars: { fiscal: true, standard: true, default: "STANDARD" },
        };

        const md = bucketsToMetadata(buckets, additionalData);

        expect(measureOf(md[0].items[0]).definition).toMatchObject({
            popMeasureDefinition: { popAttribute: yearRef },
        });
    });

    it("getMetricMDObject returns a fully plain MD object", () => {
        const mdObject = getMetricMDObject(simpleMeasure);

        // the MD object must survive a JSON round trip unchanged, all the way down
        expect(JSON.parse(JSON.stringify(mdObject))).toEqual(mdObject);
        expect(mdObject.buckets).toEqual([
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: { uri: "/gdc/md/project/obj/1" },
                                    aggregation: "sum",
                                },
                            },
                            title: "Cart Additions (Sum)",
                            format: "#,##0",
                        },
                    },
                ],
            },
        ]);
    });

    // measureFilterToMd reads displayFormRef out of the RAW filter (`filter.original`) and compares
    // it against `filter.attribute`, the itemCache entry. The primary display form must exist,
    // otherwise the comparison short-circuits and the by-title branch is never reached.
    it("converts a measure attribute filter selecting elements by title for a non-primary display form", () => {
        const primaryDfRef = { uri: "/gdc/md/project/obj/df-primary" };
        const secondaryDfRef = { uri: "/gdc/md/project/obj/df-secondary" };

        const filteredMeasure = newDecoratedBucketItem({
            localIdentifier: "m1",
            isMeasure: true,
            aggregation: "sum",
            attribute: { type: "fact", ref: { uri: "/gdc/md/project/obj/1" } },
            filters: [
                createDecoratedMetricAttributeFilter(
                    {
                        localIdentifier: "f1",
                        attribute: "attr1",
                        displayFormRef: secondaryDfRef,
                        isInverted: false,
                        totalElementsCount: 2,
                        selectedElements: [{ uri: "/elem/1", title: "Element 1" }],
                    },
                    {
                        "attribute.attr1": {
                            displayForms: [
                                {
                                    isPrimary: true,
                                    ref: primaryDfRef,
                                    id: "df.primary",
                                    uri: "/df/1",
                                    title: "P",
                                },
                                {
                                    isPrimary: false,
                                    ref: secondaryDfRef,
                                    id: "df.secondary",
                                    uri: "/df/2",
                                    title: "S",
                                },
                            ],
                        },
                    },
                ),
            ],
        });

        const md = bucketsToMetadata([
            newDecoratedBucket({ localIdentifier: "measures", items: [filteredMeasure] }),
        ]);

        // a non-primary display form selects elements by TITLE, the primary one by URI
        expect(measureOf(md[0].items[0]).definition).toEqual({
            measureDefinition: {
                item: { uri: "/gdc/md/project/obj/1" },
                aggregation: "sum",
                filters: [
                    {
                        positiveAttributeFilter: {
                            localIdentifier: "f1",
                            displayForm: secondaryDfRef,
                            in: ["Element 1"],
                        },
                    },
                ],
            },
        });
    });

    // The geo AREA drag decorates extended-reference-point buckets (getDecoratedBucketsExtended):
    // getAttribute copies areaDisplayFormRef off the raw item onto the cache entry, and nothing
    // normalizes the MD object afterwards. A wrong-shaped ref surviving decoration loses its
    // identifier to the property reads downstream, and the execution AFM then goes out as
    // `{"identifier":{"type":"label"}}`.
    it("carries the geo area display-form ref through decoration with its identifier intact", () => {
        const areaDfRef = idRef("customer_country.customer_country_code_1", "displayForm");
        const erpItem: IRawBucketItem = {
            localIdentifier: "a1",
            type: "attribute",
            attribute: "customer_country",
            areaDisplayFormRef: areaDfRef,
        };
        const itemCache: ICatalogEntries = {
            "attribute.customer_country": {
                type: "attribute",
                identifier: "customer_country",
                ref: { identifier: "customer_country", type: "attribute" },
                displayForms: [],
            },
        };

        const attribute = getAttribute(erpItem, itemCache);
        const areaAttribute = newDecoratedBucketItem({
            localIdentifier: "a1",
            attribute,
            original: erpItem,
        });

        const md = bucketsToMetadata([
            newDecoratedBucket({ localIdentifier: BucketNames.AREA, items: [areaAttribute] }),
        ]);

        const displayForm = attributeOf(md[0].items[0]).displayForm;
        expect(displayForm).toEqual(areaDfRef);
    });
});
