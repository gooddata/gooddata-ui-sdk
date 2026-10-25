// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    GRANULARITY_OPTIONS,
    isChronologicalDateGranularity,
    isGenericDateGranularity,
} from "./granularity.js";

describe("granularity", () => {
    describe("isChronologicalDateGranularity", () => {
        it("should filter out expected granularity options", () => {
            expect(GRANULARITY_OPTIONS.filter(isChronologicalDateGranularity)).toMatchSnapshot();
        });
    });

    describe("isGenericDateGranularity", () => {
        it("should filter out expected granularity options", () => {
            expect(GRANULARITY_OPTIONS.filter(isGenericDateGranularity)).toMatchSnapshot();
        });
    });
});
