// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { declarativeVisualisationToYaml } from "../from/declarativeVisualisationToYaml.js";
import type { Visualisation } from "../schemas/v1/metadata.js";
import {
    yamlBucketsToDeclarative,
    yamlVisualisationToDeclarative,
} from "../to/yamlVisualisationToDeclarative.js";
import type { ExportEntities, FromEntities } from "../types.js";

const emptyEntities: ExportEntities = [];
const emptyFromEntities: FromEntities = [];

describe("visualisation conversion", () => {
    describe("yamlBucketsToDeclarative", () => {
        it("should convert bar chart buckets (measures, view, stack)", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "bar1",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "label/region" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as any;

            const buckets = yamlBucketsToDeclarative(input);
            expect(buckets).toHaveLength(3);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[1].localIdentifier).toBe("view");
            expect(buckets[2].localIdentifier).toBe("stack");
        });

        it("should convert table buckets (measures, attribute, columns)", () => {
            const input: Visualisation = {
                type: "table",
                id: "table1",
                query: {
                    fields: {
                        a1: { using: "label/name" },
                        m1: { using: "metric/revenue" },
                    },
                },
                rows: [{ field: "a1" }],
                metrics: [{ field: "m1" }],
            } as any;

            const buckets = yamlBucketsToDeclarative(input);
            expect(buckets).toHaveLength(3);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[1].localIdentifier).toBe("attribute");
            expect(buckets[2].localIdentifier).toBe("columns");
        });

        it("should convert pie chart buckets (measures, view)", () => {
            const input: Visualisation = {
                type: "pie_chart",
                id: "pie1",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "label/region" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as any;

            const buckets = yamlBucketsToDeclarative(input);
            expect(buckets).toHaveLength(2);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[1].localIdentifier).toBe("view");
        });

        it("should convert scatter chart with primary and secondary measures", () => {
            const input: Visualisation = {
                type: "scatter_chart",
                id: "scatter1",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        m2: { using: "metric/cost" },
                        a1: { using: "label/region" },
                    },
                },
                metrics: [{ field: "m1" }, { field: "m2" }],
                view_by: [{ field: "a1" }],
            } as any;

            const buckets = yamlBucketsToDeclarative(input);
            expect(buckets).toHaveLength(4);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[0].items).toHaveLength(1);
            expect(buckets[1].localIdentifier).toBe("secondary_measures");
            expect(buckets[1].items).toHaveLength(1);
        });

        it("should handle empty buckets gracefully", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "empty_bar",
                query: { fields: {} },
            } as any;

            const buckets = yamlBucketsToDeclarative(input);
            expect(buckets).toHaveLength(3);
            buckets.forEach((b) => expect(b.items).toHaveLength(0));
        });
    });

    describe("yamlVisualisationToDeclarative", () => {
        it("should convert a simple bar chart", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "revenue_by_region",
                title: "Revenue by Region",
                description: "Bar chart showing revenue",
                tags: ["sales"],
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "label/region" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as any;

            const result = yamlVisualisationToDeclarative(emptyEntities, input);

            expect(result.id).toBe("revenue_by_region");
            expect(result.title).toBe("Revenue by Region");
            expect(result.description).toBe("Bar chart showing revenue");
            expect(result.tags).toEqual(["sales"]);
            expect((result.content as any).visualizationUrl).toBe("local:bar");
            expect((result.content as any).buckets).toBeDefined();
            expect((result.content as any).version).toBe("2");
        });

        it("should map all chart types to correct visualization URLs", () => {
            const chartTypeMap: Array<[Visualisation["type"], string]> = [
                ["table", "local:table"],
                ["bar_chart", "local:bar"],
                ["column_chart", "local:column"],
                ["line_chart", "local:line"],
                ["area_chart", "local:area"],
                ["pie_chart", "local:pie"],
                ["donut_chart", "local:donut"],
                ["scatter_chart", "local:scatter"],
                ["bubble_chart", "local:bubble"],
                ["heatmap_chart", "local:heatmap"],
                ["treemap_chart", "local:treemap"],
                ["bullet_chart", "local:bullet"],
                ["funnel_chart", "local:funnel"],
                ["pyramid_chart", "local:pyramid"],
                ["waterfall_chart", "local:waterfall"],
                ["headline_chart", "local:headline"],
                ["combo_chart", "local:combo2"],
                ["sankey_chart", "local:sankey"],
                ["dependency_wheel_chart", "local:dependencywheel"],
            ];

            for (const [yamlType, expectedUrl] of chartTypeMap) {
                const input = {
                    type: yamlType,
                    id: `test_${yamlType}`,
                    query: { fields: {} },
                } as any;

                const result = yamlVisualisationToDeclarative(emptyEntities, input);
                expect((result.content as any).visualizationUrl).toBe(expectedUrl);
            }
        });

        it("should derive title from id when not provided", () => {
            const input = {
                type: "bar_chart",
                id: "revenue_by_region",
                query: { fields: {} },
            } as any;

            const result = yamlVisualisationToDeclarative(emptyEntities, input);
            expect(result.title).toBe("Revenue By Region");
        });

        it("should handle show_in_ai_results flag", () => {
            const input = {
                type: "bar_chart",
                id: "hidden_chart",
                show_in_ai_results: false,
                query: { fields: {} },
            } as any;

            const result = yamlVisualisationToDeclarative(emptyEntities, input);
            expect(result.isHidden).toBe(true);
        });
    });

    describe("declarativeVisualisationToYaml", () => {
        it("should convert a bar chart declarative object to YAML", () => {
            const input = {
                type: "bar_chart",
                id: "revenue_chart",
                title: "Revenue",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                    },
                },
                metrics: [{ field: "m1" }],
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const { json, content } = declarativeVisualisationToYaml(emptyFromEntities, declarative);

            expect(json!.type).toBe("bar_chart");
            expect(json!.id).toBe("revenue_chart");
            expect(content).toContain("type: bar_chart");
            expect(content).toContain("id: revenue_chart");
        });

        it("should round-trip a visualisation preserving essential fields", () => {
            const input: Visualisation = {
                type: "line_chart",
                id: "trend_line",
                title: "Trend Line",
                description: "Monthly trend",
                tags: ["analytics"],
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "label/month" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            const roundTripped = yamlVisualisationToDeclarative(emptyEntities, json!);

            expect(roundTripped.id).toBe("trend_line");
            expect(roundTripped.title).toBe("Trend Line");
            expect((roundTripped.content as any).visualizationUrl).toBe("local:line");
        });
    });
});
