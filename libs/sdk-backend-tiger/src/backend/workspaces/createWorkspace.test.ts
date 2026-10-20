// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiWorkspaceOutDocument } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import {
    type DateFormatter,
    type DateNormalizer,
    type DateStringifier,
} from "../../convertors/fromBackend/dateFormatting/types.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerWorkspaceQueryFactory } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityWorkspaces: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaces: vi.fn(),
}));

describe("TigerWorkspaceQueryFactory.createWorkspace", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let factory: TigerWorkspaceQueryFactory;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceQueryFactory } = await import("./index.js");
        factory = new TigerWorkspaceQueryFactory(
            mockAuthCall as TigerAuthenticatedCallGuard,
            vi.fn() as unknown as DateFormatter,
            vi.fn() as unknown as DateStringifier,
            vi.fn() as unknown as DateNormalizer,
        );
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.EntitiesApi_CreateEntityWorkspaces).mockResolvedValue({
            data: {
                data: {
                    id: "child",
                    type: "workspace",
                    attributes: { name: "Child" },
                    relationships: { parent: { data: { id: "parent", type: "workspace" } } },
                },
            },
        } as AxiosResponse<JsonApiWorkspaceOutDocument>);
    });

    it("should create the workspace under its parent and return its descriptor", async () => {
        const descriptor = await factory.createWorkspace({
            id: "child",
            title: "Child",
            parentWorkspace: "parent",
        });

        expect(
            vi.mocked(api.EntitiesApi_CreateEntityWorkspaces).mock.calls[0][2].jsonApiWorkspaceInDocument
                .data,
        ).toEqual({
            id: "child",
            type: "workspace",
            attributes: { name: "Child" },
            relationships: { parent: { data: { id: "parent", type: "workspace" } } },
        });
        expect(descriptor).toMatchObject({ id: "child", title: "Child", parentWorkspace: "parent" });
    });

    it("should create a root workspace without the parent relationship", async () => {
        await factory.createWorkspace({ id: "root", title: "Root" });

        expect(
            vi.mocked(api.EntitiesApi_CreateEntityWorkspaces).mock.calls[0][2].jsonApiWorkspaceInDocument.data
                .relationships,
        ).toBeUndefined();
    });
});
