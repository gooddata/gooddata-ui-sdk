// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesWorkspaces: vi.fn(async () => ({
        data: { data: [], meta: { page: { totalElements: 0 } } },
    })),
}));

import { EntitiesApi_GetAllEntitiesWorkspaces } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { TigerWorkspaceQueryFactory } from "./index.js";

const authCall = ((call: (client: unknown) => unknown) =>
    call({ axios: {}, basePath: "" })) as unknown as TigerAuthenticatedCallGuard;
const noop = vi.fn();

async function searchFilter(search: string) {
    const factory = new TigerWorkspaceQueryFactory(authCall, noop, noop, noop);
    await factory.forCurrentUser().withSearch(search).query();
    return vi.mocked(EntitiesApi_GetAllEntitiesWorkspaces).mock.lastCall?.[2]?.filter;
}

describe("TigerWorkspaceQuery search", () => {
    it("keeps a plain name unchanged in the filter", async () => {
        expect(await searchFilter("Retail core")).toBe("name=containsic='Retail core'");
    });

    it("escapes an apostrophe in the name", async () => {
        expect(await searchFilter("Bob's workspace")).toBe("name=containsic='Bob\\'s workspace'");
    });
});
