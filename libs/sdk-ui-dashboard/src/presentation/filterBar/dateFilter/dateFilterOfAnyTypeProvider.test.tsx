// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    type IDashboardDateFilter,
    idRef,
    newAbsoluteDashboardDateFilter,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { toDateFilterOfAnyTypeProvider } from "./dateFilterOfAnyTypeProvider.js";
import { type CustomDashboardDateFilterComponent } from "./types.js";

const CustomDateFilter: CustomDashboardDateFilterComponent = () => null;

describe("toDateFilterOfAnyTypeProvider", () => {
    const provider = vi.fn((_filter: IDashboardDateFilter) => CustomDateFilter);
    const converted = toDateFilterOfAnyTypeProvider(provider);

    it("asks the provider for the common date filter set to All time, which has no filter", () => {
        // @ts-expect-error -- the filter bar passes no filter for All time, which the provider type does not admit
        expect(converted(undefined)).toBeDefined();
    });

    it("asks the provider for a date filter of the old type", () => {
        expect(converted(newAbsoluteDashboardDateFilter("2026-01-01", "2026-01-31"))).toBeDefined();
    });

    it("returns no component for a period", () => {
        expect(converted(newDashboardParameterizedDateFilter(idRef("period", "parameter")))).toBeUndefined();
    });
});
