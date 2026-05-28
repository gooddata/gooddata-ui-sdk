// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
    idRef,
    localIdRef,
} from "@gooddata/sdk-model";

import { convertExecutionFilterToFilterContextItem } from "../AutomationConverter.js";

describe("convertExecutionFilterToFilterContextItem — MVF branch", () => {
    const baseMvf = (overrides: Partial<IMeasureValueFilter["measureValueFilter"]>): IMeasureValueFilter => ({
        measureValueFilter: {
            measure: idRef("m1", "measure"),
            ...overrides,
        },
    });

    it("converts a comparison MVF with ObjRef measure", () => {
        const filter = baseMvf({
            localIdentifier: "mvf1",
            conditions: [{ comparison: { operator: "GREATER_THAN", value: 100 } }],
            dimensionality: [idRef("label.product")],
        });

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");

        expect(result).toEqual({
            dashboardMeasureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 100 } }],
                dimensionality: [idRef("label.product")],
            },
        });
    });

    it("uses the fallback localIdentifier when source has none", () => {
        const filter = baseMvf({
            conditions: [{ comparison: { operator: "GREATER_THAN", value: 1 } }],
        });

        const result = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-7");
        expect((result as IDashboardMeasureValueFilter).dashboardMeasureValueFilter.localIdentifier).toBe(
            "legacy-mvf-7",
        );
    });

    it("is pure: same input + same fallback → same output", () => {
        const filter = baseMvf({});
        const a = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-0");
        const b = convertExecutionFilterToFilterContextItem(filter, "legacy-mvf-0");
        expect(a).toEqual(b);
    });

    it("propagates the `title` field when present at runtime", () => {
        const filter = {
            measureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
                // Not on the official execution-side type, but kept defensively from richer sources.
                title: "Revenue > 10",
            },
        } as unknown as IMeasureValueFilter;

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect((result as IDashboardMeasureValueFilter).dashboardMeasureValueFilter.title).toBe(
            "Revenue > 10",
        );
    });

    it("omits the conditions field when the source has none (All)", () => {
        const filter = baseMvf({ localIdentifier: "mvf1" });
        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect(result).toEqual({
            dashboardMeasureValueFilter: {
                measure: idRef("m1", "measure"),
                localIdentifier: "mvf1",
            },
        });
    });

    it("drops MVFs keyed by LocalIdRef and warns (dashboard MVF requires catalog ObjRef)", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const filter: IMeasureValueFilter = {
            measureValueFilter: {
                measure: localIdRef("local-m1"),
                localIdentifier: "mvf1",
                conditions: [{ comparison: { operator: "GREATER_THAN", value: 1 } }],
            },
        };

        const result = convertExecutionFilterToFilterContextItem(filter, "fallback");
        expect(result).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("LocalIdRef"), filter);
        warn.mockRestore();
    });
});
