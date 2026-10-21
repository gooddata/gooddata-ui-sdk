// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiWorkspaceOutList } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerWorkspaceQueryFactory } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesWorkspaces: vi.fn(),
}));

const authCall = ((call: (client: unknown) => unknown) =>
    call({ axios: {}, basePath: "" })) as unknown as TigerAuthenticatedCallGuard;
const noop = vi.fn();

describe("TigerWorkspaceQuery search", () => {
    let factory: TigerWorkspaceQueryFactory;

    // Test files share the module cache (isolate: false). Load a fresh index.js bound to this file's mock.
    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceQueryFactory } = await import("./index.js");
        factory = new TigerWorkspaceQueryFactory(authCall, noop, noop, noop);
    });

    beforeEach(() => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesWorkspaces).mockResolvedValue({
            data: { data: [], meta: { page: { totalElements: 0 } } },
        } as unknown as AxiosResponse<JsonApiWorkspaceOutList>);
    });

    async function searchFilter(search: string) {
        await factory.forCurrentUser().withSearch(search).query();
        return vi.mocked(api.EntitiesApi_GetAllEntitiesWorkspaces).mock.lastCall?.[2]?.filter;
    }

    it("keeps a plain name unchanged in the filter", async () => {
        expect(await searchFilter("Retail core")).toBe("name=containsic='Retail core'");
    });

    it("escapes an apostrophe in the name", async () => {
        expect(await searchFilter("Bob's workspace")).toBe("name=containsic='Bob\\'s workspace'");
    });
});
