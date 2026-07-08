// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { definitionToMetricYaml } from "../metricConverter.js";
import { serializeMetricToYaml } from "../metricSerialization.js";
import { validateMetricYaml } from "../metricValidation.js";

describe("serializeMetricToYaml", () => {
    it("renders the canonical field order with grouping blank lines", () => {
        const yaml = serializeMetricToYaml({
            type: "metric",
            id: "revenue.total",
            title: "Total Revenue",
            description: "Sum of all order amounts",
            tags: ["finance"],
            maql: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });

        expect(yaml).toBe(`type: metric
id: revenue.total

title: Total Revenue
description: Sum of all order amounts
tags:
  - finance

maql: SELECT SUM({fact/order_amount})
format: "#,##0.00"`);
    });

    it("omits the id line when the metric has none", () => {
        const yaml = serializeMetricToYaml({ type: "metric", title: "Draft", maql: "SELECT 1" });
        expect(yaml).not.toContain("id:");
        expect(yaml).toContain("maql: SELECT 1");
    });

    it("emits show_in_ai_results only for a hidden metric", () => {
        const visible = serializeMetricToYaml({ type: "metric", id: "m", title: "M", maql: "SELECT 1" });
        expect(visible).not.toContain("show_in_ai_results");

        const hidden = serializeMetricToYaml({
            type: "metric",
            id: "m",
            title: "M",
            maql: "SELECT 1",
            show_in_ai_results: false,
        });
        expect(hidden).toContain("show_in_ai_results: false");
    });

    it("round-trips a measure through serialize and validate", () => {
        const yaml = serializeMetricToYaml(
            definitionToMetricYaml({
                type: "measure",
                id: "revenue.total",
                title: "Total Revenue",
                description: "Sum",
                tags: ["finance"],
                expression: "SELECT SUM({fact/order_amount})",
                format: "#,##0.00",
            }),
        );

        const result = validateMetricYaml(yaml);
        expect(result).toEqual({
            isValid: true,
            measure: {
                type: "measure",
                id: "revenue.total",
                title: "Total Revenue",
                description: "Sum",
                tags: ["finance"],
                expression: "SELECT SUM({fact/order_amount})",
                format: "#,##0.00",
            },
        });
    });
});
