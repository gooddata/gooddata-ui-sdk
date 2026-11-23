// (C) 2026 GoodData Corporation

import { type AxiosAdapter, create as createAxios } from "axios";
import { expect, it, vi } from "vitest";

import { type ITigerClientBase } from "@gooddata/api-client-tiger";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { SemanticSearchQuery } from "./SemanticSearchQuery.js";

it("posts semantic search through the current workspace route", async () => {
    const data = { results: [], relationships: [] };
    const adapter = vi.fn<AxiosAdapter>(async (config) => ({
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
    }));
    const client = { axios: createAxios({ adapter }), basePath: "https://example.com" } as ITigerClientBase;
    const authCall: TigerAuthenticatedCallGuard = async (call) =>
        call(client, { getPrincipal: async () => ({ userId: "user" }) });
    const { signal } = new AbortController();

    const result = await new SemanticSearchQuery(authCall, "ws-1")
        .withQuestion("monthly revenue")
        .withObjectTypes(["metric"])
        .query({ signal });

    expect(adapter).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            method: "post",
            url: "https://example.com/api/v1/ai/workspaces/ws-1/search",
            data: JSON.stringify({
                deepSearch: true,
                limit: 10,
                question: "monthly revenue",
                objectTypes: ["metric"],
            }),
            signal,
        }),
    );
    expect(result).toEqual(data);
});
