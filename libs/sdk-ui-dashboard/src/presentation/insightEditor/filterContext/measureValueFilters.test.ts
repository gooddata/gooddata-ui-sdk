// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardMeasureValueFilter,
    type IInsight,
    type IInsightWidget,
    type IMeasure,
    idRef,
    localIdRef,
    newMeasure,
    newMeasureValueFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { filterDashboardMvfsForWidget, toMeasureValueFilterItems } from "./measureValueFilters.js";

function buildDashboardMvf(
    measureRef: { identifier?: string; uri?: string },
    localId = "mvf-local",
    conditions: IDashboardMeasureValueFilter["dashboardMeasureValueFilter"]["conditions"] = [
        { comparison: { operator: "GREATER_THAN", value: 100 } },
    ],
): IDashboardMeasureValueFilter {
    return {
        dashboardMeasureValueFilter: {
            measure: measureRef.uri ? uriRef(measureRef.uri) : idRef(measureRef.identifier!, "measure"),
            localIdentifier: localId,
            conditions,
        },
    };
}

describe("toMeasureValueFilterItems", () => {
    it("returns empty for no dashboard MVFs", () => {
        expect(toMeasureValueFilterItems([])).toEqual([]);
    });

    it("forwards MVF with identifier ref and emits the dashboard local identifier", () => {
        const mvf = buildDashboardMvf({ identifier: "metric1" }, "mvf-a");
        expect(toMeasureValueFilterItems([mvf])).toEqual([
            {
                measureValueFilter: {
                    measure: { identifier: "metric1" },
                    localIdentifier: "mvf-a",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 100 } }],
                },
            },
        ]);
    });

    it("drops MVF that references a uri (Tiger-only contract)", () => {
        const mvf = buildDashboardMvf({ uri: "/gdc/md/metric1" }, "mvf-a");
        expect(toMeasureValueFilterItems([mvf])).toEqual([]);
    });

    it("forwards multiple MVFs for distinct metrics", () => {
        const result = toMeasureValueFilterItems([
            buildDashboardMvf({ identifier: "m1" }, "mvf-a"),
            buildDashboardMvf({ identifier: "m2" }, "mvf-b"),
        ]);
        expect(result).toHaveLength(2);
        expect(result.map((f) => f.measureValueFilter.measure.identifier)).toEqual(["m1", "m2"]);
        expect(result.map((f) => f.measureValueFilter.localIdentifier)).toEqual(["mvf-a", "mvf-b"]);
    });

    it("omits conditions when MVF has empty/undefined conditions (cleared)", () => {
        const mvf = buildDashboardMvf({ identifier: "metric1" }, "mvf-a", []);
        const result = toMeasureValueFilterItems([mvf]);
        expect(result[0].measureValueFilter.conditions).toBeUndefined();
        expect(result[0].measureValueFilter.localIdentifier).toBe("mvf-a");
    });
});

function buildWidget(ignoredMeasureIdentifiers: string[] = []): IInsightWidget {
    return {
        ignoreDashboardFilters: ignoredMeasureIdentifiers.map((identifier) => ({
            type: "measureValueFilterReference",
            measure: idRef(identifier, "measure"),
        })),
    } as unknown as IInsightWidget;
}

function buildInsightWithMvfsOn(metricIdentifiers: string[]): IInsight {
    return {
        insight: {
            filters: metricIdentifiers.map((identifier) =>
                newMeasureValueFilter(idRef(identifier, "measure"), "GREATER_THAN", 0),
            ),
        },
    } as unknown as IInsight;
}

function buildInsightWithLocalIdMvf(metricIdentifier: string, measureLocalId: string): IInsight {
    const measure: IMeasure = newMeasure(idRef(metricIdentifier, "measure"), (m) =>
        m.localId(measureLocalId),
    );
    return {
        insight: {
            buckets: [{ localIdentifier: "measures", items: [measure] }],
            filters: [newMeasureValueFilter(localIdRef(measureLocalId), "GREATER_THAN", 0)],
        },
    } as unknown as IInsight;
}

describe("filterDashboardMvfsForWidget", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("returns all dashboard MVFs unchanged when nothing is ignored and insight has none", () => {
        const mvfs = [buildDashboardMvf({ identifier: "m1" }), buildDashboardMvf({ identifier: "m2" })];
        const result = filterDashboardMvfsForWidget(buildWidget(), mvfs, buildInsightWithMvfsOn([]));
        expect(result).toEqual(mvfs);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("drops MVFs referenced by widget.ignoreDashboardFilters", () => {
        const result = filterDashboardMvfsForWidget(
            buildWidget(["m2"]),
            [buildDashboardMvf({ identifier: "m1" }), buildDashboardMvf({ identifier: "m2" })],
            undefined,
        );
        expect(result).toHaveLength(1);
        expect(result[0].dashboardMeasureValueFilter.measure).toEqual(idRef("m1", "measure"));
    });

    it("warns but still emits when insight already has an MVF on the same metric", () => {
        const mvf = buildDashboardMvf({ identifier: "m1" });
        const result = filterDashboardMvfsForWidget(buildWidget(), [mvf], buildInsightWithMvfsOn(["m1"]));
        expect(result).toEqual([mvf]);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toContain("m1");
    });

    it("does not warn for non-overlapping metrics even when insight has its own MVFs", () => {
        const mvf = buildDashboardMvf({ identifier: "m1" });
        const result = filterDashboardMvfsForWidget(buildWidget(), [mvf], buildInsightWithMvfsOn(["m2"]));
        expect(result).toEqual([mvf]);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("warns once per overlapping dashboard MVF only after applying widget-ignore", () => {
        const mvfs = [buildDashboardMvf({ identifier: "m1" }), buildDashboardMvf({ identifier: "m2" })];
        const result = filterDashboardMvfsForWidget(
            buildWidget(["m1"]),
            mvfs,
            buildInsightWithMvfsOn(["m1", "m2"]),
        );
        expect(result).toHaveLength(1);
        expect(result[0].dashboardMeasureValueFilter.measure).toEqual(idRef("m2", "measure"));
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toContain("m2");
    });

    it("tolerates undefined insight (no warning, no crash)", () => {
        const mvf = buildDashboardMvf({ identifier: "m1" });
        const result = filterDashboardMvfsForWidget(buildWidget(), [mvf], undefined);
        expect(result).toEqual([mvf]);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("warns when insight MVF references its measure via LocalIdRef that resolves to the dashboard MVF's metric", () => {
        const mvf = buildDashboardMvf({ identifier: "m1" });
        const result = filterDashboardMvfsForWidget(
            buildWidget(),
            [mvf],
            buildInsightWithLocalIdMvf("m1", "m1-local"),
        );
        expect(result).toEqual([mvf]);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toContain("m1");
    });

    it("does not warn when insight MVF LocalIdRef resolves to a different catalog metric", () => {
        const mvf = buildDashboardMvf({ identifier: "m1" });
        const result = filterDashboardMvfsForWidget(
            buildWidget(),
            [mvf],
            buildInsightWithLocalIdMvf("m2", "m2-local"),
        );
        expect(result).toEqual([mvf]);
        expect(warnSpy).not.toHaveBeenCalled();
    });
});
