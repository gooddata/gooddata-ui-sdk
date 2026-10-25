// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getDerivedBucketItems } from "../utils/buckets.js";

describe("Buckets", () => {
    it("should return a list of all derived buckets", () => {
        const buckets = [
            {
                localIdentifier: "measures",
                items: [
                    {
                        type: "metric",
                        localIdentifier: "measure1",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure2",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure2_pop",
                        masterLocalIdentifier: "measure2",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure3",
                    },
                ],
            },
            {
                localIdentifier: "attribute",
                items: [
                    {
                        localIdentifier: "attr1",
                    },
                    {
                        localIdentifier: "attr2",
                    },
                    {
                        localIdentifier: "attr3",
                    },
                ],
            },
        ];

        expect(getDerivedBucketItems(buckets)).toEqual([
            {
                type: "metric",
                localIdentifier: "measure2_pop",
                masterLocalIdentifier: "measure2",
            },
        ]);
    });
});
