// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createElement } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IFeatureFlags } from "@gooddata/sdk-model";

import { ObjectTypes } from "../objectType/constants.js";
import type { ObjectType } from "../objectType/types.js";
import { TestPermissionsProvider } from "../permission/TestPermissionsProvider.js";

import { createCatalogBackendStub } from "./catalogBackend.test.utils.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "./types.js";
import {
    type EndpointResult,
    type ICatalogEndpoint,
    type ICatalogQueryFilterInputs,
    selectCatalogEndpoints,
    useCatalogEndpoints,
    useCatalogQueryOptions,
} from "./useCatalogEndpoints.js";

// Endpoint selection never touches the backend, so most cases can hand the hook an opaque one.
const backend = {} as IAnalyticalBackend;

function makeQueryOptions(overrides: Partial<ICatalogItemQueryOptions> = {}): ICatalogItemQueryOptions {
    return {
        backend,
        workspace: "ws",
        origin: "ALL",
        ...overrides,
    };
}

const DOCUMENT_FLAGS: IFeatureFlags = {
    enableBusinessBriefingReportsApp: true,
    enablePublisherV2: true,
    enableCatalogDocuments: true,
};

function makeRow(type: ObjectType, extra: Partial<ICatalogEndpoint> = {}): ICatalogEndpoint {
    return { type, query: noopQuery, ...extra };
}

