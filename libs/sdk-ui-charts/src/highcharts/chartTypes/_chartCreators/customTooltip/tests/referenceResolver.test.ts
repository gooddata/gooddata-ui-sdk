// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ResolvedReference } from "@gooddata/sdk-ui-vis-commons";

import { type IUnsafeHighchartsTooltipPoint } from "../../../../typings/unsafe.js";
import { resolveReferencesFromPoint } from "../referenceResolver.js";

function value(text: string): ResolvedReference {
    return { kind: "value", text };
}

const EMPTY: ResolvedReference = { kind: "empty" };

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
        const result = resolveReferencesFromPoint(point({ drillIntersection: [] }), undefined, undefined);
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
            undefined,
            undefined,
        );
        expect(result).toEqual({
            "label/region.display": value("East"),
            "label/region": value("East"),
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
            undefined,
            undefined,
        );
        expect(result["label/month"]).toEqual(value("March 2026"));
    });

    it("treats an empty attribute display value as the empty status (consistent with the lookup builder)", () => {
        const result = resolveReferencesFromPoint(
            point({
                drillIntersection: [
                    attributeIntersection({
                        displayFormId: "region.display",
                        attributeId: "region",
                        name: "",
                    }),
                ],
            }),
            undefined,
            undefined,
        );
        expect(result["label/region.display"]).toEqual(EMPTY);
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
            undefined,
            undefined,
        );
        expect(result["metric/revenue"]).toEqual(value("1,234.50"));
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
        expect(result["metric/revenue"]).toEqual(value("42"));
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
            "metric/revenue": value("10"),
            "metric/profit": value("20"),
            "metric/size": value("30"),
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
        expect(result["metric/intensity"]).toEqual(value("99"));
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
        expect(result["metric/target_metric"]).toEqual(value("80"));
    });

    it("renders bullet null target (target=0 + isNullTarget) as the empty status", () => {
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
        expect(result["metric/target_metric"]).toEqual(EMPTY);
    });

    it("omits measure entry when no LDM identifier can be resolved", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 1,
                drillIntersection: [measureIntersection({ localIdentifier: "orphan" })],
            }),
            undefined,
            undefined,
        );
        expect(result).toEqual({});
    });

    it("emits the empty status when point.y is null so it's distinguishable from an unresolved ref", () => {
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
            undefined,
            undefined,
        );
        expect(result["metric/revenue"]).toEqual(EMPTY);
    });

    it("uses String(rawValue) when no format is provided", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 7,
                drillIntersection: [measureIntersection({ localIdentifier: "m", identifier: "raw" })],
            }),
            undefined,
            undefined,
        );
        expect(result["metric/raw"]).toEqual(value("7"));
    });

    it("sees only the hovered point's measure; the sibling is filled in elsewhere (F1-2510)", () => {
        // Bar chart with viewBy=month and two measures [customers, returns],
        // tooltip referencing both. Hovering the *customers* bar produces a drill
        // intersection with only the customers measure — returns lives on another
        // series, so it has no entry HERE. resolveReferencesFromPoint intentionally
        // sees only the hovered point; the sibling (and null cells) are supplied by
        // the chart-wide lookup at the section layer (see section.test.ts), not here.
        const result = resolveReferencesFromPoint(
            point({
                y: 1234,
                drillIntersection: [
                    attributeIntersection({ displayFormId: "month", attributeId: "month", name: "2026-03" }),
                    measureIntersection({ localIdentifier: "mc", identifier: "customers", format: "#,##0" }),
                ],
            }),
            undefined,
            undefined,
        );
        expect(result["metric/customers"]).toEqual(value("1,234"));
        expect(result["metric/returns"]).toBeUndefined();
    });
});
