// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IReferencesResult, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IdentifierRef,
    type ObjRef,
    idRef,
    serializeObjRef,
    uriRef,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

import { insightRoots, loadParameterDependencies } from "./loadParameterDependencies.js";

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

function unknownRootError(): UnexpectedResponseError {
    return new UnexpectedResponseError("bad request", 400, {
        detail: "Unknown object identifiers: ['VISUALISATION/insight-b']",
    });
}

describe("loadParameterDependencies", () => {
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

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(insightARef)]));

        expect(result).toEqual({ byRoot: { [serializeObjRef(insightARef)]: [topN] }, failedRoots: [] });
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

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(insightARef)]));

        expect(result.byRoot[serializeObjRef(insightARef)]).toEqual([topN, sampleSize]);
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

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(insightARef)]));

        expect(result.byRoot[serializeObjRef(insightARef)]).toEqual([topN]);
    });

    it("sends all insight refs in one references call with direction down", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        await loadParameterDependencies(
            ctx,
            insightRoots([makeInsight(insightARef), makeInsight(insightBRef)]),
        );

        expect(getReferences).toHaveBeenCalledTimes(1);
        expect(getReferences).toHaveBeenCalledWith([insightARef, insightBRef], { direction: "down" });
    });

    it("keeps an insight in the map with no parameters when the graph reaches none", async () => {
        const { ctx } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(insightARef)]));

        expect(result.byRoot).toEqual({ [serializeObjRef(insightARef)]: [] });
    });

    it("returns an empty map without calling the backend when there are no insights", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadParameterDependencies(ctx, insightRoots([]));

        expect(result).toEqual({ byRoot: {}, failedRoots: [] });
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

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(untypedRef)]));

        expect(result.byRoot).toEqual({ [serializeObjRef(untypedRef)]: [topN] });
    });

    it("records a failed root without retrying a single-root request", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.reject(new Error("boom")));

        const result = await loadParameterDependencies(ctx, insightRoots([makeInsight(insightARef)]));

        expect(result).toEqual({ byRoot: {}, failedRoots: [insightARef] });
        expect(getReferences).toHaveBeenCalledTimes(1);
    });

    it("recovers successful roots separately after a batch is rejected for one unknown root", async () => {
        const { ctx, getReferences } = makeCtx((roots) => {
            const requested = Array.isArray(roots) ? roots : [roots];
            if (requested.length > 1 || requested[0].identifier === insightBRef.identifier) {
                return Promise.reject(unknownRootError());
            }
            return Promise.resolve({ nodes: [], edges: [{ from: insightARef, to: topN }] });
        });

        const result = await loadParameterDependencies(ctx, [insightARef, insightBRef]);

        expect(result).toEqual({
            byRoot: { [serializeObjRef(insightARef)]: [topN] },
            failedRoots: [insightBRef],
        });
        expect(getReferences).toHaveBeenCalledTimes(3);
    });

    it("fails every root at once when the whole endpoint fails", async () => {
        const { ctx, getReferences } = makeCtx(() =>
            Promise.reject(new UnexpectedResponseError("server error", 500, {})),
        );

        const result = await loadParameterDependencies(ctx, [insightARef, insightBRef]);

        expect(result).toEqual({ byRoot: {}, failedRoots: [insightARef, insightBRef] });
        expect(getReferences).toHaveBeenCalledTimes(1);
    });

    it("walks from a root of any type, keyed exactly as it was supplied", async () => {
        const { ctx, getReferences } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [{ from: metric, to: topN }],
            }),
        );

        const result = await loadParameterDependencies(ctx, [metric]);

        expect(getReferences).toHaveBeenCalledWith([metric], { direction: "down" });
        expect(result).toEqual({ byRoot: { [serializeObjRef(metric)]: [topN] }, failedRoots: [] });
    });

    it("maps roots of different types in one call", async () => {
        const { ctx, getReferences } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: insightARef, to: metric },
                    { from: metric, to: topN },
                    { from: computedAttribute, to: sampleSize },
                ],
            }),
        );

        const result = await loadParameterDependencies(ctx, [insightARef, computedAttribute]);

        expect(getReferences).toHaveBeenCalledTimes(1);
        expect(result.byRoot).toEqual({
            [serializeObjRef(insightARef)]: [topN],
            [serializeObjRef(computedAttribute)]: [sampleSize],
        });
    });
});

describe("insightRoots", () => {
    it("drops the insights referenced by uri", () => {
        expect(insightRoots([makeInsight(insightARef), makeInsight(uriRef("/insights/x"))])).toEqual([
            insightARef,
        ]);
    });
});
