// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { newParameterizedDateFilter } from "@gooddata/sdk-model";

import { convertExtendedFilter } from "./FilterConverter.js";

describe("convertExtendedFilter", () => {
    it("refuses a parameterized date filter", () => {
        expect(() => convertExtendedFilter(newParameterizedDateFilter("closed", "period"), false)).toThrow(
            "Parameterized date filters are not supported in insights yet.",
        );
    });
});
