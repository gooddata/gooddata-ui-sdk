// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { v1 } from "../index.js";

describe("sdk-code-schemas v1", () => {
    it("exports Metric type with expected type discriminator", () => {
        const metric: v1.Metric = {
            id: "revenue",
            type: "metric",
            maql: "SELECT SUM({fact/amount})",
        };

        expect(metric.type).toBe("metric");
    });
});
