// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiApiTokenOutDocument, MetadataUtilities } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import * as profileApi from "@gooddata/api-client-tiger/endpoints/profile";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerUserApiTokensService } from "./apiTokens.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesApiTokens: vi.fn(),
    EntitiesApi_CreateEntityApiTokens: vi.fn(),
    EntitiesApi_DeleteEntityApiTokens: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/profile", () => ({
    ProfileApi_GetCurrent: vi.fn(),
}));

describe("TigerUserApiTokensService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerUserApiTokensService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerUserApiTokensService } = await import("./apiTokens.js");
        service = new TigerUserApiTokensService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.mocked(profileApi.ProfileApi_GetCurrent).mockResolvedValue({ userId: "john" } as Awaited<
            ReturnType<typeof profileApi.ProfileApi_GetCurrent>
        >);
    });

    it("should list the tokens of the current user without their secrets", async () => {
        const getAllPagesOf = vi.spyOn(MetadataUtilities, "getAllPagesOf").mockResolvedValue([]);
        vi.spyOn(MetadataUtilities, "mergeEntitiesResults").mockResolvedValue({
            data: [{ id: "token-1", type: "apiToken", attributes: { bearerToken: "secret" } }],
        } as Awaited<ReturnType<typeof MetadataUtilities.mergeEntitiesResults>>);

        expect(await service.getAll()).toEqual([{ id: "token-1" }]);
        expect(getAllPagesOf.mock.calls[0][2]).toEqual({ userId: "john" });
    });

    it("should return the secret of a created token", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityApiTokens).mockResolvedValue({
            data: { data: { id: "token-1", type: "apiToken", attributes: { bearerToken: "secret" } } },
        } as AxiosResponse<JsonApiApiTokenOutDocument>);

        expect(await service.create("token-1")).toEqual({ id: "token-1", bearerToken: "secret" });
    });

    it("should reject a created token without a secret", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityApiTokens).mockResolvedValue({
            data: { data: { id: "token-1", type: "apiToken" } },
        } as AxiosResponse<JsonApiApiTokenOutDocument>);

        await expect(service.create("token-1")).rejects.toThrow();
    });

    it("should delete the token of the current user", async () => {
        await service.delete("token-1");

        expect(api.EntitiesApi_DeleteEntityApiTokens).toHaveBeenCalledWith({}, "", {
            userId: "john",
            id: "token-1",
        });
    });
});
