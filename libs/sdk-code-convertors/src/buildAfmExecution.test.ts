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

describe("buildAfmExecution ranking filter strict_limit_of_rows", () => {
    it.each([true, false])("passes strict_limit_of_rows %s as strictLimitOfRows", (strict) => {
        const query = buildQueryWithFilters({
            f1: { type: "ranking_filter", using: "metric/revenue", top: 3, strict_limit_of_rows: strict },
        });
        const { execution } = buildAfmExecution(emptyEntities, query);
        expect(execution.execution.filters?.[0]).toHaveProperty("rankingFilter.strictLimitOfRows", strict);
    });

    it("omits strictLimitOfRows when not set", () => {
        const query = buildQueryWithFilters({
            f1: { type: "ranking_filter", using: "metric/revenue", top: 3 },
        });
        const { execution } = buildAfmExecution(emptyEntities, query);
        expect(execution.execution.filters?.[0]).not.toHaveProperty("rankingFilter.strictLimitOfRows");
    });
});

describe("buildAfmExecution dimensions", () => {
    it("leaves the measure dimension empty when the query has no metrics", () => {
        const query = { fields: { a1: { using: "label/region" } } } as unknown as Query;

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.execution.measures).toEqual([]);
        expect(execution.resultSpec.dimensions).toEqual([
            { localIdentifier: "dim_0", itemIdentifiers: ["a1"], sorting: [] },
            { localIdentifier: "dim_1", itemIdentifiers: [] },
        ]);
    });

    it("puts the measure group in the measure dimension when the query has metrics", () => {
        const query = {
            fields: { a1: { using: "label/region" }, m1: { using: "metric/revenue" } },
        } as unknown as Query;

        const { execution } = buildAfmExecution(emptyEntities, query);

        expect(execution.resultSpec.dimensions).toEqual([
            { localIdentifier: "dim_0", itemIdentifiers: ["a1"], sorting: [] },
            { localIdentifier: "dim_1", itemIdentifiers: ["measureGroup"] },
        ]);
    });
});

describe("buildAfmExecution date filter empty values", () => {
    const dataset = { identifier: { id: "expected_ship_date", type: "dataset" } };
    const filtersOf = (filter_by: unknown) =>
        buildAfmExecution(emptyEntities, buildQueryWithFilters(filter_by)).execution.execution.filters;

    it("emits allTimeDateFilter carrying emptyValueHandling for All time", () => {
        expect(
            filtersOf({ f: { type: "date_filter", using: "expected_ship_date", empty_values: "only" } }),
        ).toEqual([{ allTimeDateFilter: { dataset, emptyValueHandling: "ONLY" } }]);
    });

    it.each([undefined, "include"])("sends no filter for a no-op All time (empty_values: %s)", (mode) => {
        expect(
            filtersOf({ f: { type: "date_filter", using: "expected_ship_date", empty_values: mode } }),
        ).toEqual([]);
    });

    it("maps empty_values on a relative date filter", () => {
        expect(
            filtersOf({
                f: {
                    type: "date_filter",
                    using: "expected_ship_date",
                    granularity: "YEAR",
                    from: -10,
                    to: 0,
                    empty_values: "include",
                },
            }),
        ).toEqual([
            {
                relativeDateFilter: {
                    dataset,
                    granularity: "YEAR",
                    from: -10,
                    to: 0,
                    emptyValueHandling: "INCLUDE",
                },
            },
        ]);
    });

    it("maps empty_values on an absolute date filter", () => {
        expect(
            filtersOf({
                f: {
                    type: "date_filter",
                    using: "expected_ship_date",
                    from: "2020-01-01",
                    to: "2020-12-31",
                    empty_values: "exclude",
                },
            }),
        ).toEqual([
            {
                absoluteDateFilter: {
                    dataset,
                    from: "2020-01-01",
                    to: "2020-12-31",
                    emptyValueHandling: "EXCLUDE",
                },
            },
        ]);
    });

    it("applies empty_values to metric-level filter_by", () => {
        const query = {
            fields: {
                m1: {
                    aggregation: "COUNT",
                    using: "attribute/order_item_id",
                    filter_by: {
                        f: { type: "date_filter", using: "expected_ship_date", empty_values: "only" },
                    },
                },
            },
        } as unknown as Query;
        const { measures } = buildAfmExecution(emptyEntities, query).execution.execution;
        expect((measures[0].definition as any).measure.filters).toEqual([
            { allTimeDateFilter: { dataset, emptyValueHandling: "ONLY" } },
        ]);
    });
});

describe("buildAfmExecution date filter with: attribute filters", () => {
    const dataset = { identifier: { id: "expected_ship_date", type: "dataset" } };
    const year = { identifier: { id: "expected_ship_date.year", type: "label" } };
    const filtersOf = (filter_by: unknown) =>
        buildAfmExecution(emptyEntities, buildQueryWithFilters(filter_by)).execution.execution.filters;
    const dateFilter = {
        type: "date_filter",
        using: "expected_ship_date",
        granularity: "YEAR",
        from: -10,
        to: 0,
    };
    const relative = { relativeDateFilter: { dataset, granularity: "YEAR", from: -10, to: 0 } };

    it("emits the positive with: filter right after the date filter", () => {
        expect(
            filtersOf({
                f: {
                    ...dateFilter,
                    with: {
                        y: {
                            type: "attribute_filter",
                            using: "label/expected_ship_date.year",
                            state: { include: ["2025"] },
                        },
                    },
                },
            }),
        ).toEqual([relative, { positiveAttributeFilter: { label: year, in: { values: ["2025"] } } }]);
    });

    it("emits the negative with: filter", () => {
        expect(
            filtersOf({
                f: {
                    ...dateFilter,
                    with: {
                        y: {
                            type: "attribute_filter",
                            using: "label/expected_ship_date.year",
                            state: { exclude: ["2025"] },
                        },
                    },
                },
            }),
        ).toEqual([relative, { negativeAttributeFilter: { label: year, notIn: { values: ["2025"] } } }]);
    });

    it("keeps with: filters of an All time filter that is itself not sent", () => {
        expect(
            filtersOf({
                f: {
                    type: "date_filter",
                    using: "expected_ship_date",
                    with: {
                        y: {
                            type: "attribute_filter",
                            using: "label/expected_ship_date.year",
                            state: { include: ["2025"] },
                        },
                    },
                },
            }),
        ).toEqual([{ positiveAttributeFilter: { label: year, in: { values: ["2025"] } } }]);
    });

    it("applies with: filters of a metric-level date filter", () => {
        const query = {
            fields: {
                m1: {
                    aggregation: "COUNT",
                    using: "attribute/order_item_id",
                    filter_by: {
                        f: {
                            ...dateFilter,
                            with: {
                                y: {
                                    type: "attribute_filter",
                                    using: "label/expected_ship_date.year",
                                    state: { include: ["2025"] },
                                },
                            },
                        },
                    },
                },
            },
        } as unknown as Query;
        const { measures } = buildAfmExecution(emptyEntities, query).execution.execution;
        expect((measures[0].definition as any).measure.filters).toEqual([
            relative,
            { positiveAttributeFilter: { label: year, in: { values: ["2025"] } } },
        ]);
    });
});
