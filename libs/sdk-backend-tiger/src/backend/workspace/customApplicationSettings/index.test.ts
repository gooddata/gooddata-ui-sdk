// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceCustomApplicationSettingsService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityCustomApplicationSettings: vi.fn(),
    EntitiesApi_DeleteEntityCustomApplicationSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesCustomApplicationSettings: vi.fn(),
    EntitiesApi_GetEntityCustomApplicationSettings: vi.fn(),
}));

const setting = (id: string, applicationName: string) => ({
    id,
    type: "customApplicationSetting",
    attributes: { applicationName, content: { layout: [id] } },
});

describe("TigerWorkspaceCustomApplicationSettingsService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerWorkspaceCustomApplicationSettingsService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceCustomApplicationSettingsService } = await import("./index.js");
        service = new TigerWorkspaceCustomApplicationSettingsService(
            mockAuthCall as TigerAuthenticatedCallGuard,
            "ws",
        );
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns only the settings of the application", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesCustomApplicationSettings).mockResolvedValue({
            data: { data: [setting("s1", "ldmModeler"), setting("s2", "other")] },
        } as AxiosResponse);

        expect(await service.getSettings("ldmModeler")).toEqual([
            { id: "s1", applicationName: "ldmModeler", content: { layout: ["s1"] } },
        ]);
        expect(api.EntitiesApi_GetAllEntitiesCustomApplicationSettings).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            page: 0,
            size: 1000,
        });
    });

    it("reads all pages", async () => {
        const fullPage = Array.from({ length: 1000 }, (_, index) => setting(`s${index}`, "app"));
        vi.mocked(api.EntitiesApi_GetAllEntitiesCustomApplicationSettings)
            .mockResolvedValueOnce({ data: { data: fullPage } } as AxiosResponse)
            .mockResolvedValueOnce({ data: { data: [setting("last", "app")] } } as AxiosResponse);

        expect(await service.getSettings()).toHaveLength(1001);
    });

    it("returns one setting", async () => {
        vi.mocked(api.EntitiesApi_GetEntityCustomApplicationSettings).mockResolvedValue({
            data: { data: setting("s1", "ldmModeler") },
        } as AxiosResponse);

        expect(await service.getSetting("s1")).toEqual({
            id: "s1",
            applicationName: "ldmModeler",
            content: { layout: ["s1"] },
        });
        expect(api.EntitiesApi_GetEntityCustomApplicationSettings).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            objectId: "s1",
        });
    });

    it("creates a setting with the identifier", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityCustomApplicationSettings).mockResolvedValue({
            data: { data: setting("s1", "ldmModeler") },
        } as AxiosResponse);

        await service.createSetting("ldmModeler", { layout: ["s1"] }, "s1");

        expect(api.EntitiesApi_CreateEntityCustomApplicationSettings).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            jsonApiCustomApplicationSettingPostOptionalIdDocument: {
                data: {
                    type: "customApplicationSetting",
                    id: "s1",
                    attributes: { applicationName: "ldmModeler", content: { layout: ["s1"] } },
                },
            },
        });
    });

    it("deletes a setting", async () => {
        vi.mocked(api.EntitiesApi_DeleteEntityCustomApplicationSettings).mockResolvedValue(
            {} as AxiosResponse,
        );

        await service.deleteSetting("s1");

        expect(api.EntitiesApi_DeleteEntityCustomApplicationSettings).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            objectId: "s1",
        });
    });
});
