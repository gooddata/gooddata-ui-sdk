// (C) 2026 GoodData Corporation

import { type AxiosPromise } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type EntitiesApiCreateEntityOrgMemoryItemsRequest,
    type EntitiesApiDeleteEntityOrgMemoryItemsRequest,
    type EntitiesApiGetAllEntitiesOrgMemoryItemsRequest,
    type EntitiesApiPatchEntityOrgMemoryItemsRequest,
    type EntitiesApiUpdateEntityOrgMemoryItemsRequest,
    EntitiesApi_CreateEntityOrgMemoryItems,
    EntitiesApi_DeleteEntityOrgMemoryItems,
    EntitiesApi_GetAllEntitiesOrgMemoryItems,
    EntitiesApi_PatchEntityOrgMemoryItems,
    EntitiesApi_UpdateEntityOrgMemoryItems,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IMemoryItemDefinition } from "@gooddata/sdk-model";

import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { OrganizationMemoryItemsService } from "./MemoryItemsService.js";

// The org memory service must call the GENERATED api-client functions (not hand-built
// client.axios.request(...)). We mock those generated functions and assert on the request
// parameters object they receive (the third positional arg), mirroring the workspace tests.
vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityOrgMemoryItems: vi.fn(),
    EntitiesApi_UpdateEntityOrgMemoryItems: vi.fn(),
    EntitiesApi_PatchEntityOrgMemoryItems: vi.fn(),
    EntitiesApi_DeleteEntityOrgMemoryItems: vi.fn(),
    EntitiesApi_GetAllEntitiesOrgMemoryItems: vi.fn(),
}));

const BASE_PATH = "https://example.gooddata.com";

const itemDefinition: IMemoryItemDefinition = {
    title: "My memory",
    description: "Some description",
    tags: ["tag-1", "tag-2"],
    strategy: "ALWAYS",
    instruction: "Always remember this",
    isDisabled: false,
    keywords: ["alpha", "beta"],
};

function makeMemoryItemOutDocument(id: string) {
    return {
        data: {
            id,
            type: "orgMemoryItem",
            attributes: {
                title: itemDefinition.title,
                description: itemDefinition.description,
                strategy: itemDefinition.strategy,
                instruction: itemDefinition.instruction,
                isDisabled: itemDefinition.isDisabled,
                keywords: itemDefinition.keywords,
            },
        },
        included: [],
    };
}

