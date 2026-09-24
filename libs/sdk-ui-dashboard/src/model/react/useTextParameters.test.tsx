// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IInsight,
    type IParameterMetadataObject,
    type IdentifierRef,
    idRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

const mockUseDashboardSelector = vi.fn();
const mockDispatch = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => mockDispatch,
}));

vi.mock("./useWidgetExecConfig.js", () => ({
    useDashboardExecConfig: () => ({ timestamp: "2026-01-01T00:00:00Z" }),
}));

const { requestParameterDependencies } =
    await import("../commandHandlers/parameters/parameterDependenciesWorker.js");
const { selectCatalogParametersIsLoaded, selectCatalogRequestedParameterRoots } =
    await import("../store/catalog/catalogSelectors.js");
const { useTextParameters } = await import("./useTextParameters.js");

const topNRef = idRef("topN", "parameter");
const sampleSizeRef = idRef("sampleSize", "parameter");
const revenueRef = idRef("revenue", "measure");
const tierRef = idRef("tier", "computedAttribute");

const workspaceParameter = (ref: typeof topNRef, defaultValue: number): IParameterMetadataObject => ({
    type: "parameter",
    id: ref.identifier,
    uri: `/${ref.identifier}`,
    ref,
    title: ref.identifier,
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue },
});

const insightWithRef = (ref: IdentifierRef): IInsight => ({
    insight: {
        ref,
        identifier: ref.identifier,
        uri: `/${ref.identifier}`,
        title: ref.identifier,
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
});

const contextWith = (dependenciesByRoot: Record<string, unknown>) => ({
    entries: [
        { parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" }, runtimeOverride: 25 },
        { parameter: { ref: sampleSizeRef, parameterType: "NUMBER", mode: "active" }, runtimeOverride: 50 },
    ],
    dependenciesByRoot,
    filterRoots: [],
    workspaceParameterByRef: new Map([
        [objRefToString(topNRef), workspaceParameter(topNRef, 10)],
        [objRefToString(sampleSizeRef), workspaceParameter(sampleSizeRef, 100)],
    ]),
    isStringEnabled: true,
});

const givenStore = (
    context: unknown,
    {
        requestedRoots = {},
        isCatalogLoaded = true,
    }: { requestedRoots?: Record<string, "pending" | "failed">; isCatalogLoaded?: boolean } = {},
) => {
    mockDispatch.mockClear();
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectCatalogRequestedParameterRoots) {
            return requestedRoots;
        }
        if (selector === selectCatalogParametersIsLoaded) {
            return isCatalogLoaded;
        }
        return context;
    });
};

