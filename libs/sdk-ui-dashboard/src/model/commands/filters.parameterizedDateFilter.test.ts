// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, newParameterizedDateFilter } from "@gooddata/sdk-model";

import { applyDateFilter } from "./filters.js";

describe("applyDateFilter with a parameterized date filter", () => {
    it("refuses it from an untyped caller", () => {
        const filter = newParameterizedDateFilter(idRef("closed", "dataSet"), "period");

        expect(() => Reflect.apply(applyDateFilter, undefined, [filter])).toThrow(
            "Parameterized date filters are not supported yet.",
        );
    });
});
