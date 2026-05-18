// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IdentifierRef, type ObjRef, idRef, uriRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../../types/commonTypes.js";
import { loadMeasureParameterDependencies } from "../loadMeasureParameterDependencies.js";

function makeInsight(measuresFromRefs: ObjRef[]): IInsight {
    return {
        insight: {
            ref: idRef("ins-1", "insight"),
            identifier: "ins-1",
            uri: "/insights/ins-1",
            title: "Insight 1",
            visualizationUrl: "local:test",
            buckets: [
                {
                    items: measuresFromRefs.map((ref, idx) => ({
                        measure: {
                            localIdentifier: `m-${idx}`,
                            definition: {
                                measureDefinition: { item: ref },
                            },
                        },
                    })),
                },
            ],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as unknown as IInsight;
}

function makeInsightWithArithmeticMeasure(): IInsight {
    return {
        insight: {
            ref: idRef("ins-arith", "insight"),
            identifier: "ins-arith",
            uri: "/insights/ins-arith",
            title: "Arithmetic insight",
            visualizationUrl: "local:test",
            buckets: [
                {
                    items: [
                        {
                            measure: {
                                localIdentifier: "arith",
                                definition: {
                                    arithmeticMeasure: {
                                        measureIdentifiers: ["m-a", "m-b"],
                                        operator: "sum",
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as unknown as IInsight;
}

function makeCtx(getReferencesImpl: (refs: IdentifierRef | IdentifierRef[]) => Promise<IReferencesResult>): {
    ctx: DashboardContext;
    getReferences: ReturnType<typeof vi.fn>;
} {
    const getReferences = vi.fn(getReferencesImpl);
    const ctx = {
        backend: {
            workspace: () => ({
                references: () => ({ getReferences }),
            }),
        } as unknown,
        workspace: "ws-1",
    } as DashboardContext;
    return { ctx, getReferences };
}

describe("loadMeasureParameterDependencies", () => {
    it("returns uninitialized status without calling backend when enableParameters is off", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));
        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([])], false);

        expect(result).toEqual({ status: "uninitialized", byMetric: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("returns loaded with empty map when no insight references any metric", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));
        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([])], true);

        expect(result).toEqual({ status: "loaded", byMetric: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("queries the references service with all metric refs and direction down (single batch call)", async () => {
        const m1 = idRef("m1", "measure");
        const m2 = idRef("m2", "measure");
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));

        await loadMeasureParameterDependencies(ctx, [makeInsight([m1, m2])], true);

        expect(getReferences).toHaveBeenCalledTimes(1);
        expect(getReferences).toHaveBeenCalledWith(expect.arrayContaining([m1, m2]), { direction: "down" });
    });

    it("maps metric ref -> direct parameter refs from the returned edges", async () => {
        const m1 = idRef("m1", "measure");
        const topN = idRef("topN", "parameter");
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [
                    { ...m1, title: "M1" },
                    { ...topN, title: "Top N" },
                ],
                edges: [{ from: m1, to: topN }],
            }),
        );

        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([m1])], true);

        expect(result.status).toBe("loaded");
        expect(result.byMetric["m1"]).toEqual([topN]);
    });

    it("collects transitive parameters through metric -> metric -> parameter chains", async () => {
        const root = idRef("root", "measure");
        const inner = idRef("inner", "measure");
        const topN = idRef("topN", "parameter");
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [
                    { ...root, title: "root" },
                    { ...inner, title: "inner" },
                    { ...topN, title: "Top N" },
                ],
                edges: [
                    { from: root, to: inner },
                    { from: inner, to: topN },
                ],
            }),
        );

        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([root])], true);

        expect(result.byMetric["root"]).toEqual([topN]);
    });

    it("deduplicates parameter refs reachable from a metric via multiple paths", async () => {
        const root = idRef("root", "measure");
        const m1 = idRef("m1", "measure");
        const m2 = idRef("m2", "measure");
        const topN = idRef("topN", "parameter");
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [
                    { ...root, title: "root" },
                    { ...m1, title: "m1" },
                    { ...m2, title: "m2" },
                    { ...topN, title: "topN" },
                ],
                edges: [
                    { from: root, to: m1 },
                    { from: root, to: m2 },
                    { from: m1, to: topN },
                    { from: m2, to: topN },
                ],
            }),
        );

        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([root])], true);

        expect(result.byMetric["root"]).toHaveLength(1);
        expect(result.byMetric["root"][0]).toEqual(topN);
    });

    it("returns failed status when references service throws", async () => {
        const m1 = idRef("m1", "measure");
        const { ctx } = makeCtx(() => Promise.reject(new Error("boom")));

        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([m1])], true);

        expect(result).toEqual({ status: "failed", byMetric: {} });
    });

    it("ignores arithmetic measures (no item ref to resolve)", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));

        const result = await loadMeasureParameterDependencies(
            ctx,
            [makeInsightWithArithmeticMeasure()],
            true,
        );

        expect(result).toEqual({ status: "loaded", byMetric: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("deduplicates metric refs across insights", async () => {
        const m1 = idRef("m1", "measure");
        const m1Twice = idRef("m1", "measure"); // same identity, different object
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));

        await loadMeasureParameterDependencies(ctx, [makeInsight([m1]), makeInsight([m1Twice])], true);

        const requestedRefs = getReferences.mock.calls[0]![0] as IdentifierRef[];
        expect(requestedRefs).toHaveLength(1);
    });

    it("skips metric refs in non-identifier (uri) form", async () => {
        const m1 = uriRef("/metric/m1");
        const { ctx, getReferences } = makeCtx(() => Promise.resolve({ nodes: [], edges: [] }));

        const result = await loadMeasureParameterDependencies(ctx, [makeInsight([m1])], true);

        expect(result).toEqual({ status: "loaded", byMetric: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });
});
