// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Metric } from "@gooddata/sdk-code-schemas/v1";

import { declarativeMetricToYaml } from "../from/declarativeMetricToYaml.js";
import { yamlMetricToDeclarative } from "../to/yamlMetricToDeclarative.js";

describe("metric conversion", () => {
    const simpleMetric: Metric = {
        type: "metric",
        id: "revenue",
        title: "Revenue",
        description: "Total revenue",
        tags: ["finance"],
        maql: "SELECT {metric/order_amount}",
        format: "#,##0",
    };

    describe("yamlMetricToDeclarative", () => {
        it("should convert a simple metric to declarative format", () => {
            const result = yamlMetricToDeclarative(simpleMetric);

            expect(result.id).toBe("revenue");
            expect(result.title).toBe("Revenue");
            expect(result.description).toBe("Total revenue");
            expect(result.tags).toEqual(["finance"]);
            expect(result.content).toEqual({
                maql: "SELECT {metric/order_amount}",
                format: "#,##0",
            });
        });

        it("should derive title from id when not provided", () => {
            const metric: Metric = {
                type: "metric",
                id: "order_amount",
                maql: "SELECT SUM({fact/amount})",
            };
            const result = yamlMetricToDeclarative(metric);

            expect(result.id).toBe("order_amount");
            expect(result.title).toBe("Order Amount");
        });

        it("should handle show_in_ai_results flag", () => {
            const hidden: Metric = {
                ...simpleMetric,
                show_in_ai_results: false,
            };
            const result = yamlMetricToDeclarative(hidden);
            expect(result.isHidden).toBe(true);
        });

        it("should default tags and description to empty", () => {
            const minimal: Metric = {
                type: "metric",
                id: "m1",
                maql: "SELECT 1",
            };
            const result = yamlMetricToDeclarative(minimal);
            expect(result.tags).toEqual([]);
            expect(result.description).toBe("");
        });
    });

    describe("declarativeMetricToYaml", () => {
        it("should convert a declarative metric to YAML", () => {
            const declarative = yamlMetricToDeclarative(simpleMetric);
            const { json, content } = declarativeMetricToYaml(declarative);

            expect(json.type).toBe("metric");
            expect(json.id).toBe("revenue");
            expect(json.maql).toBe("SELECT {metric/order_amount}");
            expect(json.format).toBe("#,##0");
            expect(content).toContain("type: metric");
            expect(content).toContain("id: revenue");
        });

        it("should round-trip a simple metric", () => {
            const declarative = yamlMetricToDeclarative(simpleMetric);
            const { json } = declarativeMetricToYaml(declarative);
            const roundTripped = yamlMetricToDeclarative(json);

            expect(roundTripped.id).toBe(simpleMetric.id);
            expect(roundTripped.title).toBe(simpleMetric.title);
            expect(roundTripped.content).toEqual({
                maql: simpleMetric.maql,
                format: simpleMetric.format,
            });
        });

        it("should preserve isHidden as show_in_ai_results: false", () => {
            const declarative = {
                id: "hidden_metric",
                title: "Hidden",
                description: "",
                tags: [],
                content: { maql: "SELECT 1" },
                isHidden: true,
            };
            const { json } = declarativeMetricToYaml(declarative);
            expect(json.show_in_ai_results).toBe(false);
        });
    });
});
