// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type IdentifierRef,
    type ObjRef,
    idRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

import {
    collectDashboardFilterContextItems,
    loadFilterParameterDependencies,
} from "./loadFilterParameterDependencies.js";

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

function attributeFilter(displayForm: ObjRef, localIdentifier: string): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm,
            negativeSelection: false,
            attributeElements: { values: [] },
            localIdentifier,
        },
    };
}

function measureValueFilter(
    measure: ObjRef,
    localIdentifier: string,
    dimensionality?: ObjRef[],
): IDashboardMeasureValueFilter {
    return { dashboardMeasureValueFilter: { measure, localIdentifier, dimensionality } };
}

const dateFilter: IDashboardDateFilter = {
    dateFilter: { type: "relative", granularity: "GDC.time.date" },
};

const computedAttribute = idRef("ca1", "computedAttribute");
const otherComputedAttribute = idRef("ca2", "computedAttribute");
const label = idRef("label1", "displayForm");
const metric = idRef("m1", "measure");
const topN = idRef("topN", "parameter");
const sampleSize = idRef("sampleSize", "parameter");
const EMPTY_GRAPH: IReferencesResult = { nodes: [], edges: [] };

describe("loadFilterParameterDependencies", () => {
    it("roots the request at the computed attribute of an attribute filter and maps it to its parameters", async () => {
        const { ctx, getReferences } = makeCtx(() =>
            Promise.resolve({ nodes: [], edges: [{ from: computedAttribute, to: topN }] }),
        );

        const result = await loadFilterParameterDependencies(
            ctx,
            [attributeFilter(computedAttribute, "af1")],
            true,
        );

        expect(getReferences).toHaveBeenCalledWith([computedAttribute], { direction: "down" });
        expect(result).toEqual({ status: "loaded", byRef: { [serializeObjRef(computedAttribute)]: [topN] } });
    });

    it("roots the request at a measure value filter's metric and its computed-attribute dimensions", async () => {
        const { ctx, getReferences } = makeCtx(() =>
            Promise.resolve({
                nodes: [],
                edges: [
                    { from: metric, to: topN },
                    { from: otherComputedAttribute, to: sampleSize },
                ],
            }),
        );

        const result = await loadFilterParameterDependencies(
            ctx,
            [measureValueFilter(metric, "mvf1", [otherComputedAttribute, idRef("attr", "attribute")])],
            true,
        );

        expect(getReferences).toHaveBeenCalledWith([metric, otherComputedAttribute], { direction: "down" });
        expect(result.byRef).toEqual({
            [serializeObjRef(metric)]: [topN],
            [serializeObjRef(otherComputedAttribute)]: [sampleSize],
        });
    });

    it("sends every root of every filter in one references call, deduped", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        await loadFilterParameterDependencies(
            ctx,
            [
                attributeFilter(computedAttribute, "af1"),
                measureValueFilter(metric, "mvf1", [computedAttribute]),
                attributeFilter(computedAttribute, "af2"),
            ],
            true,
        );

        expect(getReferences).toHaveBeenCalledTimes(1);
        expect(getReferences).toHaveBeenCalledWith([computedAttribute, metric], { direction: "down" });
    });

    it("returns loaded with an empty map without calling the backend when no filter reads a parameterizable object", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadFilterParameterDependencies(
            ctx,
            [attributeFilter(label, "af1"), dateFilter],
            true,
        );

        expect(result).toEqual({ status: "loaded", byRef: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("returns uninitialized without calling the backend when parameters are disabled", async () => {
        const { ctx, getReferences } = makeCtx(() => Promise.resolve(EMPTY_GRAPH));

        const result = await loadFilterParameterDependencies(
            ctx,
            [attributeFilter(computedAttribute, "af1")],
            false,
        );

        expect(result).toEqual({ status: "uninitialized", byRef: {} });
        expect(getReferences).not.toHaveBeenCalled();
    });

    it("returns failed when the references service throws", async () => {
        const { ctx } = makeCtx(() => Promise.reject(new Error("boom")));

        const result = await loadFilterParameterDependencies(
            ctx,
            [attributeFilter(computedAttribute, "af1")],
            true,
        );

        expect(result).toEqual({ status: "failed", byRef: {} });
    });
});

describe("collectDashboardFilterContextItems", () => {
    const tabFilter = attributeFilter(computedAttribute, "af-tab");
    const rootFilter = measureValueFilter(metric, "mvf-root");

    function dashboardWith(tabsFilters: FilterContextItem[][] | undefined, rootFilters: FilterContextItem[]) {
        return {
            tabs: tabsFilters?.map((filters, idx) => ({
                localIdentifier: `tab-${idx}`,
                title: `Tab ${idx}`,
                filterContext: { filters },
            })),
            filterContext: { filters: rootFilters },
        } as unknown as IDashboard;
    }

    it("collects the filters of every tab and of the root filter context of a dashboard with tabs", () => {
        const result = collectDashboardFilterContextItems(
            dashboardWith([[tabFilter], [dateFilter]], [rootFilter]),
        );

        expect(result).toEqual([tabFilter, dateFilter, rootFilter]);
    });

    it("collects the root filter context of a dashboard without tabs", () => {
        expect(collectDashboardFilterContextItems(dashboardWith(undefined, [rootFilter]))).toEqual([
            rootFilter,
        ]);
        expect(collectDashboardFilterContextItems(dashboardWith([], [rootFilter]))).toEqual([rootFilter]);
    });
});
