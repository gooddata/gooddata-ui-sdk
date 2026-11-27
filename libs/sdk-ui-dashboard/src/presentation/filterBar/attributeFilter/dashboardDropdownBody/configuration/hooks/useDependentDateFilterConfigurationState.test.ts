// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newAbsoluteDashboardDateFilter, newRelativeDashboardDateFilter } from "@gooddata/sdk-model";

import { getDateFilterRange } from "./useDependentDateFilterConfigurationState.js";

describe("getDateFilterRange", () => {
    it("describes a missing common date filter as All time", () => {
        expect(getDateFilterRange(undefined)).toEqual({
            granularity: "GDC.time.date",
            type: "relative",
        });
    });

    it("keeps the range of a relative common date filter", () => {
        expect(getDateFilterRange(newRelativeDashboardDateFilter("GDC.time.month", -3, -1))).toEqual({
            type: "relative",
            granularity: "GDC.time.month",
            from: -3,
            to: -1,
        });
    });

    it("keeps the range of an absolute common date filter", () => {
        expect(getDateFilterRange(newAbsoluteDashboardDateFilter("2026-03-01", "2026-03-31"))).toEqual({
            type: "absolute",
            granularity: "GDC.time.date",
            from: "2026-03-01",
            to: "2026-03-31",
        });
    });

    it("describes an absolute common date filter with granularity as an absolute one", () => {
        expect(
            getDateFilterRange({
                dashboardAbsoluteGranularityDateFilter: {
                    granularity: "GDC.time.month",
                    from: "2026-03",
                    to: "2026-05",
                },
            }),
        ).toEqual({ type: "absolute" });
    });
});
