// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IFeatureFlags } from "@gooddata/sdk-model";

import { ObjectTypes } from "../../objectType/constants.js";
import type { ObjectType } from "../../objectType/types.js";
import * as query from "../query.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "../types.js";
import {
    type EndpointResult,
    type ICatalogEndpoint,
    type ICatalogQueryFilterInputs,
    selectCatalogEndpoints,
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

function makeQueryOptions(overrides: Partial<ICatalogItemQueryOptions> = {}): ICatalogItemQueryOptions {
    return {
        backend,
        workspace: "ws",
        origin: "ALL",
        ...overrides,
    };
}

function makeRow(type: ObjectType, extra: Partial<ICatalogEndpoint> = {}): ICatalogEndpoint {
    return { type, query: noopQuery, ...extra };
}

function noopQuery(): Promise<EndpointResult> {
    return Promise.resolve({} as EndpointResult);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("useCatalogEndpoints", () => {
    it("with empty types and parameters gate off, returns all endpoints except parameters in default order", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions(), { enableParameters: false }),
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
            useCatalogEndpoints([], makeQueryOptions(), { enableParameters: true }),
        );

        expect(result.current.map((e) => e.type)).toContain(ObjectTypes.PARAMETER);
    });

    it("with a types subset, returns only the selected endpoints in default order", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.METRIC, ObjectTypes.DASHBOARD], makeQueryOptions(), {
                enableParameters: false,
            }),
        );

        expect(result.current.map((e) => e.type)).toEqual([ObjectTypes.DASHBOARD, ObjectTypes.METRIC]);
    });

    it("with empty id list, returns no endpoints (short-circuit)", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions({ id: [] }), { enableParameters: true }),
        );

        expect(result.current).toEqual([]);
    });

    it("excludes the parameters endpoint when types includes PARAMETER but the gate is off", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.PARAMETER], makeQueryOptions(), { enableParameters: false }),
        );

        expect(result.current).toEqual([]);
    });

    it("each FeedEndpoint.query() invokes its corresponding query module function with queryOptions", async () => {
        const options = makeQueryOptions();
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DASHBOARD], options, { enableParameters: false }),
        );

        await result.current[0].query();
        expect(vi.mocked(query.getDashboardsQuery)).toHaveBeenCalledWith(options);
    });

    it("suppresses attribute/fact/dataset endpoints when createdBy is set (non-inverted)", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions({ createdBy: ["user-1"] }), {
                enableParameters: false,
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
            useCatalogEndpoints([], makeQueryOptions({ excludeCreatedBy: ["user-1"] }), {
                enableParameters: false,
            }),
        );

        const types = result.current.map((e) => e.type);
        expect(types).not.toContain(ObjectTypes.ATTRIBUTE);
        expect(types).not.toContain(ObjectTypes.FACT);
        expect(types).not.toContain(ObjectTypes.DATASET);
    });

    it("suppresses attribute/fact/dataset endpoints when certification filter is on", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions({ certification: true }), {
                enableParameters: false,
            }),
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

describe("selectCatalogEndpoints", () => {
    const flagsOff: IFeatureFlags = { enableParameters: false };
    const flagsOn: IFeatureFlags = { enableParameters: true };

    it("returns [] when opts.id is an empty array (short-circuit)", () => {
        const endpoints: ICatalogEndpoint[] = [makeRow(ObjectTypes.DASHBOARD)];
        expect(selectCatalogEndpoints([], makeQueryOptions({ id: [] }), flagsOff, endpoints)).toEqual([]);
    });

    describe("types rule", () => {
        it("passes all gate-passing rows through when types is empty", () => {
            const endpoints: ICatalogEndpoint[] = [
                makeRow(ObjectTypes.DASHBOARD),
                makeRow(ObjectTypes.METRIC),
            ];
            const result = selectCatalogEndpoints([], makeQueryOptions(), flagsOff, endpoints);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD, ObjectTypes.METRIC]);
        });

        it("narrows to rows whose type is included in types", () => {
            const endpoints: ICatalogEndpoint[] = [
                makeRow(ObjectTypes.DASHBOARD),
                makeRow(ObjectTypes.METRIC),
                makeRow(ObjectTypes.FACT),
            ];
            const result = selectCatalogEndpoints(
                [ObjectTypes.DASHBOARD, ObjectTypes.METRIC],
                makeQueryOptions(),
                flagsOff,
                endpoints,
            );
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD, ObjectTypes.METRIC]);
        });
    });

    describe("gates rule", () => {
        it("keeps rows that declare no gates regardless of gate values", () => {
            const endpoints: ICatalogEndpoint[] = [makeRow(ObjectTypes.DASHBOARD)];
            const result = selectCatalogEndpoints([], makeQueryOptions(), flagsOff, endpoints);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("drops a gated row when its gate is off", () => {
            const endpoints: ICatalogEndpoint[] = [
                makeRow(ObjectTypes.PARAMETER, { gatedBy: ["enableParameters"] }),
            ];
            expect(selectCatalogEndpoints([], makeQueryOptions(), flagsOff, endpoints)).toEqual([]);
        });

        it("keeps a gated row when its gate is on", () => {
            const endpoints: ICatalogEndpoint[] = [
                makeRow(ObjectTypes.PARAMETER, { gatedBy: ["enableParameters"] }),
            ];
            const result = selectCatalogEndpoints([], makeQueryOptions(), flagsOn, endpoints);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.PARAMETER]);
        });
    });

    describe("compatibility rule", () => {
        const slottedRow = makeRow(ObjectTypes.ATTRIBUTE, {
            cannotFilterBy: ["createdBy", "excludeCreatedBy", "certification"],
        });
        const bareRow = makeRow(ObjectTypes.DASHBOARD);

        it("keeps rows without cannotFilterBy regardless of opts", () => {
            const result = selectCatalogEndpoints(
                [],
                makeQueryOptions({ certification: true, createdBy: ["u-1"] }),
                flagsOff,
                [bareRow],
            );
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("drops a cannotFilterBy row when createdBy is set", () => {
            const result = selectCatalogEndpoints([], makeQueryOptions({ createdBy: ["u-1"] }), flagsOff, [
                bareRow,
                slottedRow,
            ]);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("drops a cannotFilterBy row when excludeCreatedBy is set", () => {
            const result = selectCatalogEndpoints(
                [],
                makeQueryOptions({ excludeCreatedBy: ["u-1"] }),
                flagsOff,
                [bareRow, slottedRow],
            );
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("drops a cannotFilterBy row when certification is on", () => {
            const result = selectCatalogEndpoints([], makeQueryOptions({ certification: true }), flagsOff, [
                bareRow,
                slottedRow,
            ]);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("keeps a cannotFilterBy row when no listed slot is active", () => {
            const result = selectCatalogEndpoints([], makeQueryOptions(), flagsOff, [bareRow, slottedRow]);
            expect(result.map((entry) => entry.type)).toEqual([ObjectTypes.DASHBOARD, ObjectTypes.ATTRIBUTE]);
        });
    });

    it("binds opts to each row.query closure", async () => {
        const dashboardQuery = vi.fn(noopQuery);
        const endpoints: ICatalogEndpoint[] = [makeRow(ObjectTypes.DASHBOARD, { query: dashboardQuery })];
        const opts = makeQueryOptions({ search: "hello" });

        const feed = selectCatalogEndpoints([], opts, flagsOff, endpoints);
        await feed[0].query();
        expect(dashboardQuery).toHaveBeenCalledWith(opts);
    });
});

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
