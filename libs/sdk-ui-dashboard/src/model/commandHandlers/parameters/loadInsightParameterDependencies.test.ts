// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IdentifierRef,
    type ObjRef,
    idRef,
    serializeObjRef,
    uriRef,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

import { loadInsightParameterDependencies } from "./loadInsightParameterDependencies.js";

function makeInsight(ref: ObjRef): IInsight {
    return {
        insight: {
            ref,
            identifier: "ins",
            uri: "/insights/ins",
            title: "Insight",
            visualizationUrl: "local:test",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    };
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

const insightARef = idRef("insight-a", "insight");
const insightBRef = idRef("insight-b", "insight");
const metric = idRef("m1", "measure");
const computedAttribute = idRef("ca1", "computedAttribute");
const topN = idRef("topN", "parameter");
const sampleSize = idRef("sampleSize", "parameter");
const EMPTY_GRAPH: IReferencesResult = { nodes: [], edges: [] };

describe("loadInsightParameterDependencies", () => {
    it("maps an insight to the parameters reachable through its metric", async () => {
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: insightARef, to: metric },
                    { from: metric, to: topN },
                ],
            }),
        );

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], true);

        expect(result).toEqual({ status: "loaded", byInsight: { [serializeObjRef(insightARef)]: [topN] } });
    });

    it("maps an insight to the parameters reachable through a computed attribute, directly and via a metric", async () => {
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: insightARef, to: computedAttribute },
                    { from: computedAttribute, to: topN },
                    { from: computedAttribute, to: metric },
                    { from: metric, to: sampleSize },
                ],
            }),
        );

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], true);

        expect(result.byInsight[serializeObjRef(insightARef)]).toEqual([topN, sampleSize]);
    });

    it("lists a parameter once when several paths reach it", async () => {
        const otherMetric = idRef("m2", "measure");
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: insightARef, to: metric },
                    { from: insightARef, to: otherMetric },
                    { from: metric, to: topN },
                    { from: otherMetric, to: topN },
                ],
            }),
        );

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], true);

        expect(result.byInsight[serializeObjRef(insightARef)]).toEqual([topN]);
    });

    it("sends all insight refs in one references call with direction down", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        await loadInsightParameterDependencies(
            ctx,
            [makeInsight(insightARef), makeInsight(insightBRef)],
            true,
        );

        expect(getReferences).toHaveBeenCalledTimes(1);
        expect(getReferences).toHaveBeenCalledWith([insightARef, insightBRef], { direction: "down" });
    });

    it("keeps an insight in the map with no parameters when the graph reaches none", async () => {
        const { ctx } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], true);

        expect(result.byInsight).toEqual({ [serializeObjRef(insightARef)]: [] });
    });

    it("returns uninitialized without calling the backend when parameters are disabled", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], false);

        expect(result).toEqual({ status: "uninitialized", byInsight: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("returns loaded with an empty map without calling the backend when there are no insights", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadInsightParameterDependencies(ctx, [], true);

        expect(result).toEqual({ status: "loaded", byInsight: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("skips insights referenced by uri", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadInsightParameterDependencies(
            ctx,
            [makeInsight(uriRef("/insights/x"))],
            true,
        );

        expect(result).toEqual({ status: "loaded", byInsight: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("walks from the typed insight node when the root ref has no type", async () => {
        const untypedRef = idRef("insight-a");
        const { ctx } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: insightARef, to: metric },
                    { from: metric, to: topN },
                ],
            }),
        );

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(untypedRef)], true);

        expect(result.byInsight).toEqual({ [serializeObjRef(untypedRef)]: [topN] });
    });

    it("returns failed when the references service throws", async () => {
        const { ctx } = makeCtx(() => Promise.reject(new Error("boom")));

        const result = await loadInsightParameterDependencies(ctx, [makeInsight(insightARef)], true);

        expect(result).toEqual({ status: "failed", byInsight: {} });
    });
});
