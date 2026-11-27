// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type JsonApiCspDirectiveOutDocument,
    type JsonApiCspDirectiveOutList,
} from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type OrganizationCspDirectivesService } from "./cspDirectives.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesCspDirectives: vi.fn(),
    EntitiesApi_GetEntityCspDirectives: vi.fn(),
    EntitiesApi_CreateEntityCspDirectives: vi.fn(),
    EntitiesApi_UpdateEntityCspDirectives: vi.fn(),
    EntitiesApi_DeleteEntityCspDirectives: vi.fn(),
}));

const directiveDocument = {
    data: { id: "script-src", type: "cspDirective", attributes: { sources: ["'self'", "*.example.com"] } },
} as JsonApiCspDirectiveOutDocument;

describe("OrganizationCspDirectivesService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: OrganizationCspDirectivesService;

    beforeAll(async () => {
        vi.resetModules();
        const { OrganizationCspDirectivesService } = await import("./cspDirectives.js");
        service = new OrganizationCspDirectivesService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should convert all directives to the model", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesCspDirectives).mockResolvedValue({
            data: { data: [directiveDocument.data] },
        } as AxiosResponse<JsonApiCspDirectiveOutList>);

        expect(await service.getAll()).toEqual([{ id: "script-src", sources: ["'self'", "*.example.com"] }]);
    });

    it("should send the sources of a created directive in the JSON:API document", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityCspDirectives).mockResolvedValue({
            data: directiveDocument,
        } as AxiosResponse<JsonApiCspDirectiveOutDocument>);

        await service.create({ id: "script-src", sources: ["'self'"] });

        expect(api.EntitiesApi_CreateEntityCspDirectives).toHaveBeenCalledWith({}, "", {
            jsonApiCspDirectiveInDocument: {
                data: { id: "script-src", type: "cspDirective", attributes: { sources: ["'self'"] } },
            },
        });
    });

    it("should update the directive identified by its id", async () => {
        vi.mocked(api.EntitiesApi_UpdateEntityCspDirectives).mockResolvedValue({
            data: directiveDocument,
        } as AxiosResponse<JsonApiCspDirectiveOutDocument>);

        const result = await service.update({ id: "script-src", sources: ["'self'", "*.example.com"] });

        expect(vi.mocked(api.EntitiesApi_UpdateEntityCspDirectives).mock.calls[0][2].id).toBe("script-src");
        expect(result).toEqual({ id: "script-src", sources: ["'self'", "*.example.com"] });
    });
});
