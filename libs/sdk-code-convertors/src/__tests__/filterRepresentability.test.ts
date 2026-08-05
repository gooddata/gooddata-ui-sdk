// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { declarativeVisualisationToYaml } from "../from/declarativeVisualisationToYaml.js";
import { CoreErrorCode, type ICoreError } from "../utils/errors.js";

type Declarative = Parameters<typeof declarativeVisualisationToYaml>[1];

const measure = {
    measure: {
        localIdentifier: "m1",
        definition: { measureDefinition: { item: { identifier: "revenue", type: "measure" } } },
    },
};

const withFilters = (filters: unknown[]) =>
    ({
        id: "b1",
        title: "B",
        content: {
            visualizationUrl: "local:bar",
            buckets: [{ localIdentifier: "measures", items: [measure] }],
            filters,
            sorts: [],
            properties: {},
        },
    }) as Declarative;

const emitFilters = (filters: unknown[]) =>
    declarativeVisualisationToYaml([], withFilters(filters)).json as {
        query: { filter_by: Record<string, Record<string, unknown>> };
    };

/** Rethrows anything that is not a deliberate refusal, so an incidental throw is not read as one. */
const refusalOf = (filters: unknown[]): ICoreError | null => {
    try {
        emitFilters(filters);
        return null;
    } catch (err: unknown) {
        if (err instanceof Error && typeof (err as ICoreError).code === "string") {
            return err as ICoreError;
        }
        throw err;
    }
};

const displayForm = { identifier: "region", type: "displayForm" as const };
const mvf = (condition: unknown) => ({
    measureValueFilter: { measure: { localIdentifier: "m1" }, ...(condition as object) },
});
const comparison = (value: number, treatNullValuesAs?: number) => ({
    comparison: {
        operator: "GREATER_THAN",
        value,
        ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
    },
});

describe("filters with no code form are refused rather than degraded", () => {
    it("refuses a selection given by uri, which would read back as selecting every element", () => {
        const error = refusalOf([
            { positiveAttributeFilter: { displayForm, in: { uris: ["/elements?id=1"] } } },
        ]);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain("not given by value");
    });

    it("refuses a selection of nothing given by uri, which reads back as every element", () => {
        expect(refusalOf([{ positiveAttributeFilter: { displayForm, in: { uris: [] } } }])?.code).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });

    it("refuses an exclusion given by uri, which would read back as excluding none", () => {
        const error = refusalOf([
            { negativeAttributeFilter: { displayForm, notIn: { uris: ["/elements?id=1"] } } },
        ]);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain("not given by value");
    });

    it("takes an exclusion of nothing given by uri, which already means what it says", () => {
        expect(refusalOf([{ negativeAttributeFilter: { displayForm, notIn: { uris: [] } } }])).toBeNull();
    });

    it("takes a selection listing no element, which is a list all the same", () => {
        expect(refusalOf([{ positiveAttributeFilter: { displayForm, in: { values: [] } } }])).toBeNull();
    });

    it("refuses a ranking over more attributes than the one it can name", () => {
        const error = refusalOf([
            {
                rankingFilter: {
                    measure: { localIdentifier: "m1" },
                    operator: "TOP",
                    value: 3,
                    attributes: [{ localIdentifier: "a1" }, { localIdentifier: "a2" }],
                },
            },
        ]);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain("ranking over 2 attributes");
    });

    it("takes a ranking over the one attribute it can name", () => {
        expect(
            refusalOf([
                {
                    rankingFilter: {
                        measure: { localIdentifier: "m1" },
                        operator: "TOP",
                        value: 3,
                        attributes: [{ localIdentifier: "a1" }],
                    },
                },
            ]),
        ).toBeNull();
    });

    it.each([
        ["written plainly", mvf({ condition: comparison(100, 42) })],
        [
            "lifted out of a nested list",
            mvf({ condition: { compound: { conditions: [comparison(100)], treatNullValuesAs: 42 } } }),
        ],
    ])("refuses nulls standing in for a value other than zero, %s", (_case, filter) => {
        const error = refusalOf([filter]);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain("null values treated as 42");
    });

    it("refuses a condition of a kind it has no form for", () => {
        const error = refusalOf([mvf({ condition: { somethingElse: { operator: "X" } } })]);

        expect(error?.code).toBe(CoreErrorCode.ItemNotSupported);
        expect(error?.message).toContain("condition");
    });

    it("refuses a nested list holding a condition of a kind it has no form for", () => {
        expect(refusalOf([mvf({ conditions: [comparison(100), { somethingElse: {} }] })])?.code).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });
});

describe("a metric filter's conditions", () => {
    const conditionsOf = (filter: unknown) => {
        const entry = Object.values(emitFilters([filter]).query.filter_by)[0];
        return entry as { conditions?: unknown[]; null_values_as_zero?: boolean; condition?: string };
    };

    it("writes every condition of a filter stored as one nested list", () => {
        // More than one condition is nested under `compound` by convertMeasureValueFilterSdkToTiger.
        const entry = conditionsOf(
            mvf({
                condition: {
                    compound: {
                        conditions: [comparison(100), { range: { operator: "BETWEEN", from: 1, to: 9 } }],
                    },
                },
            }),
        );

        expect(entry.conditions).toHaveLength(2);
    });

    it("records nulls counting for zero once, where the nesting lifted it out", () => {
        const entry = conditionsOf(
            mvf({ condition: { compound: { conditions: [comparison(100)], treatNullValuesAs: 0 } } }),
        );

        expect(entry.null_values_as_zero).toBe(true);
    });

    it("writes no condition list for a nesting that holds none, which a list may not be", () => {
        const entry = conditionsOf(mvf({ condition: { compound: { conditions: [] } } }));

        expect(entry).not.toHaveProperty("conditions");
    });

    it("writes a lone condition plainly, which needs no list", () => {
        const entry = conditionsOf(mvf({ conditions: [comparison(100)] }));

        expect(entry).not.toHaveProperty("conditions");
        expect(entry.condition).toBe("GREATER_THAN");
    });
});
