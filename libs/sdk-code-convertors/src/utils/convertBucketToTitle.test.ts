// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Metric, Query } from "@gooddata/sdk-code-schemas/v1";

import { type ExportEntities } from "../types.js";

import { convertBucketToTitle } from "./convertBucketToTitle.js";

// Shaped like the gen-ai chat references: no MAQL, only what the title needs.
const metric = {
    type: "metric",
    id: "amount_of_active_customers",
    title: "# of Active Customers",
    description: "",
    tags: [],
} as unknown as Metric;

const metricEntities: ExportEntities = [{ id: metric.id, type: "metric", path: "", data: metric }];

const query: Query = { fields: { m1: { using: "metric/amount_of_active_customers" } } };

describe("convertBucketToTitle", () => {
    it("takes a metric field's title from its metric entity", () => {
        expect(
            convertBucketToTitle(metricEntities, query, { using: "metric/amount_of_active_customers" }),
        ).toBe("# of Active Customers");
    });

    it("derives a metric field's title from its id when no metric entity names it", () => {
        expect(convertBucketToTitle([], query, { using: "metric/amount_of_active_customers" })).toBe(
            "Amount of active customers",
        );
    });
});
