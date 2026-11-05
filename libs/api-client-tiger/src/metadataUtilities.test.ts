// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { describe, expect, it, vi } from "vitest";

import { type ITigerClientBase } from "./client.js";
import { type JsonApiMetricOutList } from "./generated/metadata-json-api/index.js";
import {
    type MetadataGetEntitiesOptions,
    type MetadataGetEntitiesWorkspaceParams,
    MetadataUtilities,
} from "./metadataUtilities.js";

const PAGE_SIZE = 2;
const client = { axios: {} } as ITigerClientBase;

type Params = MetadataGetEntitiesWorkspaceParams & { metaInclude?: string[] };

const nextTimer = () => new Promise((resolve) => setTimeout(resolve));

function pageOf(entities: number, totalPages?: number): JsonApiMetricOutList {
    return {
        data: Array.from({ length: entities }, (_v, i) => ({ id: `metric${i}`, type: "metric" })),
        ...(totalPages === undefined ? {} : { meta: { page: { totalPages } } }),
    } as JsonApiMetricOutList;
}

// serves `pages` by the requested page number; a page without meta mimics a backend that sends no page count
function backendOf(pages: JsonApiMetricOutList[]) {
    return vi.fn(
        async (_axios: unknown, _basePath: string, _params: Params, options: MetadataGetEntitiesOptions) => {
            await nextTimer();
            return { data: pages[options.params!.page!] } as AxiosResponse<JsonApiMetricOutList>;
        },
    );
}

const loadAll = (get: ReturnType<typeof backendOf>, params: Params = { workspaceId: "ws" }) =>
    MetadataUtilities.getAllPagesOfParallel(client, get, params, { params: { size: PAGE_SIZE } });

const requestedPages = (get: ReturnType<typeof backendOf>) =>
    get.mock.calls.map((call) => call[3].params?.page);

describe("MetadataUtilities.getAllPagesOfParallel", () => {
    it("loads every page the backend counts, in page order", async () => {
        const pages = [pageOf(2, 3), pageOf(2), pageOf(1)];
        const get = backendOf(pages);

        await expect(loadAll(get)).resolves.toEqual(pages);
        expect(requestedPages(get)).toEqual([0, 1, 2]);
    });

    it("asks for the page count next to the meta the caller asked for, and only on the first page", async () => {
        const get = backendOf([pageOf(2, 2), pageOf(1)]);

        await loadAll(get, { workspaceId: "ws", metaInclude: ["permissions"] });

        expect(get.mock.calls.map((call) => call[2].metaInclude)).toEqual([
            ["permissions", "page"],
            ["permissions"],
        ]);
    });

    it("does not ask for the page count twice", async () => {
        const get = backendOf([pageOf(1, 1)]);

        await loadAll(get, { workspaceId: "ws", metaInclude: ["page"] });

        expect(get.mock.calls[0][2].metaInclude).toEqual(["page"]);
    });

    it("loads the rest one page at a time when the backend sends no page count", async () => {
        const pages = [pageOf(2), pageOf(2), pageOf(1)];
        const get = backendOf(pages);

        await expect(loadAll(get)).resolves.toEqual(pages);
        expect(requestedPages(get)).toEqual([0, 1, 2]);
    });

    it("stops after a first page that is not full when the backend sends no page count", async () => {
        const get = backendOf([pageOf(1)]);

        await expect(loadAll(get)).resolves.toHaveLength(1);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("makes a single request for an empty list", async () => {
        const get = backendOf([pageOf(0, 0)]);

        await expect(loadAll(get)).resolves.toEqual([pageOf(0, 0)]);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("has at most four pages in flight at once", async () => {
        const pages = [pageOf(2, 20), ...Array.from({ length: 19 }, () => pageOf(2))];
        let inFlight = 0;
        let maxInFlight = 0;
        const get = vi.fn(
            async (
                _axios: unknown,
                _basePath: string,
                _params: Params,
                options: MetadataGetEntitiesOptions,
            ) => {
                inFlight += 1;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await nextTimer();
                inFlight -= 1;
                return { data: pages[options.params!.page!] } as AxiosResponse<JsonApiMetricOutList>;
            },
        );

        await expect(loadAll(get)).resolves.toHaveLength(20);
        expect(maxInFlight).toBe(4);
    });

    it("requests no further page once a page fails", async () => {
        const pages = [pageOf(2, 20), ...Array.from({ length: 19 }, () => pageOf(2))];
        const failure = new Error("page 1 failed");
        const get = vi.fn(
            async (
                _axios: unknown,
                _basePath: string,
                _params: Params,
                options: MetadataGetEntitiesOptions,
            ) => {
                const page = options.params!.page!;
                if (page === 1) {
                    throw failure;
                }
                await nextTimer();
                return { data: pages[page] } as AxiosResponse<JsonApiMetricOutList>;
            },
        );

        await expect(loadAll(get)).rejects.toBe(failure);
        // let the pages still in flight settle; none of them may start another one
        await nextTimer();
        // the first page, then the four started together
        expect(requestedPages(get)).toEqual([0, 1, 2, 3, 4]);
    });
});

describe("MetadataUtilities.getAllPagesOf", () => {
    it("loads pages one by one until a page that is not full", async () => {
        const pages = [pageOf(2), pageOf(2), pageOf(0)];
        const get = backendOf(pages);

        await expect(
            MetadataUtilities.getAllPagesOf(
                client,
                get,
                { workspaceId: "ws" },
                { params: { size: PAGE_SIZE } },
            ),
        ).resolves.toEqual(pages);
        expect(requestedPages(get)).toEqual([0, 1, 2]);
    });
});
