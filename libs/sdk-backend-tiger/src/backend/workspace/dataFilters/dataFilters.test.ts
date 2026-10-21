// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerDataFiltersService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityWorkspaceDataFilterSettings: vi.fn(),
    EntitiesApi_DeleteEntityWorkspaceDataFilterSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaceDataFilterSettings: vi.fn(),
    EntitiesApi_PatchEntityWorkspaceDataFilters: vi.fn(),
}));

describe("TigerDataFiltersService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerDataFiltersService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerDataFiltersService } = await import("./index.js");
        service = new TigerDataFiltersService(mockAuthCall as TigerAuthenticatedCallGuard, "ws1");
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should create a data filter setting without removing the existing settings", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityWorkspaceDataFilterSettings).mockResolvedValue({
            data: {
                data: {
                    id: "setting1",
                    type: "workspaceDataFilterSetting",
                    attributes: { title: "Setting 1", description: "Region A", filterValues: ["a"] },
                },
            },
        } as AxiosResponse);

        const setting = await service.createDataFilterSetting({
            id: "setting1",
            dataFilter: idRef("wdf1", "workspaceDataFilter"),
            title: "Setting 1",
            description: "Region A",
            filterValues: ["a"],
        });

        expect(setting).toEqual({
            id: "setting1",
            ref: idRef("setting1", "workspaceDataFilterSetting"),
            title: "Setting 1",
            description: "Region A",
            filterValues: ["a"],
            isInherited: false,
        });
        expect(api.EntitiesApi_CreateEntityWorkspaceDataFilterSettings).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws1",
            jsonApiWorkspaceDataFilterSettingInDocument: {
                data: {
                    id: "setting1",
                    type: "workspaceDataFilterSetting",
                    attributes: { title: "Setting 1", description: "Region A", filterValues: ["a"] },
                    relationships: {
                        workspaceDataFilter: { data: { id: "wdf1", type: "workspaceDataFilter" } },
                    },
                },
            },
        });
        expect(api.EntitiesApi_GetAllEntitiesWorkspaceDataFilterSettings).not.toHaveBeenCalled();
        expect(api.EntitiesApi_DeleteEntityWorkspaceDataFilterSettings).not.toHaveBeenCalled();
    });

    it("should send the description when it updates a data filter", async () => {
        vi.mocked(api.EntitiesApi_PatchEntityWorkspaceDataFilters).mockResolvedValue({} as AxiosResponse);

        await service.updateDataFilter({
            id: "wdf1",
            ref: idRef("wdf1", "workspaceDataFilter"),
            title: "Region",
            description: "Sales region",
            columnName: "region",
            settings: [],
            isInherited: false,
        });

        expect(
            vi.mocked(api.EntitiesApi_PatchEntityWorkspaceDataFilters).mock.calls[0][2]
                .jsonApiWorkspaceDataFilterPatchDocument.data.attributes,
        ).toEqual({ title: "Region", description: "Sales region", columnName: "region" });
    });
});
