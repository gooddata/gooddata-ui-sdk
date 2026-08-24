// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { metadata_v1, type v1 } from "./index.js";

describe("sdk-code-schemas v1", () => {
    it("exports Metric type with expected type discriminator", () => {
        const metric: v1.Metric = {
            id: "revenue",
            type: "metric",
            maql: "SELECT SUM({fact/amount})",
        };

        expect(metric.type).toBe("metric");
    });

    it("exports Parameter type with a typed definition", () => {
        const parameter: v1.Parameter = {
            id: "scenario",
            type: "parameter",
            definition: { type: "STRING", defaultValue: "Actual" },
        };

        expect(parameter.definition.type).toBe("STRING");
    });

    it("accepts parameter as a top-level object type in the compiled schema", () => {
        expect(metadata_v1.properties.type.enum).toContain("parameter");
    });
});
