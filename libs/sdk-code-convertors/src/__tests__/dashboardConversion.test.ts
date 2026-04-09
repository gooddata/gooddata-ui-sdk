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
            expect((result.filterContext.content as any)?.filters).toEqual([]);
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
            const { json, content } = declarativeDashboardToYaml(emptyFromEntities, dashboard, [
                filterContext,
            ]);

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
            const { json } = declarativeDashboardToYaml(emptyFromEntities, dashboard, [filterContext]);

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
            const { json } = declarativeDashboardToYaml(emptyFromEntities, dashboard, [filterContext]);

            expect(json.cross_filtering).toBe(false);
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
            const { json } = declarativeDashboardToYaml(emptyFromEntities, dashboard, [filterContext]);

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
});
