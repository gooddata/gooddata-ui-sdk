// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Query } from "@gooddata/sdk-code-schemas/v1";

import { buildAfmExecution } from "./execution/buildAfmExecution.js";
import type { ExportEntities } from "./types.js";

const emptyEntities: ExportEntities = [];

function buildQueryWithFilters(filter_by: unknown): Query {
    return {
        fields: { m1: { using: "metric/revenue" } },
        metrics: [{ field: "m1" }],
        filter_by,
    } as unknown as Query;
}

describe("buildAfmExecution text filters", () => {
    it("converts text_filter with condition 'is' to a positive attribute filter with usesArbitraryValues", () => {
        const query = buildQueryWithFilters({
            f1: {
                type: "text_filter",
                using: "label/region",
                condition: "is",
                values: ["US", null, "EU"],
            },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                positiveAttributeFilter: {
                    label: { identifier: { id: "region", type: "label" } },
                    in: { values: ["US", null, "EU"] },
                    usesArbitraryValues: true,
                },
            },
        ]);
    });

    it("converts text_filter with condition 'isNot' to a negative attribute filter with usesArbitraryValues", () => {
        const query = buildQueryWithFilters({
            f1: {
                type: "text_filter",
                using: "label/region",
                condition: "isNot",
                values: ["US"],
            },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                negativeAttributeFilter: {
                    label: { identifier: { id: "region", type: "label" } },
                    notIn: { values: ["US"] },
                    usesArbitraryValues: true,
                },
            },
        ]);
    });

    it.each([
        ["contains", "CONTAINS", false],
        ["doesNotContain", "CONTAINS", true],
        ["startsWith", "STARTS_WITH", false],
        ["doesNotStartWith", "STARTS_WITH", true],
        ["endsWith", "ENDS_WITH", false],
        ["doesNotEndWith", "ENDS_WITH", true],
    ] as const)(
        "converts text_filter '%s' to matchAttributeFilter %s (negate=%s)",
        (condition, expectedMatchType, expectedNegate) => {
            const query = buildQueryWithFilters({
                f1: {
                    type: "text_filter",
                    using: "label/region",
                    condition,
                    value: "North",
                    case_sensitive: true,
                },
            });

            const { execution } = buildAfmExecution(emptyEntities, query);

            expect(execution.execution.filters).toEqual([
                {
                    matchAttributeFilter: {
                        label: { identifier: { id: "region", type: "label" } },
                        literal: "North",
                        matchType: expectedMatchType,
                        caseSensitive: true,
                        ...(expectedNegate ? { negate: true } : {}),
                    },
                },
            ]);
        },
    );

    it("omits caseSensitive and negate when not requested", () => {
        const query = buildQueryWithFilters({
            f1: {
                type: "text_filter",
                using: "label/region",
                condition: "contains",
                value: "North",
            },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                matchAttributeFilter: {
                    label: { identifier: { id: "region", type: "label" } },
                    literal: "North",
                    matchType: "CONTAINS",
                },
            },
        ]);
    });

    it("treats missing values as empty list for arbitrary text filter", () => {
        const query = buildQueryWithFilters({
            f1: { type: "text_filter", using: "label/region", condition: "is" },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                positiveAttributeFilter: {
                    label: { identifier: { id: "region", type: "label" } },
                    in: { values: [] },
                    usesArbitraryValues: true,
                },
            },
        ]);
    });
});

describe("buildAfmExecution ranking filters", () => {
    it("routes the ranked attribute to dimensionality, not to measures", () => {
        const query = buildQueryWithFilters({
            f1: {
                type: "ranking_filter",
                using: "metric/revenue",
                attribute: "label/brand",
                top: 5,
            },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                rankingFilter: {
                    measures: [{ identifier: { id: "revenue", type: "measure" } }],
                    dimensionality: [{ identifier: { id: "brand", type: "label" } }],
                    operator: "TOP",
                    value: 5,
                },
            },
        ]);
    });

    it("omits dimensionality entirely when no attribute is ranked", () => {
        const query = buildQueryWithFilters({
            f1: { type: "ranking_filter", using: "metric/revenue", top: 3 },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                rankingFilter: {
                    measures: [{ identifier: { id: "revenue", type: "measure" } }],
                    operator: "TOP",
                    value: 3,
                },
            },
        ]);
        expect(execution.execution.filters?.[0]).not.toHaveProperty("rankingFilter.dimensionality");
    });

    it("resolves local field keys to local identifiers in both measures and dimensionality", () => {
        const query = {
            fields: {
                m1: { using: "metric/revenue" },
                a1: { using: "label/brand" },
            },
            metrics: [{ field: "m1" }],
            attributes: [{ field: "a1" }],
            filter_by: {
                f1: { type: "ranking_filter", using: "m1", attribute: "a1", top: 5 },
            },
        } as unknown as Query;

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                rankingFilter: {
                    measures: [{ localIdentifier: "m1" }],
                    dimensionality: [{ localIdentifier: "a1" }],
                    operator: "TOP",
                    value: 5,
                },
            },
        ]);
    });

    it("converts a bottom ranking filter to BOTTOM and keeps dimensionality routed", () => {
        const query = buildQueryWithFilters({
            f1: {
                type: "ranking_filter",
                using: "metric/revenue",
                attribute: "label/brand",
                bottom: 2,
            },
        });

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.filters).toEqual([
            {
                rankingFilter: {
                    measures: [{ identifier: { id: "revenue", type: "measure" } }],
                    dimensionality: [{ identifier: { id: "brand", type: "label" } }],
                    operator: "BOTTOM",
                    value: 2,
                },
            },
        ]);
    });
});