function noopQuery(): Promise<EndpointResult> {
    return Promise.resolve({} as EndpointResult);
}

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

    it.each<[string, IFeatureFlags]>([
        ["all flags off", {}],
        ["the Reports app off", { ...DOCUMENT_FLAGS, enableBusinessBriefingReportsApp: false }],
        ["Publisher v2 off", { ...DOCUMENT_FLAGS, enablePublisherV2: false }],
        ["catalog documents off", { ...DOCUMENT_FLAGS, enableCatalogDocuments: false }],
    ])("excludes the documents endpoint with %s", (_, flags) => {
        const { result } = renderHook(() => useCatalogEndpoints([], makeQueryOptions(), flags));

        expect(result.current.map((e) => e.type)).not.toContain(ObjectTypes.DOCUMENT);
    });

    it("includes the documents endpoint when the Reports app, Publisher v2 and catalog documents flags are on", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DOCUMENT], makeQueryOptions(), DOCUMENT_FLAGS),
        );

        expect(result.current.map((e) => e.type)).toEqual([ObjectTypes.DOCUMENT]);
    });

    it("suppresses the documents endpoint when certification filter is on", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions({ certification: true }), DOCUMENT_FLAGS),
        );

        expect(result.current.map((e) => e.type)).not.toContain(ObjectTypes.DOCUMENT);
    });

    it("suppresses the documents endpoint under the quality filter for objects with issues", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints(
                [],
                makeQueryOptions({ qualityIds: { values: ["q1"], isInverted: false } }),
                DOCUMENT_FLAGS,
            ),
        );

        const types = result.current.map((e) => e.type);
        expect(types).not.toContain(ObjectTypes.DOCUMENT);
        expect(types).toContain(ObjectTypes.DASHBOARD);
    });

    it("queries documents without the quality ids under the quality filter for objects without issues", async () => {
        const stub = createCatalogBackendStub();
        const options = makeQueryOptions({
            backend: stub.backend,
            qualityIds: { values: ["q1"], isInverted: true },
        });
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DASHBOARD, ObjectTypes.DOCUMENT], options, DOCUMENT_FLAGS),
        );

        await Promise.all(result.current.map((endpoint) => endpoint.query()));

        expect(stub.builders[ObjectTypes.DOCUMENT].withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ excludeId: undefined }),
        );
        expect(stub.builders[ObjectTypes.DASHBOARD].withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ excludeId: ["q1"] }),
        );
    });

    it("keeps a user without the create grant to their own native documents", async () => {
        const stub = createCatalogBackendStub();
        const options = makeQueryOptions({ backend: stub.backend });
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DOCUMENT], options, DOCUMENT_FLAGS, "me"),
        );

        await result.current[0].query();

        expect(stub.builders[ObjectTypes.DOCUMENT].withOrigin).toHaveBeenCalledWith("NATIVE");
        expect(stub.builders[ObjectTypes.DOCUMENT].withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ createdBy: ["me"], excludeCreatedBy: undefined }),
        );
    });

    it.each<[string, Partial<ICatalogItemQueryOptions>]>([
        ["only someone else's documents are asked for", { createdBy: ["other"] }],
        ["the user's own documents are left out", { excludeCreatedBy: ["me"] }],
        ["only inherited documents are asked for", { origin: "PARENTS" }],
    ])("returns no documents to a user without the create grant when %s", async (_, overrides) => {
        const stub = createCatalogBackendStub();
        const options = makeQueryOptions({ backend: stub.backend, ...overrides });
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DOCUMENT], options, DOCUMENT_FLAGS, "me"),
        );

        const page = await result.current[0].query();

        expect(page).toMatchObject({ items: [], totalCount: 0 });
        expect(await page.next()).toMatchObject({ items: [] });
        expect(stub.queries[ObjectTypes.DOCUMENT]).not.toHaveBeenCalled();
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

    it("each FeedEndpoint.query() runs its type's backend query with the current query options", async () => {
        const stub = createCatalogBackendStub();
        const options = makeQueryOptions({ backend: stub.backend, search: "revenue" });
        const { result } = renderHook(() =>
            useCatalogEndpoints([ObjectTypes.DASHBOARD], options, { enableParameters: false }),
        );

        await result.current[0].query();

        expect(stub.queries[ObjectTypes.DASHBOARD]).toHaveBeenCalledTimes(1);
        expect(stub.builders[ObjectTypes.DASHBOARD].withFilter).toHaveBeenCalledWith(
            expect.objectContaining({ search: "revenue" }),
        );
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

    it("keeps computed attributes endpoint when certification filter is on", () => {
        const { result } = renderHook(() =>
            useCatalogEndpoints([], makeQueryOptions({ certification: true }), {
                enableParameters: false,
                enableComputedAttributes: true,
            }),
        );

        const types = result.current.map((e) => e.type);
        expect(types).toContain(ObjectTypes.COMPUTED_ATTRIBUTE);
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

    describe("quality rule", () => {
        const rows = [makeRow(ObjectTypes.DASHBOARD), makeRow(ObjectTypes.DOCUMENT)];

        async function queriedOptions(opts: ICatalogItemQueryOptions) {
            const queries = rows.map((row) => ({
                ...row,
                query: vi.fn<ICatalogEndpoint["query"]>(noopQuery),
            }));
            const feed = selectCatalogEndpoints([], opts, flagsOff, queries);
            await Promise.all(feed.map((entry) => entry.query()));
            return Object.fromEntries(
                queries
                    .filter((row) => row.query.mock.calls.length > 0)
                    .map((row) => [row.type, row.query.mock.calls[0][0]]),
            );
        }

        it("merges the ids with issues into id, next to the explicit ids", async () => {
            const options = await queriedOptions(
                makeQueryOptions({ id: ["a"], qualityIds: { values: ["q1", "q2"], isInverted: false } }),
            );

            expect(options[ObjectTypes.DASHBOARD].id).toEqual(["q1", "q2", "a"]);
            expect(options[ObjectTypes.DASHBOARD].excludeId).toBeUndefined();
        });

        it("drops the types outside the quality report under the filter for objects with issues", async () => {
            const options = await queriedOptions(
                makeQueryOptions({ qualityIds: { values: ["q1"], isInverted: false } }),
            );

            expect(Object.keys(options)).toEqual([ObjectTypes.DASHBOARD]);
        });

        it("queries nothing when no object has issues", () => {
            const feed = selectCatalogEndpoints(
                [],
                makeQueryOptions({ qualityIds: { values: [], isInverted: false } }),
                flagsOff,
                rows,
            );

            expect(feed).toEqual([]);
        });

        it("excludes the ids with issues only from the types in the quality report", async () => {
            const options = await queriedOptions(
                makeQueryOptions({ id: ["a"], qualityIds: { values: ["q1"], isInverted: true } }),
            );

            expect(options[ObjectTypes.DASHBOARD]).toMatchObject({ id: ["a"], excludeId: ["q1"] });
            expect(options[ObjectTypes.DOCUMENT].id).toEqual(["a"]);
            expect(options[ObjectTypes.DOCUMENT].excludeId).toBeUndefined();
        });
    });

    it("binds opts and the user context to each row.query closure", async () => {
        const dashboardQuery = vi.fn(noopQuery);
        const endpoints: ICatalogEndpoint[] = [makeRow(ObjectTypes.DASHBOARD, { query: dashboardQuery })];
        const opts = makeQueryOptions({ search: "hello" });

        const feed = selectCatalogEndpoints([], opts, flagsOff, endpoints, { documentOwner: "me" });
        await feed[0].query();
        expect(dashboardQuery).toHaveBeenCalledWith(opts, { documentOwner: "me" });
    });
});

// useCatalogQueryOptions reads the metric-permissions flag off the permissions context
function wrapper({ children }: PropsWithChildren) {
    return createElement(TestPermissionsProvider, null, children);
}

describe("useCatalogQueryOptions", () => {
    it("keeps the quality ids apart from feedOptions.id", () => {
        const qualityIds = { values: ["q1", "q2"], isInverted: false };
        const { result } = renderHook(
            () => useCatalogQueryOptions({ ...baseFeedOptions, id: ["a"] }, makeFilterInputs({ qualityIds })),
            { wrapper },
        );

        expect(result.current.id).toEqual(["a"]);
        expect(result.current.qualityIds).toBe(qualityIds);
        expect(result.current.excludeId).toBeUndefined();
    });

    it("maps non-inverted createdBy to createdBy and leaves excludeCreatedBy undefined", () => {
        const { result } = renderHook(
            () =>
                useCatalogQueryOptions(
                    baseFeedOptions,
                    makeFilterInputs({ createdBy: { values: ["user-1"], isInverted: false } }),
                ),
            { wrapper },
        );

        expect(result.current.createdBy).toEqual(["user-1"]);
        expect(result.current.excludeCreatedBy).toBeUndefined();
    });

    it("maps inverted createdBy to excludeCreatedBy and leaves createdBy undefined", () => {
        const { result } = renderHook(
            () =>
                useCatalogQueryOptions(
                    baseFeedOptions,
                    makeFilterInputs({ createdBy: { values: ["user-1"], isInverted: true } }),
                ),
            { wrapper },
        );

        expect(result.current.createdBy).toBeUndefined();
        expect(result.current.excludeCreatedBy).toEqual(["user-1"]);
    });

    it("maps non-inverted/inverted tags symmetrically to tags / excludeTags", () => {
        const includedRender = renderHook(
            () =>
                useCatalogQueryOptions(
                    baseFeedOptions,
                    makeFilterInputs({ tags: { values: ["t1"], isInverted: false } }),
                ),
            { wrapper },
        );
        expect(includedRender.result.current.tags).toEqual(["t1"]);
        expect(includedRender.result.current.excludeTags).toBeUndefined();

        const excludedRender = renderHook(
            () =>
                useCatalogQueryOptions(
                    baseFeedOptions,
                    makeFilterInputs({ tags: { values: ["t1"], isInverted: true } }),
                ),
            { wrapper },
        );
        expect(excludedRender.result.current.tags).toBeUndefined();
        expect(excludedRender.result.current.excludeTags).toEqual(["t1"]);
    });

    it("forwards backend/workspace/search/origin/pageSize/isHidden/certification verbatim", () => {
        const { result } = renderHook(
            () =>
                useCatalogQueryOptions(
                    baseFeedOptions,
                    makeFilterInputs({
                        search: "hello",
                        origin: "PARENTS",
                        isHidden: true,
                        certification: false,
                    }),
                ),
            { wrapper },
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
