// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUnsafeHighchartsTooltipPoint } from "../../../../typings/unsafe.js";
import { resolveReferencesFromPoint } from "../referenceResolver.js";

/**
 * Minimal mock builders for `IDrillEventIntersectionElement`. We construct only
 * the fields the resolver actually reads; any field not relevant is omitted.
 * The cast through `unknown` mirrors the production-code pattern at the same
 * Highcharts/SDK type boundary.
 */
function attributeIntersection(args: {
    displayFormId: string;
    attributeId: string;
    name: string;
    formattedName?: string;
}) {
    return {
        header: {
            attributeHeader: {
                identifier: args.displayFormId,
                formOf: { identifier: args.attributeId },
            },
            attributeHeaderItem: {
                name: args.name,
                formattedName: args.formattedName,
            },
        },
    } as unknown;
}

function measureIntersection(args: { localIdentifier: string; identifier?: string; format?: string }) {
    return {
        header: {
            measureHeaderItem: {
                localIdentifier: args.localIdentifier,
                identifier: args.identifier,
                format: args.format,
            },
        },
    } as unknown;
}

function point(args: {
    x?: number;
    y?: number;
    z?: number;
    value?: number;
    target?: number;
    isNullTarget?: boolean;
    drillIntersection: unknown[];
}): IUnsafeHighchartsTooltipPoint {
    return { ...args } as IUnsafeHighchartsTooltipPoint;
}

describe("resolveReferencesFromPoint", () => {
    it("returns empty values when drill intersection is empty", () => {
        const result = resolveReferencesFromPoint(point({ drillIntersection: [] }));
        expect(result).toEqual({});
    });

    it("registers attribute references under both display form and attribute identifiers", () => {
        const result = resolveReferencesFromPoint(
            point({
                drillIntersection: [
                    attributeIntersection({
                        displayFormId: "region.display",
                        attributeId: "region",
                        name: "East",
                    }),
                ],
            }),
        );
        expect(result).toEqual({
            "label/region.display": "East",
            "label/region": "East",
        });
    });

    it("prefers formattedName over name for attribute display values", () => {
        const result = resolveReferencesFromPoint(
            point({
                drillIntersection: [
                    attributeIntersection({
                        displayFormId: "month",
                        attributeId: "month",
                        name: "2026-03",
                        formattedName: "March 2026",
                    }),
                ],
            }),
        );
        expect(result["label/month"]).toBe("March 2026");
    });

    it("formats measure values using the provided format", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 1234.5,
                drillIntersection: [
                    measureIntersection({
                        localIdentifier: "revenueM",
                        identifier: "revenue",
                        format: "#,##0.00",
                    }),
                ],
            }),
        );
        expect(result["metric/revenue"]).toBe("1,234.50");
    });

    it("falls back to identifierMapping when measure header has no identifier", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 42,
                drillIntersection: [
                    measureIntersection({ localIdentifier: "revenuePoPm0", format: "#,##0" }),
                ],
            }),
            undefined,
            { measures: { revenuePoPm0: { ldmId: "revenue", pointField: "y" } } },
        );
        expect(result["metric/revenue"]).toBe("42");
    });

    it("reads each measure from the point field declared in identifierMapping", () => {
        // Bubble chart: x-axis measure on point.x, y-axis on point.y, size on point.z.
        const result = resolveReferencesFromPoint(
            point({
                x: 10,
                y: 20,
                z: 30,
                drillIntersection: [
                    measureIntersection({ localIdentifier: "mx" }),
                    measureIntersection({ localIdentifier: "my" }),
                    measureIntersection({ localIdentifier: "mz" }),
                ],
            }),
            undefined,
            {
                measures: {
                    mx: { ldmId: "revenue", pointField: "x" },
                    my: { ldmId: "profit", pointField: "y" },
                    mz: { ldmId: "size", pointField: "z" },
                },
            },
        );
        expect(result).toEqual({
            "metric/revenue": "10",
            "metric/profit": "20",
            "metric/size": "30",
        });
    });

    it("reads heatmap measure value from point.value", () => {
        const result = resolveReferencesFromPoint(
            point({
                value: 99,
                drillIntersection: [measureIntersection({ localIdentifier: "m" })],
            }),
            undefined,
            { measures: { m: { ldmId: "intensity", pointField: "value" } } },
        );
        expect(result["metric/intensity"]).toBe("99");
    });

    it("reads bullet target measure from point.target", () => {
        const result = resolveReferencesFromPoint(
            point({
                target: 80,
                drillIntersection: [measureIntersection({ localIdentifier: "tgt" })],
            }),
            undefined,
            { measures: { tgt: { ldmId: "target_metric", pointField: "target" } } },
        );
        expect(result["metric/target_metric"]).toBe("80");
    });

    it("treats bullet null target as no value (target=0 + isNullTarget)", () => {
        // Bullet encodes null targets as `target: 0` with an isNullTarget flag.
        // Without the flag check, the resolver would render the placeholder
        // zero as a real value.
        const result = resolveReferencesFromPoint(
            point({
                target: 0,
                isNullTarget: true,
                drillIntersection: [measureIntersection({ localIdentifier: "tgt" })],
            }),
            undefined,
            { measures: { tgt: { ldmId: "target_metric", pointField: "target" } } },
        );
        expect(result["metric/target_metric"]).toBeUndefined();
    });

    it("omits measure entry when no LDM identifier can be resolved", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 1,
                drillIntersection: [measureIntersection({ localIdentifier: "orphan" })],
            }),
        );
        expect(result).toEqual({});
    });

    it("omits measure entry when point.y is null", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: undefined,
                drillIntersection: [
                    measureIntersection({
                        localIdentifier: "revenueM",
                        identifier: "revenue",
                        format: "#,##0",
                    }),
                ],
            }),
        );
        expect(result).toEqual({});
    });

    it("uses String(rawValue) when no format is provided", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 7,
                drillIntersection: [measureIntersection({ localIdentifier: "m", identifier: "raw" })],
            }),
        );
        expect(result["metric/raw"]).toBe("7");
    });
});