describe("OrganizationMemoryItemsService", () => {
    let authCall: TigerAuthenticatedCallGuard;

    beforeEach(() => {
        vi.clearAllMocks();
        authCall = vi.fn(async (callback) =>
            callback({
                axios: { request: vi.fn() },
                basePath: BASE_PATH,
            }),
        ) as unknown as TigerAuthenticatedCallGuard;
    });

    it("create() should call the generated create fn with a JSON:API body of type orgMemoryItem", async () => {
        vi.mocked(EntitiesApi_CreateEntityOrgMemoryItems).mockResolvedValue({
            data: makeMemoryItemOutDocument("created-id"),
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        const result = await service.create(itemDefinition);

        expect(EntitiesApi_CreateEntityOrgMemoryItems).toHaveBeenCalledTimes(1);
        const [axios, basePath, request] = vi.mocked(EntitiesApi_CreateEntityOrgMemoryItems).mock
            .calls[0] as unknown as [unknown, string, EntitiesApiCreateEntityOrgMemoryItemsRequest];

        expect(basePath).toBe(BASE_PATH);
        expect(axios).toBeDefined();
        expect(request.include).toEqual(["createdBy"]);
        const data = request.jsonApiOrgMemoryItemInDocument.data;
        // Regression guard: must be "orgMemoryItem", not "memoryItem".
        expect(data.type).toBe("orgMemoryItem");
        // Regression: org payloads must NOT include `tags` (OrgMemoryItem has no such field).
        expect(data.attributes).toEqual({
            title: itemDefinition.title,
            description: itemDefinition.description,
            strategy: itemDefinition.strategy,
            instruction: itemDefinition.instruction,
            isDisabled: itemDefinition.isDisabled,
            keywords: itemDefinition.keywords,
        });

        expect(result.id).toBe("created-id");
        expect(result.type).toBe("memoryItem");
        expect(result.title).toBe(itemDefinition.title);
        expect(result.strategy).toBe(itemDefinition.strategy);
    });

    it("update() should call the generated update fn with id and type orgMemoryItem", async () => {
        vi.mocked(EntitiesApi_UpdateEntityOrgMemoryItems).mockResolvedValue({
            data: makeMemoryItemOutDocument("item-1"),
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        const result = await service.update("item-1", itemDefinition);

        const request = vi.mocked(EntitiesApi_UpdateEntityOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiUpdateEntityOrgMemoryItemsRequest;
        expect(request.id).toBe("item-1");
        const data = request.jsonApiOrgMemoryItemInDocument.data;
        expect(data.id).toBe("item-1");
        expect(data.type).toBe("orgMemoryItem");
        // Regression: PUT must omit `tags` (no such field) and keep `keywords`.
        expect(data.attributes).toEqual({
            title: itemDefinition.title,
            description: itemDefinition.description,
            strategy: itemDefinition.strategy,
            instruction: itemDefinition.instruction,
            isDisabled: itemDefinition.isDisabled,
            keywords: itemDefinition.keywords,
        });

        expect(result.id).toBe("item-1");
    });

    it("patch() should call the generated patch fn with id and type orgMemoryItem", async () => {
        vi.mocked(EntitiesApi_PatchEntityOrgMemoryItems).mockResolvedValue({
            data: makeMemoryItemOutDocument("item-2"),
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        const partial: Partial<IMemoryItemDefinition> = { isDisabled: true };
        const result = await service.patch("item-2", partial);

        const request = vi.mocked(EntitiesApi_PatchEntityOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiPatchEntityOrgMemoryItemsRequest;
        expect(request.id).toBe("item-2");
        const data = request.jsonApiOrgMemoryItemPatchDocument.data;
        expect(data.id).toBe("item-2");
        expect(data.type).toBe("orgMemoryItem");
        expect(data.attributes).toEqual(partial);

        expect(result.id).toBe("item-2");
    });

    it("delete() should call the generated delete fn with the given id", async () => {
        vi.mocked(EntitiesApi_DeleteEntityOrgMemoryItems).mockResolvedValue({
            data: undefined,
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        await service.delete("item-3");

        const request = vi.mocked(EntitiesApi_DeleteEntityOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiDeleteEntityOrgMemoryItemsRequest;
        expect(request.id).toBe("item-3");
    });

    it("delete() should forward the raw id (path encoding is handled by the generated fn)", async () => {
        vi.mocked(EntitiesApi_DeleteEntityOrgMemoryItems).mockResolvedValue({
            data: undefined,
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        await service.delete("a b/c");

        const request = vi.mocked(EntitiesApi_DeleteEntityOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiDeleteEntityOrgMemoryItemsRequest;
        // The generated DeleteEntityOrgMemoryItems url-encodes the id into the path itself.
        expect(request.id).toBe("a b/c");
    });

    it("getCreatedByUsers() should derive the deduped creator set from all org items (unfiltered)", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValue({
            data: {
                data: [
                    {
                        id: "mem-1",
                        type: "orgMemoryItem",
                        attributes: { title: "First", strategy: "ALWAYS" },
                        relationships: { createdBy: { data: { id: "admin", type: "user" } } },
                    },
                    {
                        id: "mem-2",
                        type: "orgMemoryItem",
                        attributes: { title: "Second", strategy: "AUTO" },
                        relationships: { createdBy: { data: { id: "alice", type: "user" } } },
                    },
                    {
                        // Same creator as mem-1 - must be deduped by login.
                        id: "mem-3",
                        type: "orgMemoryItem",
                        attributes: { title: "Third", strategy: "AUTO" },
                        relationships: { createdBy: { data: { id: "admin", type: "user" } } },
                    },
                ],
                included: [
                    { id: "admin", type: "user", attributes: { firstname: "Ada", lastname: "Min" } },
                    { id: "alice", type: "user", attributes: { firstname: "Alice", lastname: "Liddell" } },
                ],
            },
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        const result = await service.getCreatedByUsers();

        // A single GET is made: the page (3 items) is shorter than the page size, so paging stops.
        expect(EntitiesApi_GetAllEntitiesOrgMemoryItems).toHaveBeenCalledTimes(1);
        const request = vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiGetAllEntitiesOrgMemoryItemsRequest;
        expect(request).toMatchObject({ size: 500, page: 0, include: ["createdBy"] });

        expect(result.reasoning).toBe("");
        expect(result.users.map((user) => user.login)).toEqual(["admin", "alice"]);
        // fullName is composed from first/last name so the filter shows real names, not logins.
        expect(result.users.map((user) => user.fullName)).toEqual(["Ada Min", "Alice Liddell"]);
    });

    it("getCreatedByUsers() should page through all items and union creators across pages", async () => {
        // First page: exactly the page size (500) items -> the loop must request a second page.
        const firstPageItems = Array.from({ length: 500 }, (_, index) => {
            const login = index % 2 === 0 ? "admin" : "alice";
            return {
                id: `mem-${index}`,
                type: "orgMemoryItem",
                attributes: { title: `Item ${index}`, strategy: "ALWAYS" },
                relationships: { createdBy: { data: { id: login, type: "user" } } },
            };
        });
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValueOnce({
            data: {
                data: firstPageItems,
                included: [
                    { id: "admin", type: "user", attributes: { firstname: "Ada", lastname: "Min" } },
                    { id: "alice", type: "user", attributes: { firstname: "Alice", lastname: "Liddell" } },
                ],
            },
        } as unknown as Awaited<AxiosPromise>);
        // Second page: fewer than the page size -> the loop stops after consuming it.
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: "mem-500",
                        type: "orgMemoryItem",
                        attributes: { title: "Item 500", strategy: "AUTO" },
                        relationships: { createdBy: { data: { id: "bob", type: "user" } } },
                    },
                ],
                included: [
                    { id: "bob", type: "user", attributes: { firstname: "Bob", lastname: "Builder" } },
                ],
            },
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);

        const result = await service.getCreatedByUsers();

        // Two GETs: page 0 (full) then page 1 (short, stops the loop).
        expect(EntitiesApi_GetAllEntitiesOrgMemoryItems).toHaveBeenCalledTimes(2);
        expect(vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock.calls[0][2]).toMatchObject({
            size: 500,
            page: 0,
            include: ["createdBy"],
        });
        expect(vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock.calls[1][2]).toMatchObject({
            size: 500,
            page: 1,
            include: ["createdBy"],
        });

        // Creators are deduped by login and unioned across pages.
        expect(result.users.map((user) => user.login).sort()).toEqual(["admin", "alice", "bob"]);
    });
});

describe("OrganizationMemoryItemsQuery (via service.getMemoryItemsQuery)", () => {
    let authCall: TigerAuthenticatedCallGuard;

    beforeEach(() => {
        vi.clearAllMocks();
        authCall = vi.fn(async (callback) =>
            callback({
                axios: { request: vi.fn() },
                basePath: BASE_PATH,
            }),
        ) as unknown as TigerAuthenticatedCallGuard;
    });

    it("query() should call the generated GetAll fn, convert items and read totalCount from meta", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValue({
            data: {
                data: [
                    {
                        id: "mem-1",
                        type: "orgMemoryItem",
                        attributes: { title: "First", strategy: "ALWAYS", isDisabled: false },
                    },
                    {
                        id: "mem-2",
                        type: "orgMemoryItem",
                        attributes: { title: "Second", strategy: "AUTO", isDisabled: true },
                    },
                ],
                included: [],
                meta: { page: { totalElements: 2 } },
            },
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);
        const result = await service.getMemoryItemsQuery().withSize(50).withPage(0).query();

        const request = vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiGetAllEntitiesOrgMemoryItemsRequest;
        expect(request).toMatchObject({ size: 50, page: 0, metaInclude: ["page"] });

        expect(result.totalCount).toBe(2);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].id).toBe("mem-1");
        expect(result.items[0].title).toBe("First");
        expect(result.items[1].id).toBe("mem-2");
        expect(result.items[1].isDisabled).toBe(true);
    });

    it("withFilter({ isDisabled: true }) should serialize a boolean equality clause", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValue({
            data: { data: [], included: [], meta: { page: { totalElements: 0 } } },
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);
        await service.getMemoryItemsQuery().withFilter({ isDisabled: true }).withSize(50).withPage(0).query();

        const request = vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiGetAllEntitiesOrgMemoryItemsRequest;
        expect(request.filter).toBe("isDisabled==true");
    });

    it("withFilter({ isDisabled: false }) should also match items with a null isDisabled (enabled)", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mockResolvedValue({
            data: { data: [], included: [], meta: { page: { totalElements: 0 } } },
        } as unknown as Awaited<AxiosPromise>);

        const service = new OrganizationMemoryItemsService(authCall);
        await service
            .getMemoryItemsQuery()
            .withFilter({ isDisabled: false })
            .withSize(50)
            .withPage(0)
            .query();

        const request = vi.mocked(EntitiesApi_GetAllEntitiesOrgMemoryItems).mock
            .calls[0][2] as EntitiesApiGetAllEntitiesOrgMemoryItemsRequest;
        expect(request.filter).toBe("(isDisabled==false,isDisabled=isnull=true)");
    });
});
