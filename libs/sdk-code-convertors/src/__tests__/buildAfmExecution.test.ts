// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Query } from "@gooddata/sdk-code-schemas/v1";

import { buildAfmExecution } from "../execution/buildAfmExecution.js";
import type { ExportEntities } from "../types.js";

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
