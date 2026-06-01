// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Dashboard, RichTextWidget, VisualisationWidget } from "@gooddata/sdk-code-schemas/v1";

import { declarativeDashboardToYaml } from "../from/declarativeDashboardToYaml.js";
import {
    yamlDashboardToDeclarative,
    yamlFilterContextToDeclarative,
    yamlWidgetToDeclarative,
} from "../to/yamlDashboardToDeclarative.js";
import type { ExportEntities, FromEntities } from "../types.js";

const emptyEntities: ExportEntities = [];
const emptyFromEntities: FromEntities = [];

function makeDashboard(overrides: Partial<Dashboard> = {}): Dashboard {
    return {
        type: "dashboard",
        id: "test_dashboard",
        sections: [{ widgets: [{ size: 12, item: { visualization: "vis/chart1" } }] }],
        ...overrides,
    } as Dashboard;
}

describe("dashboard conversion", () => {
    describe("yamlFilterContextToDeclarative", () => {
        it("should convert empty filters", () => {
            const result = yamlFilterContextToDeclarative("dashboard1", undefined);

            expect(result.filterContext).toBeDefined();
            expect(result.filterContext.id).toContain("dashboard1");
            expect((result.filterContext.content as any)?.filters).toEqual([]);
        });

        it("should convert attribute filters", () => {
            const filters = {
                region: {
                    using: "label/region",
                    type: "attribute_filter",
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            expect((result.filterContext.content as any)?.filters).toBeDefined();
            expect((result.filterContext.content as any).filters.length).toBeGreaterThan(0);
        });

        it("should convert dashboard text filters", () => {
            const filters = {
                date_common: {
                    type: "date_filter",
                    granularity: "YEAR",
                    from: -1,
                    to: 0,
                },
                region_text: {
                    type: "text_filter",
                    using: "label/region",
                    title: "Region Text",
                    mode: "hidden",
                    display_as: "label/region_name",
                    condition: "is",
                    values: ["US", "UK"],
                    parents: ["date_common"],
                    metric_filters: ["metric/revenue"],
                },
                region_match: {
                    type: "text_filter",
                    using: "label/region",
                    title: "Region Search",
                    display_as: "label/region_name2",
                    condition: "doesNotStartWith",
                    value: "North",
                    case_sensitive: true,
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        arbitraryAttributeFilter: expect.objectContaining({
                            localIdentifier: "region_text",
                            negativeSelection: false,
                            values: ["US", "UK"],
                            title: "Region Text",
                        }),
                    }),
                    expect.objectContaining({
                        matchAttributeFilter: expect.objectContaining({
                            localIdentifier: "region_match",
                            operator: "startsWith",
                            negativeSelection: true,
                            literal: "North",
                            caseSensitive: true,
                            title: "Region Search",
                        }),
                    }),
                ]),
            );
            expect(result.attributeFilterConfigs).toEqual([
                expect.objectContaining({
                    localIdentifier: "region_text",
                    mode: "hidden",
                    displayAsLabel: { identifier: { id: "region_name", type: "label" } },
                }),
                expect.objectContaining({
                    localIdentifier: "region_match",
                    displayAsLabel: { identifier: { id: "region_name2", type: "label" } },
                }),
            ]);
        });
    });

    describe("yamlWidgetToDeclarative", () => {
        it("should convert a visualisation widget", () => {
            const widget: VisualisationWidget = {
                visualization: "vis/revenue_chart",
                title: "Revenue Chart",
            };

            const result = yamlWidgetToDeclarative(emptyEntities, widget, undefined);
            expect(result).toBeDefined();
            expect((result as any)?.insight).toBeDefined();
        });

        it("should convert a rich text widget", () => {
            const widget: RichTextWidget = {
                content: "Hello **world**",
            };

            const result = yamlWidgetToDeclarative(emptyEntities, widget, undefined);
            expect(result).toBeDefined();
            expect((result as any)?.type).toBe("richText");
            expect((result as any)?.content).toBe("Hello **world**");
        });
    });

    describe("yamlDashboardToDeclarative", () => {
        it("should convert a minimal dashboard", () => {
            const input = makeDashboard({ id: "my_dashboard", title: "My Dashboard" });

            const result = yamlDashboardToDeclarative(emptyEntities, input);

            expect(result.dashboard.id).toBe("my_dashboard");
            expect(result.dashboard.title).toBe("My Dashboard");
            expect(result.dashboard.content).toBeDefined();
            expect(result.filterContext).toBeDefined();
            expect((result.filterContext?.content as any)?.filters).toEqual([]);
        });

        it("should handle dashboard settings flags", () => {
            const input = makeDashboard({
                cross_filtering: false,
                user_filters_save: false,
                user_filters_reset: false,
                filter_views: false,
            });

            const result = yamlDashboardToDeclarative(emptyEntities, input);
            const content = result.dashboard.content as any;

            expect(content.disableCrossFiltering).toBe(true);
            expect(content.disableUserFilterSave).toBe(true);
            expect(content.disableUserFilterReset).toBe(true);
            expect(content.disableFilterViews).toBe(true);
        });

        it("should derive title from id when not provided", () => {
            const input = makeDashboard({ id: "sales_overview" });

            const result = yamlDashboardToDeclarative(emptyEntities, input);
            expect(result.dashboard.title).toBe("Sales Overview");
        });

        describe("YAML version 2 (legacy / default)", () => {
            it("root-only YAML: produces synthetic tab + root mirror (duplicated)", () => {
                const input = makeDashboard({ id: "root_dash" });
                // version omitted → defaults to "2"

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                // V2 legacy: root content present AND a synthetic single tab carries the same content.
                expect(content.layout).toBeDefined();
                expect(content.tabs).toHaveLength(1);
                expect(content.tabs[0].title).toBe("");
                expect(content.tabs[0].layout).toBeDefined();
            });

            it("tabs YAML: produces tabs AND root mirror from tabs[0]", () => {
                const input = {
                    type: "dashboard",
                    id: "tabs_dash",
                    tabs: [
                        { id: "tab_a", title: "Tab A", sections: [] },
                        { id: "tab_b", title: "Tab B", sections: [] },
                    ],
                } as Dashboard;

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                // V2 legacy: tabs present AND root mirrors tabs[0].
                expect(content.tabs).toHaveLength(2);
                expect(content.layout).toBeDefined();
                expect(content.layout).toEqual(content.tabs[0].layout);
            });
        });

        describe("YAML version 3 (clean — no duplication)", () => {
            it("root-only YAML: produces synthetic single tab, no root content", () => {
                const input = makeDashboard({ id: "root_dash", version: "3" });

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                // V3 clean: no root content; root YAML wraps into a single synthetic tab.
                expect(content.layout).toBeUndefined();
                expect(content.dateFilterConfig).toBeUndefined();
                expect(content.attributeFilterConfigs).toBeUndefined();
                expect(content.tabs).toHaveLength(1);
                expect(content.tabs[0].title).toBe("");
                expect(content.tabs[0].layout).toBeDefined();
            });

            it("declarative content carries version 3 so the backend stores it correctly", () => {
                const input = makeDashboard({ id: "v3_version_check", version: "3" });

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                expect(content.version).toBe("3");
            });

            it("tabs YAML: declarative content carries version 3", () => {
                const input = {
                    type: "dashboard",
                    id: "v3_tabs_version_check",
                    version: "3",
                    tabs: [
                        { id: "tab_a", title: "Tab A", sections: [] },
                        { id: "tab_b", title: "Tab B", sections: [] },
                    ],
                } as Dashboard;

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                expect(content.version).toBe("3");
            });

            it("tabs YAML: produces tabs only — no root layout/configs", () => {
                const input = {
                    type: "dashboard",
                    id: "tabs_dash",
                    version: "3",
                    tabs: [
                        { id: "tab_a", title: "Tab A", sections: [] },
                        { id: "tab_b", title: "Tab B", sections: [] },
                    ],
                } as Dashboard;

                const result = yamlDashboardToDeclarative(emptyEntities, input);
                const content = result.dashboard.content as any;

                expect(content.layout).toBeUndefined();
                expect(content.dateFilterConfig).toBeUndefined();
                expect(content.dateFilterConfigs).toBeUndefined();
                expect(content.attributeFilterConfigs).toBeUndefined();
                expect(content.measureValueFilterConfigs).toBeUndefined();
                expect(content.filterContextRef).toBeUndefined();
                expect(content.tabs).toHaveLength(2);
                expect(result.tabFilterContexts).toHaveLength(2);
            });
        });

        describe("tabs vs root content mutual exclusion", () => {
            it("throws when YAML has both tabs and root sections (v2)", () => {
                const input = {
                    type: "dashboard",
                    id: "conflict_dash",
                    sections: [{ widgets: [] }],
                    tabs: [{ id: "tab_a", title: "Tab A", sections: [] }],
                } as Dashboard;

                expect(() => yamlDashboardToDeclarative(emptyEntities, input)).toThrow(/mutually exclusive/i);
            });

            it("throws when YAML has both tabs and root filters (v3)", () => {
                const input = {
                    type: "dashboard",
                    id: "conflict_dash",
                    version: "3",
                    filters: {
                        region: { using: "label/region", type: "attribute_filter" },
                    },
                    tabs: [{ id: "tab_a", title: "Tab A", sections: [] }],
                } as Dashboard;

                expect(() => yamlDashboardToDeclarative(emptyEntities, input)).toThrow(/mutually exclusive/i);
            });
        });
    });

    describe("declarativeDashboardToYaml", () => {
        it("should convert a declarative dashboard to YAML", () => {
            const input = makeDashboard({
                id: "revenue_dashboard",
                title: "Revenue Dashboard",
                description: "Shows revenue metrics",
                tags: ["finance"],
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json, content } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.type).toBe("dashboard");
            expect(json.id).toBe("revenue_dashboard");
            expect(content).toContain("type: dashboard");
            expect(content).toContain("id: revenue_dashboard");
        });

        it("should round-trip dashboard metadata (id, title, description, tags)", () => {
            const input = makeDashboard({
                id: "analytics_dash",
                title: "Analytics Dashboard",
                description: "Main analytics view",
                tags: ["analytics"],
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.id).toBe("analytics_dash");
            expect(json.title).toBe("Analytics Dashboard");
            expect(json.description).toBe("Main analytics view");
            expect(json.tags).toEqual(["analytics"]);
            expect(json.type).toBe("dashboard");
            expect(json.sections).toBeDefined();
        });

        it("should round-trip dashboard setting flags", () => {
            const input = makeDashboard({ cross_filtering: false });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.cross_filtering).toBe(false);
        });

        describe("YAML version round-trip", () => {
            it('emits version "2" for declarative that carries root content (legacy shape)', () => {
                // V2 root YAML produces declarative with synthetic tab + root mirror.
                const input = makeDashboard({ id: "v2_root" }); // version omitted → defaults to "2"

                const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
                const { json } = declarativeDashboardToYaml(
                    emptyFromEntities,
                    dashboard,
                    filterContext ? [filterContext] : [],
                );

                expect(json.version).toBe("2");
                expect(json.sections).toBeDefined();
            });

            it('emits version "3" for declarative with tabs only (no root content)', () => {
                const input = makeDashboard({ id: "v3_root", version: "3" });

                const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
                const { json } = declarativeDashboardToYaml(
                    emptyFromEntities,
                    dashboard,
                    filterContext ? [filterContext] : [],
                );

                expect(json.version).toBe("3");
                // Single untitled synthetic tab → flatten rule still produces root sections in YAML.
                expect(json.sections).toBeDefined();
            });

            it('emits version "3" for declarative with explicit multi-tab structure', () => {
                const input = {
                    type: "dashboard",
                    id: "v3_tabs",
                    version: "3",
                    tabs: [
                        { id: "tab_a", title: "Tab A", sections: [] },
                        { id: "tab_b", title: "Tab B", sections: [] },
                    ],
                } as Dashboard;

                const { dashboard, filterContext, tabFilterContexts } = yamlDashboardToDeclarative(
                    emptyEntities,
                    input,
                );
                const { json } = declarativeDashboardToYaml(
                    emptyFromEntities,
                    dashboard,
                    tabFilterContexts ?? (filterContext ? [filterContext] : []),
                );

                expect(json.version).toBe("3");
                expect(json.tabs).toBeDefined();
                expect(json.tabs).toHaveLength(2);
                expect(json.sections).toBeUndefined();
            });
        });

        it("should round-trip dashboard text filters", () => {
            const input = makeDashboard({
                filters: {
                    date_common: {
                        type: "date_filter",
                        granularity: "YEAR",
                        from: -1,
                        to: 0,
                    },
                    region_text: {
                        type: "text_filter",
                        using: "label/region",
                        title: "Region Text",
                        display_as: "label/region_name",
                        condition: "isNot",
                        values: ["US", null],
                        parents: ["date_common"],
                        metric_filters: ["metric/revenue"],
                    },
                    region_match: {
                        type: "text_filter",
                        using: "label/region",
                        title: "Region Search",
                        display_as: "label/region_name2",
                        condition: "contains",
                        value: "North",
                        case_sensitive: true,
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["region_text"]).toEqual({
                type: "text_filter",
                using: "label/region",
                title: "Region Text",
                display_as: "label/region_name",
                condition: "isNot",
                values: ["US", null],
                parents: ["date_common"],
                metric_filters: ["metric/revenue"],
            });
            expect(json.filters?.["region_match"]).toEqual({
                type: "text_filter",
                using: "label/region",
                title: "Region Search",
                display_as: "label/region_name2",
                condition: "contains",
                value: "North",
                case_sensitive: true,
            });
        });
    });

    describe("dashboard measure value filter", () => {
        it("should convert measure value filter with single comparison condition", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/order_amount",
                    conditions: [{ condition: "GREATER_THAN", value: 10000 }],
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters).toEqual([
                {
                    dashboardMeasureValueFilter: {
                        measure: { identifier: { id: "order_amount", type: "metric" } },
                        localIdentifier: "mvf_orders",
                        conditions: [{ comparison: { operator: "GREATER_THAN", value: 10000 } }],
                    },
                },
            ]);
            expect(result.measureValueFilterConfigs).toBeUndefined();
        });

        it("should convert measure value filter with dimensionality", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/order_amount",
                    conditions: [{ condition: "GREATER_THAN", value: 10000 }],
                    dimensionality: ["label/product.category", "label/region"],
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters).toEqual([
                {
                    dashboardMeasureValueFilter: {
                        measure: { identifier: { id: "order_amount", type: "metric" } },
                        localIdentifier: "mvf_orders",
                        conditions: [{ comparison: { operator: "GREATER_THAN", value: 10000 } }],
                        dimensionality: [
                            { identifier: { id: "product.category", type: "label" } },
                            { identifier: { id: "region", type: "label" } },
                        ],
                    },
                },
            ]);
        });

        it("should convert measure value filter with range condition (null flag fanned out per condition)", () => {
            const filters = {
                mvf_revenue: {
                    type: "metric_value_filter",
                    using: "metric/revenue",
                    conditions: [{ condition: "BETWEEN", from: 100, to: 1000 }],
                    null_values_as_zero: true,
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            // The top-level YAML flag is applied to each condition (matches insight MVF model).
            expect(convertedFilters[0].dashboardMeasureValueFilter.conditions).toEqual([
                { range: { operator: "BETWEEN", from: 100, to: 1000, treatNullValuesAs: 0 } },
            ]);
            // Top-level treatNullValuesAs does not exist on the dashboard MVF type.
            expect(convertedFilters[0].dashboardMeasureValueFilter.treatNullValuesAs).toBeUndefined();
        });

        it("should fan out null_values_as_zero to all conditions in a multi-condition MVF", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/orders",
                    conditions: [
                        { condition: "GREATER_THAN", value: 1000 },
                        { condition: "LESS_THAN", value: 10 },
                    ],
                    null_values_as_zero: true,
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters[0].dashboardMeasureValueFilter.conditions).toEqual([
                { comparison: { operator: "GREATER_THAN", value: 1000, treatNullValuesAs: 0 } },
                { comparison: { operator: "LESS_THAN", value: 10, treatNullValuesAs: 0 } },
            ]);
        });

        it("should convert measure value filter with multiple OR-ed conditions", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/orders",
                    conditions: [
                        { condition: "GREATER_THAN", value: 1000 },
                        { condition: "LESS_THAN", value: 10 },
                    ],
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters[0].dashboardMeasureValueFilter.conditions).toEqual([
                { comparison: { operator: "GREATER_THAN", value: 1000 } },
                { comparison: { operator: "LESS_THAN", value: 10 } },
            ]);
        });

        it("should convert measure value filter with no conditions (All)", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/orders",
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const convertedFilters = (result.filterContext.content as any).filters;

            expect(convertedFilters[0].dashboardMeasureValueFilter).toEqual({
                measure: { identifier: { id: "orders", type: "metric" } },
                localIdentifier: "mvf_orders",
            });
        });

        it("should extract measure value filter config (mode only) and keep title on filter", () => {
            const filters = {
                mvf_orders: {
                    type: "metric_value_filter",
                    using: "metric/orders",
                    title: "# of Orders",
                    mode: "hidden",
                    conditions: [{ condition: "GREATER_THAN", value: 100 }],
                },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);

            // Mode is extracted to config (matches attribute filter pattern)
            expect(result.measureValueFilterConfigs).toEqual([
                {
                    localIdentifier: "mvf_orders",
                    mode: "hidden",
                },
            ]);
            // Title stays on the filter itself
            expect((result.filterContext.content as any).filters[0].dashboardMeasureValueFilter.title).toBe(
                "# of Orders",
            );
        });

        it("should round-trip measure value filter (single comparison)", () => {
            const input = makeDashboard({
                filters: {
                    mvf_orders: {
                        type: "metric_value_filter",
                        using: "metric/order_amount",
                        conditions: [{ condition: "GREATER_THAN", value: 10000 }],
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_orders"]).toEqual({
                type: "metric_value_filter",
                using: "metric/order_amount",
                conditions: [{ condition: "GREATER_THAN", value: 10000 }],
            });
        });

        it("should round-trip measure value filter with dimensionality", () => {
            const input = makeDashboard({
                filters: {
                    mvf_orders: {
                        type: "metric_value_filter",
                        using: "metric/order_amount",
                        conditions: [{ condition: "GREATER_THAN", value: 10000 }],
                        dimensionality: ["label/product.category", "label/region"],
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_orders"]).toEqual({
                type: "metric_value_filter",
                using: "metric/order_amount",
                conditions: [{ condition: "GREATER_THAN", value: 10000 }],
                dimensionality: ["label/product.category", "label/region"],
            });
        });

        it("should round-trip measure value filter (range)", () => {
            const input = makeDashboard({
                filters: {
                    mvf_revenue: {
                        type: "metric_value_filter",
                        using: "metric/revenue",
                        conditions: [{ condition: "BETWEEN", from: 100, to: 1000 }],
                        null_values_as_zero: true,
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_revenue"]).toEqual({
                type: "metric_value_filter",
                using: "metric/revenue",
                conditions: [{ condition: "BETWEEN", from: 100, to: 1000 }],
                null_values_as_zero: true,
            });
        });

        it("should round-trip measure value filter (multiple conditions)", () => {
            const input = makeDashboard({
                filters: {
                    mvf_orders: {
                        type: "metric_value_filter",
                        using: "metric/orders",
                        conditions: [
                            { condition: "GREATER_THAN", value: 1000 },
                            { condition: "LESS_THAN", value: 10 },
                        ],
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_orders"]).toEqual({
                type: "metric_value_filter",
                using: "metric/orders",
                conditions: [
                    { condition: "GREATER_THAN", value: 1000 },
                    { condition: "LESS_THAN", value: 10 },
                ],
            });
        });

        it("should round-trip measure value filter (no conditions = All)", () => {
            const input = makeDashboard({
                filters: {
                    mvf_orders: {
                        type: "metric_value_filter",
                        using: "metric/orders",
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_orders"]).toEqual({
                type: "metric_value_filter",
                using: "metric/orders",
            });
        });

        it("should round-trip measure value filter with mode and title config", () => {
            const input = makeDashboard({
                filters: {
                    mvf_orders: {
                        type: "metric_value_filter",
                        using: "metric/orders",
                        title: "# of Orders",
                        mode: "hidden",
                        conditions: [{ condition: "GREATER_THAN", value: 100 }],
                    },
                } as any,
            });

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters?.["mvf_orders"]).toEqual({
                type: "metric_value_filter",
                using: "metric/orders",
                title: "# of Orders",
                mode: "hidden",
                conditions: [{ condition: "GREATER_THAN", value: 100 }],
            });
        });
    });
});
