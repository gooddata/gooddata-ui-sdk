// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { ATTRIBUTE, FACT, METRIC } from "../constants/bucket.js";
import { selectedDateDatasets } from "../tests/constants.test.helpers.js";
import { type IDecoratedBucketItem, type IRawBucket } from "../typings/buckets.js";
import { type ICatalogEntries } from "../typings/state_objects.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { buildBucketItem } from "./bucket_item.js";
import {
    EMPTY_BUCKET_LABEL,
    decoratedBucket as buildDecoratedBucket,
    decoratedBuckets as buildDecoratedBuckets,
} from "./decorated_bucket.js";

describe("Decorated Bucket", () => {
    const measures: ICatalogEntries = {
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
        "metric.aaeFKXFYiCc0": {
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
    const measuresBucket: IRawBucket = {
        localIdentifier: "measures",
        items: [
            buildBucketItem({
                attribute: "attr.account_details.retail_company",
                aggregation: "count",
                type: METRIC,
            }),
            buildBucketItem({
                attribute: "fact.spend_analysis.cart_additions",
                type: METRIC,
                aggregation: "sum",
            }),
            buildBucketItem({
                attribute: "aaeFKXFYiCc0",
                type: METRIC,
            }),
        ],
        totals: [],
    };
    const measuresUiSettings = {
        measures: {
            accepts: [METRIC, FACT, ATTRIBUTE],
            allowsDuplicateItems: true,
            enabled: true,
            allowsReordering: true,
            allowsSwapping: false,
            itemsLimit: 20,
            isShowInPercentEnabled: false,
        },
    };

    const attributeBucket = {
        localIdentifier: "location",
        items: [
            buildBucketItem({
                locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
                attribute: "attr.location.identifier",
                type: ATTRIBUTE,
                displayForms: [
                    {
                        title: "City",
                        ref: uriRef("/geo/attribute/displayform/uri/1"),
                        id: "/geo/attribute/displayform/uri/1",
                        uri: "/geo/attribute/displayform/uri/1",
                        type: "GDC.geo.pin",
                    },
                ],
            }),
        ],
    };

    const areaAttributeBucket = {
        localIdentifier: "area",
        items: [
            buildBucketItem({
                areaDisplayFormRef: uriRef("/geo/attribute/displayform/uri/area"),
                attribute: "attr.area.identifier",
                type: ATTRIBUTE,
                displayForms: [
                    {
                        title: "State",
                        ref: uriRef("/geo/attribute/displayform/uri/area-text"),
                        id: "/geo/attribute/displayform/uri/area-text",
                        uri: "/geo/attribute/displayform/uri/area-text",
                        type: "GDC.text",
                    },
                ],
            }),
        ],
    };

    const locationUiSettings = {
        location: {
            accepts: [ATTRIBUTE],
            allowsDuplicateItems: false,
            enabled: true,
            allowsReordering: false,
            allowsSwapping: true,
            itemsLimit: 1,
            canAddItems: true,
            isShowInPercentEnabled: false,
        },
    };

    const attributeItemCached: ICatalogEntries = {
        "attribute.attr.location.identifier": {
            dateType: undefined,
            dfIdentifier: "label.latlong.df",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15366",
            locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
            locationDisplayFormUri: "/geo/attribute/displayform/uri/1",
            locationDisplayFormIdentifier: "location.identifier",
            displayForms: [
                {
                    ref: uriRef("/geo/attribute/displayform/uri/1"),
                    uri: "/geo/attribute/displayform/uri/1",
                    id: "location.identifier",
                    title: "Location",
                    type: "GDC.geo.pin",
                },
            ],
            dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/15125",
            elementsUri: "/gdc/md/TeamOneGoodSales1/obj/15366/elements",
            granularity: "attr.location.identifier",
            id: "attr.location.identifier",
            identifier: "attr.location.identifier",
            isAvailable: true,
            summary: "",
            title: "location id",
            type: "attribute",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15365",
        },
        "attribute.attr.area.identifier": {
            dateType: undefined,
            dfIdentifier: "label.area.text",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/25366",
            areaDisplayFormRef: uriRef("/geo/attribute/displayform/uri/area"),
            areaDisplayFormUri: "/geo/attribute/displayform/uri/area",
            areaDisplayFormIdentifier: "area.identifier",
            displayForms: [
                {
                    ref: uriRef("/geo/attribute/displayform/uri/area-text"),
                    uri: "/geo/attribute/displayform/uri/area-text",
                    id: "area.text",
                    title: "Area text",
                    type: "GDC.text",
                },
            ],
            dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/25125",
            elementsUri: "/gdc/md/TeamOneGoodSales1/obj/25366/elements",
            granularity: "attr.area.identifier",
            id: "attr.area.identifier",
            identifier: "attr.area.identifier",
            isAvailable: true,
            summary: "",
            title: "area id",
            type: "attribute",
            uri: "/gdc/md/TeamOneGoodSales1/obj/25365",
        },
    };

    const decoratedMeasures = buildDecoratedBucket(
        {},
        measuresBucket,
        measures,
        selectedDateDatasets,
        measuresUiSettings,
        undefined,
        {},
        mockIntlProp(),
    );

    describe("decoratedBucket", () => {
        it("should decorate measures bucket", () => {
            decoratedMeasures.items.forEach((item: IDecoratedBucketItem) => {
                expect(item.isMeasure).toEqual(true);

                const aggregation = item.aggregation;
                const isAttribute = item.attribute?.type === "attribute";
                const type = aggregation ? (isAttribute ? "attribute" : "fact") : "metric";

                const itemIdentifier = `${type}.${item.attribute?.id}`;
                const expectedAttribute = measures[itemIdentifier];

                expect(item.attribute).toEqual(expectedAttribute);
            });
        });

        it("should pass the raw totals to the decorated bucket verbatim", () => {
            expect(decoratedMeasures.totals).toBe(measuresBucket.totals);
        });

        it("should use rules provided in UI settings", () => {
            const bucketWithUiConfig = buildDecoratedBucket(
                {},
                measuresBucket,
                measures,
                selectedDateDatasets,
                measuresUiSettings,
                undefined,
                {},
                mockIntlProp(),
            );

            expect(bucketWithUiConfig).toEqual(
                expect.objectContaining({
                    accepts: [METRIC, FACT, ATTRIBUTE],
                    allowsDuplicateItems: true,
                    enabled: true,
                    allowsReordering: true,
                    allowsSwapping: false,
                    itemsLimit: 20,
                }),
            );
        });

        it("should drop unknown uiConfig keys and fall back to defaults for undefined values (old Record semantics)", () => {
            const bucketWithUiConfig = buildDecoratedBucket(
                {},
                measuresBucket,
                measures,
                selectedDateDatasets,
                {
                    measures: {
                        accepts: [METRIC],
                        itemsLimit: undefined,
                        isShowInPercentEnabled: false,
                    },
                },
                undefined,
                {},
                mockIntlProp(),
            );

            expect(bucketWithUiConfig.itemsLimit).toBe(20);
            expect("isShowInPercentEnabled" in bucketWithUiConfig).toBe(false);
            expect(bucketWithUiConfig.title).toBe(EMPTY_BUCKET_LABEL);
            expect(bucketWithUiConfig.subtitle).toBe(EMPTY_BUCKET_LABEL);
        });

        it("should decorate location attribute", () => {
            const bucketWithUiConfig = buildDecoratedBucket(
                {},
                attributeBucket,
                attributeItemCached,
                selectedDateDatasets,
                locationUiSettings,
                undefined,
                {},
                mockIntlProp(),
                true,
                undefined,
                "location",
            );

            expect(bucketWithUiConfig.items[0].attribute).toEqual({
                dateType: undefined,
                dfIdentifier: "label.latlong.df",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/15366",
                dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/15125",
                elementsUri: "/gdc/md/TeamOneGoodSales1/obj/15366/elements",
                granularity: "attr.location.identifier",
                id: "attr.location.identifier",
                identifier: "attr.location.identifier",
                isAvailable: true,
                isLocationIconVisible: true,
                locationDisplayFormUri: "/geo/attribute/displayform/uri/1",
                locationDisplayFormIdentifier: "location.identifier",
                locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
                summary: "",
                title: "location id",
                type: "attribute",
                uri: "/gdc/md/TeamOneGoodSales1/obj/15365",
                displayForms: [
                    {
                        id: "location.identifier",
                        title: "Location",
                        ref: {
                            uri: "/geo/attribute/displayform/uri/1",
                        },
                        type: "GDC.geo.pin",
                        uri: "/geo/attribute/displayform/uri/1",
                    },
                ],
            });
        });

        it("should decorate area attribute using area metadata", () => {
            const bucketWithUiConfig = buildDecoratedBucket(
                {},
                areaAttributeBucket,
                attributeItemCached,
                selectedDateDatasets,
                locationUiSettings,
                undefined,
                {},
                mockIntlProp(),
                true,
                undefined,
                "area",
            );

            expect(bucketWithUiConfig.items[0].attribute.isLocationIconVisible).toEqual(true);
            // getAttribute's merge must plant a PLAIN ObjRef on the decorated item
            expect(bucketWithUiConfig.items[0].attribute.areaDisplayFormRef).toEqual(
                uriRef("/geo/attribute/displayform/uri/area"),
            );
        });
    });

    describe("decoratedBuckets", () => {
        it("should return buckets if they are falsey", () => {
            const falseyBuckets = buildDecoratedBuckets(undefined, null, null, null, null, {}, null);
            expect(falseyBuckets).toBeFalsy();
        });

        it("should return a plain array of decorated buckets", () => {
            const decorated = buildDecoratedBuckets(
                [measuresBucket],
                undefined,
                measures,
                selectedDateDatasets,
                measuresUiSettings,
                {},
                mockIntlProp(),
            );

            expect(Array.isArray(decorated)).toBe(true);
            expect(decorated).toHaveLength(1);
            expect(decorated[0].localIdentifier).toBe("measures");
            // the buckets container deliberately has no `original` — only each bucket does
            expect(decorated).not.toHaveProperty("original");
        });
    });

    describe("decoratedBucket original", () => {
        it("should keep the raw bucket verbatim on `original`", () => {
            expect(decoratedMeasures.original).toBe(measuresBucket);
        });
    });
});
