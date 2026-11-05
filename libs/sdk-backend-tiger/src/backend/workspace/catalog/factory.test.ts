// (C) 2026 GoodData Corporation

import { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";

import { type ITigerClientBase, type JsonApiMetricOutList } from "@gooddata/api-client-tiger";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { TigerWorkspaceCatalogFactory } from "./factory.js";

const metric = (id: string) => ({
    id,
    type: "metric",
    attributes: { title: id, content: { maql: "SELECT 1" } },
    meta: { permissions: ["VIEW"] },
});

// one metric per page; only a request that asks for the page count gets it
function metricsBackend(ids: string[]) {
    return vi.fn(async (config: AxiosRequestConfig) => {
        const metaInclude = new URL(config.url!, "http://localhost").searchParams.get("metaInclude") ?? "";
        const body = {
            data: [metric(ids[config.params.page])],
            ...(metaInclude.includes("page") ? { meta: { page: { totalPages: ids.length } } } : {}),
        } as JsonApiMetricOutList;
        return { data: body };
    });
}

function catalogFactory(request: ReturnType<typeof metricsBackend>) {
    const client = { axios: { request } as unknown as AxiosInstance } as ITigerClientBase;
    const authCall = ((call: (client: ITigerClientBase) => Promise<unknown>) =>
        call(client)) as TigerAuthenticatedCallGuard;

    return new TigerWorkspaceCatalogFactory(authCall, "ws", {
        types: ["measure"],
        includeTags: [],
        excludeTags: [],
        loadPermissions: true,
        pageSize: 1,
    });
}

describe("TigerWorkspaceCatalogFactory", () => {
    it("loads the permissions of metrics on every page", async () => {
        const request = metricsBackend(["m1", "m2", "m3"]);

        const catalog = await catalogFactory(request).load();

        const metaIncludes = request.mock.calls.map(([config]) =>
            new URL(config.url!, "http://localhost").searchParams.get("metaInclude")?.split(","),
        );
        expect(metaIncludes).toEqual([["permissions", "page"], ["permissions"], ["permissions"]]);
        expect(catalog.measures().map(({ measure }) => [measure.id, measure.permissions])).toEqual([
            ["m1", ["VIEW"]],
            ["m2", ["VIEW"]],
            ["m3", ["VIEW"]],
        ]);
    });
});
