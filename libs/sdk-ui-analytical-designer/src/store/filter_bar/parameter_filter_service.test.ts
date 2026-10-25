// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { buildParameter } from "../../tests/parameter.test.helpers.js";

import { restoreParameterFilters } from "./parameter_filter_service.js";

const threshold = buildParameter("threshold", "Threshold", {
    type: "NUMBER",
    defaultValue: 10,
    constraints: { min: 0, max: 100 },
});

const scenario = buildParameter("scenario", "Scenario", {
    type: "STRING",
    defaultValue: "Actual",
    constraints: {
        allowedValues: [{ value: "Actual" }, { value: "Pessimistic" }],
    },
});

describe("restoreParameterFilters", () => {
    it("restores a valid stored number value", () => {
        const result = restoreParameterFilters([{ ref: threshold.ref, value: 25 }], [threshold]);

        expect(result.filters).toHaveLength(1);
        expect(result.filters[0]).toMatchObject({
            type: "parameter",
            parameterRef: threshold.ref,
            name: "Threshold",
            value: 25,
            definition: threshold.definition,
        });
        expect(result.warnings).toEqual([]);
    });

    it("restores a valid stored string value", () => {
        const result = restoreParameterFilters([{ ref: scenario.ref, value: "Pessimistic" }], [scenario]);

        expect(result.filters).toMatchObject([{ value: "Pessimistic" }]);
        expect(result.warnings).toEqual([]);
    });

    it("returns no filters and no warnings for empty inputs", () => {
        expect(restoreParameterFilters([], [])).toEqual({ filters: [], warnings: [] });
    });

    it("keeps a string value that is not in allowedValues and warns about the reset", () => {
        const result = restoreParameterFilters([{ ref: scenario.ref, value: "Optimistic" }], [scenario]);

        expect(result.filters).toMatchObject([{ parameterRef: scenario.ref, value: "Optimistic" }]);
        expect(result.warnings).toEqual([{ kind: "reset", ref: scenario.ref, name: "Scenario" }]);
    });

    it("keeps a number value outside min/max and warns about the reset", () => {
        const result = restoreParameterFilters([{ ref: threshold.ref, value: 500 }], [threshold]);

        expect(result.filters).toMatchObject([{ parameterRef: threshold.ref, value: 500 }]);
        expect(result.warnings).toEqual([{ kind: "reset", ref: threshold.ref, name: "Threshold" }]);
    });

    it("reports a value whose parameter no longer exists as removed, named by identifier", () => {
        const deletedRef = idRef("deleted_param", "parameter");

        const result = restoreParameterFilters([{ ref: deletedRef, value: 99 }], [threshold]);

        expect(result).toEqual({
            filters: [],
            warnings: [{ kind: "removed", ref: deletedRef, name: "deleted_param" }],
        });
    });

    it("reports a number value stored for a STRING parameter as incompatible", () => {
        const result = restoreParameterFilters([{ ref: scenario.ref, value: 7 }], [scenario]);

        expect(result).toEqual({
            filters: [],
            warnings: [{ kind: "incompatible", ref: scenario.ref, name: "Scenario" }],
        });
    });

    it("reports a string value stored for a NUMBER parameter as incompatible", () => {
        const result = restoreParameterFilters([{ ref: threshold.ref, value: "Budget" }], [threshold]);

        expect(result).toEqual({
            filters: [],
            warnings: [{ kind: "incompatible", ref: threshold.ref, name: "Threshold" }],
        });
    });

    it("keeps input order for filters and warnings", () => {
        const result = restoreParameterFilters(
            [
                { ref: scenario.ref, value: "Optimistic" },
                { ref: idRef("deleted_param", "parameter"), value: 1 },
                { ref: threshold.ref, value: 25 },
                { ref: idRef("other_deleted", "parameter"), value: 2 },
                { ref: threshold.ref, value: 500 },
            ],
            [threshold, scenario],
        );

        expect(result.filters).toMatchObject([
            { parameterRef: scenario.ref, value: "Optimistic" },
            { parameterRef: threshold.ref, value: 25 },
            { parameterRef: threshold.ref, value: 500 },
        ]);
        expect(result.warnings).toEqual([
            { kind: "reset", ref: scenario.ref, name: "Scenario" },
            { kind: "removed", ref: idRef("deleted_param", "parameter"), name: "deleted_param" },
            { kind: "removed", ref: idRef("other_deleted", "parameter"), name: "other_deleted" },
            { kind: "reset", ref: threshold.ref, name: "Threshold" },
        ]);
    });
});