describe("useTextParameters", () => {
    it("sends no parameters for a text that references nothing", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        const { result } = renderHook(() => useTextParameters("Plain words"));

        expect(result.current.execConfig).toEqual({ timestamp: "2026-01-01T00:00:00Z" });
    });

    it("sends the parameters the referenced metric depends on", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}"));

        expect(result.current.execConfig.parameterValues).toEqual([{ ref: topNRef, value: 25 }]);
    });

    it("unions the parameters of every root the text references", () => {
        givenStore(
            contextWith({
                [serializeObjRef(revenueRef)]: [topNRef],
                [serializeObjRef(tierRef)]: [sampleSizeRef],
            }),
        );

        const { result } = renderHook(() =>
            useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"),
        );

        expect(result.current.execConfig.parameterValues).toEqual([
            { ref: topNRef, value: 25 },
            { ref: sampleSizeRef, value: 50 },
        ]);
    });

    it("applies the insight-authored value where the host executes an insight", () => {
        givenStore({
            ...contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }),
            entries: [],
        });
        const insight = {
            insight: {
                ref: idRef("insight-1", "insight"),
                parameters: [{ ref: topNRef, value: 5 }],
            },
        } as unknown as IInsight;

        const { result } = renderHook(() =>
            useTextParameters("Revenue {metric/revenue}", idRef("w-1"), insight),
        );

        expect(result.current.execConfig.parameterValues).toEqual([{ ref: topNRef, value: 5 }]);
    });

    it("sends the parameters the insight's own filters depend on", () => {
        const insightObjRef = idRef("insight-1", "insight");
        givenStore(
            contextWith({
                [serializeObjRef(revenueRef)]: [],
                [serializeObjRef(insightObjRef)]: [sampleSizeRef],
            }),
        );

        const { result } = renderHook(() =>
            useTextParameters("Revenue {metric/revenue}", idRef("w-1"), insightWithRef(insightObjRef)),
        );

        expect(result.current.execConfig.parameterValues).toEqual([{ ref: sampleSizeRef, value: 50 }]);
    });

    it("asks for the insight's root the map does not hold yet", () => {
        const insightObjRef = idRef("insight-1", "insight");
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        renderHook(() =>
            useTextParameters("Revenue {metric/revenue}", idRef("w-1"), insightWithRef(insightObjRef)),
        );

        expect(mockDispatch).toHaveBeenCalledWith(requestParameterDependencies([insightObjRef]));
    });

    it("asks for the roots the map does not hold yet", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        renderHook(() => useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"));

        expect(mockDispatch).toHaveBeenCalledWith(requestParameterDependencies([tierRef]));
    });

    it.each(["pending", "failed"] as const)("asks again for no root that is %s", (status) => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }), {
            requestedRoots: { [serializeObjRef(tierRef)]: status },
        });

        renderHook(() => useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"));

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("asks only for the roots that are not requested yet", () => {
        givenStore(contextWith({}), { requestedRoots: { [serializeObjRef(tierRef)]: "pending" } });

        renderHook(() => useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"));

        expect(mockDispatch).toHaveBeenCalledWith(requestParameterDependencies([revenueRef]));
    });

    it("asks for nothing when the map holds every root", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        renderHook(() => useTextParameters("Revenue {metric/revenue}"));

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("has nothing to show where the dashboard resolves no parameters", () => {
        givenStore(undefined);

        const { result } = renderHook(() => useTextParameters("", idRef("w-1")));

        expect(result.current.parameterDisplayValues).toBeUndefined();
    });

    it("has nothing to show where the workspace parameters did not load", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }), { isCatalogLoaded: false });

        const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}", idRef("w-1")));

        expect(result.current.parameterDisplayValues).toBeUndefined();
        expect(result.current.execConfig.parameterValues).toEqual([{ ref: topNRef, value: 25 }]);
        expect(result.current.loading).toBe(false);
    });

    it("shows the effective value of every workspace parameter", () => {
        givenStore({
            entries: [
                {
                    parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
                    runtimeOverride: 25,
                },
            ],
            dependenciesByRoot: {},
            filterRoots: [],
            workspaceParameterByRef: new Map([[objRefToString(topNRef), workspaceParameter(topNRef, 10)]]),
            isStringEnabled: true,
        });

        const { result } = renderHook(() => useTextParameters("", idRef("w-1")));

        expect(result.current.parameterDisplayValues).toEqual(new Map([["topN", "25"]]));
    });

    it("waits while a root the text references is neither in the map nor failed", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        const { result } = renderHook(() =>
            useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"),
        );

        expect(result.current.loading).toBe(true);
    });

    it("stops waiting for a root whose request failed", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }), {
            requestedRoots: { [serializeObjRef(tierRef)]: "failed" },
        });

        const { result } = renderHook(() =>
            useTextParameters("Revenue {metric/revenue} by {computed_attribute/tier}"),
        );

        expect(result.current.loading).toBe(false);
    });

    it("waits for nothing when the map holds every root", () => {
        givenStore(contextWith({ [serializeObjRef(revenueRef)]: [topNRef] }));

        const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}"));

        expect(result.current.loading).toBe(false);
    });

    describe("under a dashboard filter", () => {
        const regionRef = idRef("region", "computedAttribute");
        const underFilter = (dependenciesByRoot: Record<string, unknown>) => ({
            ...contextWith(dependenciesByRoot),
            filterRoots: [regionRef],
        });

        it("waits while the filter's root is neither in the map nor failed", () => {
            givenStore(underFilter({ [serializeObjRef(revenueRef)]: [topNRef] }));

            const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}"));

            expect(result.current.loading).toBe(true);
        });

        it("asks for the filter's root the map does not hold yet", () => {
            givenStore(underFilter({ [serializeObjRef(revenueRef)]: [topNRef] }));

            renderHook(() => useTextParameters("Revenue {metric/revenue}"));

            expect(mockDispatch).toHaveBeenCalledWith(requestParameterDependencies([regionRef]));
        });

        it("stops waiting for a filter root whose request failed", () => {
            givenStore(underFilter({ [serializeObjRef(revenueRef)]: [topNRef] }), {
                requestedRoots: { [serializeObjRef(regionRef)]: "failed" },
            });

            const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}"));

            expect(result.current.loading).toBe(false);
        });

        it("executes only once the filter's dependencies arrive, with them", () => {
            givenStore(underFilter({ [serializeObjRef(revenueRef)]: [topNRef] }), {
                requestedRoots: { [serializeObjRef(regionRef)]: "pending" },
            });
            const { result, rerender } = renderHook(() => useTextParameters("Revenue {metric/revenue}"));
            expect(result.current.loading).toBe(true);

            givenStore(
                underFilter({
                    [serializeObjRef(revenueRef)]: [topNRef],
                    [serializeObjRef(regionRef)]: [sampleSizeRef],
                }),
            );
            rerender();

            expect(result.current.loading).toBe(false);
            expect(result.current.execConfig.parameterValues).toEqual([
                { ref: topNRef, value: 25 },
                { ref: sampleSizeRef, value: 50 },
            ]);
        });
    });

    it("waits for nothing where the dashboard resolves no parameters", () => {
        givenStore(undefined);

        const { result } = renderHook(() => useTextParameters("Revenue {metric/revenue}", idRef("w-1")));

        expect(result.current.loading).toBe(false);
    });
});
