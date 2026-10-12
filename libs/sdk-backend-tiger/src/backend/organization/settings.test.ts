// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiOrganizationSettingOutList } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type OrganizationSettingsService } from "./settings.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityOrganizationSettings: vi.fn(),
    EntitiesApi_DeleteEntityOrganizationSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesOrganizationSettings: vi.fn(),
    EntitiesApi_UpdateEntityOrganizationSettings: vi.fn(),
}));

function settingsResponse(contents: unknown[]) {
    return {
        data: {
            data: contents.map((content, index) => ({
                id: `setting-${index}`,
                type: "organizationSetting",
                attributes: { content },
            })),
        },
    } as AxiosResponse<JsonApiOrganizationSettingOutList>;
}

describe("OrganizationSettingsService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: OrganizationSettingsService;

    beforeAll(async () => {
        vi.resetModules();
        const { OrganizationSettingsService } = await import("./settings.js");
        service = new OrganizationSettingsService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe.each([
        ["getMetadataLocale", "METADATA_LOCALE"],
        ["getDataLocale", "DATA_LOCALE"],
    ] as const)("%s", (method, type) => {
        it("should return the locale set on the organization", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesOrganizationSettings).mockResolvedValue(
                settingsResponse([{ value: "de-DE" }]),
            );

            await expect(service[method]()).resolves.toBe("de-DE");
            expect(api.EntitiesApi_GetAllEntitiesOrganizationSettings).toHaveBeenCalledWith({}, "", {
                filter: `type==${type}`,
            });
        });

        it("should return undefined when the organization has no setting", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesOrganizationSettings).mockResolvedValue(
                settingsResponse([]),
            );

            await expect(service[method]()).resolves.toBeUndefined();
        });

        it("should return undefined when the setting has an empty value", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesOrganizationSettings).mockResolvedValue(
                settingsResponse([{ value: "" }]),
            );

            await expect(service[method]()).resolves.toBeUndefined();
        });
    });
});
