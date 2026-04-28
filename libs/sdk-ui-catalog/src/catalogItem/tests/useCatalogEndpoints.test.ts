// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ObjectTypes } from "../../objectType/constants.js";
import * as query from "../query.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "../types.js";
import {
    type ICatalogQueryFilterInputs,
    useCatalogEndpoints,
    useCatalogQueryOptions,
} from "../useCatalogEndpoints.js";

vi.mock("../query.js", () => ({
    getDashboardsQuery: vi.fn(() => ({ query: vi.fn() })),
    getInsightsQuery: vi.fn(() => ({ query: vi.fn() })),
    getMetricsQuery: vi.fn(() => ({ query: vi.fn() })),
    getParametersQuery: vi.fn(() => ({ query: vi.fn() })),
    getAttributesQuery: vi.fn(() => ({ query: vi.fn() })),
    getFactsQuery: vi.fn(() => ({ query: vi.fn() })),
    getDateDatasetsQuery: vi.fn(() => ({ query: vi.fn() })),
}));

const backend = {} as IAnalyticalBackend;

function makeOptions(overrides: Partial<ICatalogItemQueryOptions> = {}): ICatalogItemQueryOptions {
    return {
        backend,
        workspace: "ws",
        origin: "ALL",
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("useCatalogEndpoints", () => {
    it("with empty types and parameters gate off, returns all endpoints except parameters in default order", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions(), { isParametersEnabled: false }),
        );

        expect(result.current.map((e) => e.type)).toEqual([
            ObjectTypes.DASHBOARD,
            ObjectTypes.VISUALIZATION,
            ObjectTypes.METRIC,
            ObjectTypes.ATTRIBUTE,
            ObjectTypes.FACT,
            ObjectTypes.DATASET,
        ]);
    });

    it("with empty types and parameters gate on, includes the parameters endpoint", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions(), { isParametersEnabled: true }),
        );

        expect(result.current.map((e) => e.type)).toContain(ObjectTypes.PARAMETER);
    });

    it("with a types subset, returns only the selected endpoints in default order", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.METRIC, ObjectTypes.DASHBOARD], makeOptions(), {
                isParametersEnabled: false,
            }),
        );

        expect(result.current.map((e) => e.type)).toEqual([ObjectTypes.DASHBOARD, ObjectTypes.METRIC]);
    });

    it("with empty id list, returns no endpoints (short-circuit)", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions({ id: [] }), { isParametersEnabled: true }),
        );

        expect(result.current).toEqual([]);
    });

    it("excludes the parameters endpoint when types includes PARAMETER but the gate is off", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.PARAMETER], makeOptions(), { isParametersEnabled: false }),
        );

        expect(result.current).toEqual([]);
    });

    it("each FeedEndpoint.query() invokes its corresponding query module function with queryOptions", async () => {
        const options = makeOptions();
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DASHBOARD], options, { isParametersEnabled: false }),
        );

        await result.current[0].query();
        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledWith(options);
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy is set (non-inverted)", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions({ createdBy: ["user-1"] }), {
                isParametersEnabled: false,
            }),
        );

        const types = result.current.map((e) => e.type);
        expect(types).not.toContain(ObjectTypes.ATTRIBUTE);
        expect(types).not.toContain(ObjectTypes.FACT);
        expect(types).not.toContain(ObjectTypes.DATASET);
        expect(types).toEqual(
            expect.arrayContaining([ObjectTypes.DASHBOARD, ObjectTypes.VISUALIZATION, ObjectTypes.METRIC]),
        );
    });

    it("suppresses attribute/fact/dataset endpoints when excludeCreatedBy is set (inverted)", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions({ excludeCreatedBy: ["user-1"] }), {
                isParametersEnabled: false,
            }),
        );

        const types = result.current.map((e) => e.type);
        expect(types).not.toContain(ObjectTypes.ATTRIBUTE);
        expect(types).not.toContain(ObjectTypes.FACT);
        expect(types).not.toContain(ObjectTypes.DATASET);
    });

    it("suppresses attribute/fact/dataset endpoints when certification filter is on", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeOptions({ certification: true }), { isParametersEnabled: false }),
        );

        const types = result.current.map((e) => e.type);
        expect(types).not.toContain(ObjectTypes.ATTRIBUTE);
        expect(types).not.toContain(ObjectTypes.FACT);
        expect(types).not.toContain(ObjectTypes.DATASET);
    });
});

