// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { declarativeVisualisationToYaml } from "../from/declarativeVisualisationToYaml.js";
import {
    yamlBucketsToDeclarative,
    yamlFiltersToDeclarative,
    yamlVisualisationToDeclarative,
    yamlVisualisationToMetadataObject,
} from "../to/yamlVisualisationToDeclarative.js";
import type { ExportEntities, FromEntities } from "../types.js";

const emptyEntities: ExportEntities = [];
const emptyFromEntities: FromEntities = [];

describe("visualisation conversion", () => {
    describe("yamlFiltersToDeclarative", () => {
        it("should convert positive attribute filter", () => {
            const filters_by = {
                f1: {
                    type: "attribute_filter",
                    using: "label/region",
                    state: { include: ["East", "West"] },
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                positiveAttributeFilter: {
                    displayForm: { identifier: { id: "region", type: "label" } },
                    in: { values: ["East", "West"] },
                },
            });
        });

        it("should convert negative attribute filter", () => {
            const filters_by = {
                f1: {
                    type: "attribute_filter",
                    using: "label/region",
                    state: { exclude: ["East"] },
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                negativeAttributeFilter: {
                    displayForm: { identifier: { id: "region", type: "label" } },
                    notIn: { values: ["East"] },
                },
            });
        });

        it("should convert absolute date filter", () => {
            const filters_by = {
                f1: {
                    type: "date_filter",
                    using: "dataset/date",
                    from: "2020-01-01",
                    to: "2020-12-31",
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                absoluteDateFilter: {
                    dataSet: { identifier: { id: "date", type: "dataset" } },
                    from: "2020-01-01",
                    to: "2020-12-31",
                },
            });
        });

        it("should convert relative date filter", () => {
            const filters_by = {
                f1: {
                    type: "date_filter",
                    using: "dataset/date",
                    granularity: "YEAR",
                    from: -1,
                    to: 0,
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                relativeDateFilter: {
                    dataSet: { identifier: { id: "date", type: "dataset" } },
                    granularity: "GDC.time.year",
                    from: -1,
                    to: 0,
                },
            });
        });

        it("should convert measure comparison value filter", () => {
            const filters_by = {
                f1: {
                    type: "metric_value_filter",
                    using: "metric/amount",
                    condition: "GREATER_THAN",
                    value: 100,
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                measureValueFilter: {
                    measure: { identifier: { id: "amount", type: "metric" } },
                    condition: {
                        comparison: {
                            operator: "GREATER_THAN",
                            value: 100,
                            treatNullValuesAs: undefined,
                        },
                    },
                },
            });
        });

        it("should convert measure range value filter", () => {
            const filters_by = {
                f1: {
                    type: "metric_value_filter",
                    using: "metric/amount",
                    condition: "BETWEEN",
                    from: 100,
                    to: 200,
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                measureValueFilter: {
                    measure: { identifier: { id: "amount", type: "metric" } },
                    condition: {
                        range: {
                            operator: "BETWEEN",
                            from: 100,
                            to: 200,
                            treatNullValuesAs: undefined,
                        },
                    },
                },
            });
        });

        it("should convert ranking filter", () => {
            const filters_by = {
                f1: {
                    type: "ranking_filter",
                    using: "metric/amount",
                    top: 10,
                    attribute: "label/region",
                },
            };
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(filters[0]).toEqual({
                rankingFilter: {
                    measure: { identifier: { id: "amount", type: "metric" } },
                    attributes: [{ identifier: { id: "region", type: "label" } }],
                    operator: "TOP",
                    value: 10,
                },
            });
        });

        it("should handle array of filters", () => {
            const filters_by = [
                {
                    type: "attribute_filter",
                    using: "label/region",
                    state: { include: ["East"] },
                },
                {
                    type: "metric_value_filter",
                    using: "metric/amount",
                    condition: "GREATER_THAN",
                    value: 100,
                },
            ];
            const { filters } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(2);
        });

        it("should handle attribute filter configs (display_as)", () => {
            const filters_by = {
                f1: {
                    type: "attribute_filter",
                    using: "label/region",
                    state: { include: ["East"] },
                    display_as: "label/region_name",
                },
            };
            const { filters, attributeFilterConfigs } = yamlFiltersToDeclarative(emptyEntities, filters_by);
            expect(filters).toHaveLength(1);
            expect(attributeFilterConfigs).toEqual({
                f1: {
                    displayAsLabel: { identifier: { id: "region_name", type: "label" } },
                },
            });
        });
    });

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

            const { buckets } = yamlBucketsToDeclarative([], input);
            expect(buckets).toHaveLength(2);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[1].localIdentifier).toBe("view");
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

            const { buckets } = yamlBucketsToDeclarative([], input);
            expect(buckets).toHaveLength(2);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[1].localIdentifier).toBe("attribute");
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

            const { buckets } = yamlBucketsToDeclarative([], input);
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

            const { buckets } = yamlBucketsToDeclarative([], input);
            expect(buckets).toHaveLength(3);
            expect(buckets[0].localIdentifier).toBe("measures");
            expect(buckets[0].items).toHaveLength(1);
            expect(buckets[1].localIdentifier).toBe("secondary_measures");
            expect(buckets[1].items).toHaveLength(1);
            expect(buckets[2].localIdentifier).toBe("attribute");
            expect(buckets[2].items).toHaveLength(1);
        });

        it("should handle empty buckets gracefully", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "empty_bar",
                query: { fields: {} },
            } as any;

            const { buckets } = yamlBucketsToDeclarative([], input);
            expect(buckets).toHaveLength(0);
        });
    });

    describe("yamlVisualisationToMetadataObject", () => {
        it("should convert simple bar chart to JsonApi format", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "bar1",
                title: "Bar Chart Title",
                description: "Bar Chart Description",
                tags: ["tag1", "tag2"],
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "label/region" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            };

            const result = yamlVisualisationToMetadataObject(emptyEntities, input);
            expect(result.type).toBe("visualizationObject");
            expect(result.id).toBe("bar1");
            expect(result.attributes).toBeDefined();
            expect(result.attributes.title).toBe("Bar Chart Title");
            expect(result.attributes.description).toBe("Bar Chart Description");
            expect(result.attributes.tags).toEqual(["tag1", "tag2"]);
            expect(result.attributes.content).toBeDefined();
            expect((result.attributes.content as any).visualizationUrl).toBe("local:bar");
        });

        it("should handle is_hidden and show_in_ai_results correctly", () => {
            const input: Visualisation = {
                type: "bar_chart",
                id: "bar1",
                is_hidden: true,
                show_in_ai_results: false,
                query: { fields: {} },
            };

            const result = yamlVisualisationToMetadataObject(emptyEntities, input);
            expect(result.attributes.isHidden).toBe(true);
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

    describe("geo chart config round-trip", () => {
        it("should round-trip geo_chart with bounds, stripping center/zoom", () => {
            const input = {
                type: "geo_chart",
                id: "geo_bounds",
                query: {
                    fields: { m1: { using: "metric/revenue" }, a1: { using: "label/city" } },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
                config: {
                    basemap: "my-custom-style",
                    shape_type: "oneIcon",
                    icon: "pin",
                    viewport: "custom",
                    viewport_pan: false,
                    viewport_bounds_ne_lat: 49.384,
                    viewport_bounds_ne_lng: -66.886,
                    viewport_bounds_sw_lat: 24.396,
                    viewport_bounds_sw_lng: -124.849,
                    // Also provide center/zoom — should be stripped because bounds are present
                    center_lat: 39.8283,
                    center_lng: -98.5795,
                    zoom_level: 4,
                },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;

            expect(controls.points.shapeType).toBe("oneIcon");
            expect(controls.points.icon).toBe("pin");
            expect(controls.basemap).toBe("my-custom-style");
            expect(controls.bounds).toEqual({
                northEast: { lat: 49.384, lng: -66.886 },
                southWest: { lat: 24.396, lng: -124.849 },
            });
            // center/zoom must be stripped when bounds are present
            expect(controls.center).toBeUndefined();
            expect(controls.zoom).toBeUndefined();

            // Round-trip back to YAML
            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            const cfg = json!.config!;
            expect(cfg["shape_type"]).toBe("oneIcon");
            expect(cfg["icon"]).toBe("pin");
            expect(cfg["basemap"]).toBe("my-custom-style");
            expect(cfg["viewport_bounds_ne_lat"]).toBe(49.384);
            expect(cfg["viewport_bounds_sw_lat"]).toBe(24.396);
            // center/zoom must not appear in YAML when bounds are used
            expect(cfg["center_lat"]).toBeUndefined();
            expect(cfg["center_lng"]).toBeUndefined();
            expect(cfg["zoom_level"]).toBeUndefined();
        });

        it("should strip icon when shapeType is circle (default)", () => {
            const input = {
                type: "geo_chart",
                id: "geo_circle",
                query: { fields: { m1: { using: "metric/revenue" } } },
                metrics: [{ field: "m1" }],
                config: {
                    shape_type: "circle",
                    icon: "pin", // should be stripped — not valid for circle
                },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;

            // circle is default → shapeType stripped; icon stripped because not oneIcon
            expect(controls.points).toBeUndefined();

            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            expect(json!.config).toBeUndefined();
        });

        it("should strip icon when shapeType is iconByValue", () => {
            const input = {
                type: "geo_chart",
                id: "geo_ibv",
                query: { fields: { m1: { using: "metric/revenue" } } },
                metrics: [{ field: "m1" }],
                config: {
                    shape_type: "iconByValue",
                    icon: "pin", // should be stripped — not valid for iconByValue
                },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;
            expect(controls.points.shapeType).toBe("iconByValue");
            expect(controls.points.icon).toBeUndefined();

            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            const cfg = json!.config!;
            expect(cfg["shape_type"]).toBe("iconByValue");
            expect(cfg["icon"]).toBeUndefined();
        });

        it("should preserve center/zoom when bounds are absent", () => {
            const input = {
                type: "geo_chart",
                id: "geo_center",
                query: { fields: { m1: { using: "metric/revenue" } } },
                metrics: [{ field: "m1" }],
                config: {
                    viewport: "custom",
                    center_lat: 39.8283,
                    center_lng: -98.5795,
                    zoom_level: 4,
                },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;
            expect(controls.center).toEqual({ lat: 39.8283, lng: -98.5795 });
            expect(controls.zoom).toBe(4);
            expect(controls.bounds).toBeUndefined();
        });

        it("should round-trip geo_area_chart with bounds and sanitized center/zoom", () => {
            const input = {
                type: "geo_area_chart",
                id: "geo_area",
                query: {
                    fields: { m1: { using: "metric/revenue" }, a1: { using: "label/region" } },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
                config: {
                    viewport: "custom",
                    viewport_bounds_ne_lat: 72.0,
                    viewport_bounds_ne_lng: -12.0,
                    viewport_bounds_sw_lat: 15.0,
                    viewport_bounds_sw_lng: -170.0,
                    center_lat: 50.0,
                    center_lng: 14.0,
                    zoom_level: 6,
                    basemap: "satellite",
                },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;

            expect(controls.bounds).toEqual({
                northEast: { lat: 72.0, lng: -12.0 },
                southWest: { lat: 15.0, lng: -170.0 },
            });
            // center/zoom stripped because bounds present
            expect(controls.center).toBeUndefined();
            expect(controls.zoom).toBeUndefined();
            // no points for area chart
            expect(controls.points).toBeUndefined();

            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            const cfg = json!.config!;
            expect(cfg["viewport_bounds_ne_lat"]).toBe(72.0);
            expect(cfg["center_lat"]).toBeUndefined();
        });

        it("should handle free-form basemap string", () => {
            const input = {
                type: "geo_chart",
                id: "geo_basemap",
                query: { fields: { m1: { using: "metric/revenue" } } },
                metrics: [{ field: "m1" }],
                config: { basemap: "my-org-custom-dark-v2" },
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            expect((declarative.content as any).properties.controls.basemap).toBe("my-org-custom-dark-v2");

            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            expect(json!.config!["basemap"]).toBe("my-org-custom-dark-v2");
        });

        it("should produce clean round-trip with only defaults (no dirty state)", () => {
            const input = {
                type: "geo_chart",
                id: "geo_clean",
                query: { fields: { m1: { using: "metric/revenue" } } },
                metrics: [{ field: "m1" }],
            } as any;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const controls = (declarative.content as any).properties.controls;

            // With only defaults, no controls should be persisted
            expect(controls).toBeUndefined();

            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);
            expect(json!.config).toBeUndefined();
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
