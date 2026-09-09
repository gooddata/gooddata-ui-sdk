// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Dashboard, Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { buildAfmExecution } from "./execution/buildAfmExecution.js";
import { declarativeDashboardToYaml } from "./from/declarativeDashboardToYaml.js";
import { declarativeVisualisationToYaml } from "./from/declarativeVisualisationToYaml.js";
import {
    yamlDashboardToDeclarative,
    yamlFilterContextToDeclarative,
    yamlInteractionToDeclarative,
} from "./to/yamlDashboardToDeclarative.js";
import {
    yamlFiltersToDeclarative,
    yamlVisualisationToDeclarative,
} from "./to/yamlVisualisationToDeclarative.js";
import type { ExportEntities, FromEntities } from "./types.js";
import {
    isAttributeField,
    isAttributeFilter,
    isComputedAttributeReference,
    parseReferenceObject,
} from "./utils/typeGuards.js";
import { createIdentifier, getIdentifier } from "./utils/yamlUtils.js";

const emptyEntities: ExportEntities = [];
const emptyFromEntities: FromEntities = [];

const TIER = { identifier: { id: "tier", type: "computedAttribute" } };

describe("computed attribute references", () => {
    describe("type guards", () => {
        it("parses the computed_attribute prefix", () => {
            expect(parseReferenceObject("computed_attribute/tier")).toEqual({
                type: "computed_attribute",
                identifier: "tier",
            });
            expect(isComputedAttributeReference("computed_attribute/tier")).toBe(true);
            expect(isComputedAttributeReference("label/tier")).toBe(false);
        });

        it("treats a computed attribute as an attribute-like field and filter", () => {
            expect(isAttributeField({ using: "computed_attribute/tier" })).toBe(true);
            expect(isAttributeFilter({ using: "computed_attribute/tier", type: "attribute_filter" })).toBe(
                true,
            );
        });
    });

    describe("identifiers", () => {
        it("maps computed_attribute/ to the computedAttribute object type and back", () => {
            expect(createIdentifier("computed_attribute/tier")).toEqual(TIER);
            expect(getIdentifier(TIER as any)).toBe("computed_attribute/tier");
            expect(getIdentifier(TIER as any, true)).toBe("tier");
        });
    });

    describe("visualisation", () => {
        it("puts a computed attribute field on a bucket", () => {
            const input = {
                type: "bar_chart",
                id: "revenue_by_tier",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "computed_attribute/tier" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as unknown as Visualisation;

            const result = yamlVisualisationToDeclarative(emptyEntities, input);
            const buckets = (result.content as any).buckets;
            const viewBucket = buckets.find((b: any) => b.localIdentifier === "view");

            expect(viewBucket.items).toEqual([
                {
                    attribute: {
                        localIdentifier: "a1",
                        displayForm: TIER,
                        showAllValues: undefined,
                        alias: undefined,
                    },
                },
            ]);
        });

        it("writes the computed attribute field back with the computed_attribute prefix", () => {
            const input = {
                type: "bar_chart",
                id: "revenue_by_tier",
                query: {
                    fields: {
                        m1: { using: "metric/revenue" },
                        a1: { using: "computed_attribute/tier" },
                    },
                },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as unknown as Visualisation;

            const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
            const { json } = declarativeVisualisationToYaml(emptyFromEntities, declarative);

            expect(json!.query.fields["a1"]).toEqual("computed_attribute/tier");
        });

        it("converts attribute, text and ranking filters on a computed attribute", () => {
            const filter_by = {
                f1: {
                    type: "attribute_filter",
                    using: "computed_attribute/tier",
                    state: { include: ["High"] },
                },
                f2: {
                    type: "text_filter",
                    using: "computed_attribute/tier",
                    condition: "is",
                    values: ["High"],
                },
                f3: {
                    type: "ranking_filter",
                    using: "metric/revenue",
                    top: 3,
                    attribute: "computed_attribute/tier",
                },
            };

            const { filters } = yamlFiltersToDeclarative(emptyEntities, filter_by as any);

            expect(filters).toEqual([
                { positiveAttributeFilter: { displayForm: TIER, in: { values: ["High"] } } },
                {
                    arbitraryAttributeFilter: {
                        localIdentifier: "f2",
                        label: TIER,
                        values: ["High"],
                        negativeSelection: false,
                    },
                },
                {
                    rankingFilter: {
                        measure: { identifier: { id: "revenue", type: "metric" } },
                        attributes: [TIER],
                        operator: "TOP",
                        value: 3,
                    },
                },
            ]);
        });

        it("executes a computed attribute field with its own object type", () => {
            const { execution } = buildAfmExecution(emptyEntities, {
                fields: { m1: { using: "metric/revenue" }, a1: { using: "computed_attribute/tier" } },
                metrics: [{ field: "m1" }],
                view_by: [{ field: "a1" }],
            } as any);

            expect(execution.execution.attributes).toEqual([
                { localIdentifier: "a1", label: TIER, showAllValues: undefined },
            ]);
        });
    });

    describe("dashboard", () => {
        it("converts a dashboard attribute filter on a computed attribute", () => {
            const filters = {
                tier: { using: "computed_attribute/tier", type: "attribute_filter" },
            } as Dashboard["filters"];

            const result = yamlFilterContextToDeclarative("dash1", filters);
            const [filter] = (result.filterContext.content as any).filters;

            expect(filter.attributeFilter.displayForm).toEqual(TIER);
        });

        it("round-trips a computed attribute filter", () => {
            const input = {
                type: "dashboard",
                id: "tiers",
                sections: [{ widgets: [{ visualization: "revenue_by_tier", columns: 12, rows: 22 }] }],
                filters: {
                    tier: { using: "computed_attribute/tier", type: "attribute_filter" },
                },
            } as unknown as Dashboard;

            const { dashboard, filterContext } = yamlDashboardToDeclarative(emptyEntities, input);
            const { json } = declarativeDashboardToYaml(
                emptyFromEntities,
                dashboard,
                filterContext ? [filterContext] : [],
            );

            expect(json.filters).toEqual({
                tier: { using: "computed_attribute/tier", type: "attribute_filter" },
            });
        });

        it("drills to a url held by a computed attribute", () => {
            const entities: ExportEntities = [
                {
                    id: "revenue_by_tier",
                    type: "bar_chart",
                    path: "analytics/revenue_by_tier.yaml",
                    data: {
                        id: "revenue_by_tier",
                        type: "bar_chart",
                        query: {
                            fields: {
                                m1: { using: "metric/revenue" },
                                a1: { using: "computed_attribute/tier" },
                            },
                        },
                    },
                } as unknown as ExportEntities[number],
            ];

            const drill = yamlInteractionToDeclarative(entities, "revenue_by_tier", {
                click_on: "a1",
                open_url: { label: "computed_attribute/tier", href: "computed_attribute/tier_url" },
            });

            expect(drill).toEqual({
                type: "drillToAttributeUrl",
                transition: "new-window",
                target: {
                    displayForm: TIER,
                    hyperlinkDisplayForm: { identifier: { id: "tier_url", type: "computedAttribute" } },
                },
                origin: { type: "drillFromAttribute", attribute: { localIdentifier: "a1" } },
            });
        });
    });
});
