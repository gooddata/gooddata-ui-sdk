// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newDecoratedBucketItem } from "../models/decorated_bucket_item.js";
import { type IVisualizationObjectContentForAvailability } from "../models/metadata.js";
import { awarenessMetric } from "../tests/constants.test.helpers.js";

import { getMetricMDObject } from "./metadata_service.js";

describe("getMetricMDObject", () => {
    const expectedMetricMDObject: IVisualizationObjectContentForAvailability = {
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                                    },
                                },
                            },
                            title: "Metric",
                            localIdentifier: "m1",
                            format: awarenessMetric.format,
                        },
                    },
                ],
            },
        ],
    };

    it("should return generated md object for given metric", () => {
        const metric = newDecoratedBucketItem({
            ...awarenessMetric,
            attribute: awarenessMetric,
            measureAxisLabel: "Metric",
            localIdentifier: "m1",
            original: {},
        });

        expect(getMetricMDObject(metric)).toEqual(expectedMetricMDObject);
    });

    it("should ignore showInPercent", () => {
        const metric = newDecoratedBucketItem({
            ...awarenessMetric,
            attribute: awarenessMetric,
            measureAxisLabel: "Metric",
            localIdentifier: "m1",
            showInPercent: true,
            original: {},
        });

        expect(getMetricMDObject(metric)).toEqual(expectedMetricMDObject);
    });
});