const baseFeedOptions: ICatalogItemFeedOptions = {
    backend,
    workspace: "ws",
    pageSize: 10,
};

function makeFilterInputs(overrides: Partial<ICatalogQueryFilterInputs> = {}): ICatalogQueryFilterInputs {
    return {
        search: "",
        origin: "ALL",
        createdBy: { values: [], isInverted: true },
        tags: { values: [], isInverted: true },
        qualityIds: undefined,
        isHidden: undefined,
        certification: undefined,
        ...overrides,
    };
}

describe("useCatalogQueryOptions", () => {
    it("merges non-inverted quality ids with feedOptions.id into queryOptions.id", () => {
        const { result } = renderHook(() =>
            useCatalogQueryOptions(
                { ...baseFeedOptions, id: ["a"] },
                makeFilterInputs({ qualityIds: { values: ["q1", "q2"], isInverted: false } }),
            ),
        );

        expect(result.current.id).toEqual(expect.arrayContaining(["q1", "q2", "a"]));
        expect(result.current.id).toHaveLength(3);
        expect(result.current.excludeId).toBeUndefined();
    });

    it("populates excludeId from inverted quality ids and keeps feedOptions.id as id", () => {
        const { result } = renderHook(() =>
            useCatalogQueryOptions(
                { ...baseFeedOptions, id: ["a"] },
                makeFilterInputs({ qualityIds: { values: ["q1"], isInverted: true } }),
            ),
        );

        expect(result.current.id).toEqual(["a"]);
        expect(result.current.excludeId).toEqual(["q1"]);
    });

    it("maps non-inverted createdBy to createdBy and leaves excludeCreatedBy undefined", () => {
        const { result } = renderHook(() =>
            useCatalogQueryOptions(
                baseFeedOptions,
                makeFilterInputs({ createdBy: { values: ["user-1"], isInverted: false } }),
            ),
        );

        expect(result.current.createdBy).toEqual(["user-1"]);
        expect(result.current.excludeCreatedBy).toBeUndefined();
    });

    it("maps inverted createdBy to excludeCreatedBy and leaves createdBy undefined", () => {
        const { result } = renderHook(() =>
            useCatalogQueryOptions(
                baseFeedOptions,
                makeFilterInputs({ createdBy: { values: ["user-1"], isInverted: true } }),
            ),
        );

        expect(result.current.createdBy).toBeUndefined();
        expect(result.current.excludeCreatedBy).toEqual(["user-1"]);
    });

    it("maps non-inverted/inverted tags symmetrically to tags / excludeTags", () => {
        const includedRender = renderHook(() =>
            useCatalogQueryOptions(
                baseFeedOptions,
                makeFilterInputs({ tags: { values: ["t1"], isInverted: false } }),
            ),
        );
        expect(includedRender.result.current.tags).toEqual(["t1"]);
        expect(includedRender.result.current.excludeTags).toBeUndefined();

        const excludedRender = renderHook(() =>
            useCatalogQueryOptions(
                baseFeedOptions,
                makeFilterInputs({ tags: { values: ["t1"], isInverted: true } }),
            ),
        );
        expect(excludedRender.result.current.tags).toBeUndefined();
        expect(excludedRender.result.current.excludeTags).toEqual(["t1"]);
    });

    it("forwards backend/workspace/search/origin/pageSize/isHidden/certification verbatim", () => {
        const { result } = renderHook(() =>
            useCatalogQueryOptions(
                baseFeedOptions,
                makeFilterInputs({
                    search: "hello",
                    origin: "PARENTS",
                    isHidden: true,
                    certification: false,
                }),
            ),
        );

        expect(result.current).toMatchObject<Partial<ICatalogItemQueryOptions>>({
            backend,
            workspace: "ws",
            pageSize: 10,
            search: "hello",
            origin: "PARENTS",
            isHidden: true,
            certification: false,
        });
    });
});
