// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiUserSettingOutList } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type OrganizationUsersService } from "./users.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    EntitiesApi_CreateEntityUserSettings: vi.fn(),
    EntitiesApi_DeleteEntityUserSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesUserSettings: vi.fn(),
    EntitiesApi_UpdateEntityUserSettings: vi.fn(),
}));

function userSettingsResponse(settings: Array<{ type: string; value: unknown }>) {
    return {
        data: {
            data: settings.map(({ type, value }, index) => ({
                id: `setting-${index}`,
                type: "userSetting",
                attributes: { type, content: { value } },
            })),
        },
    } as AxiosResponse<JsonApiUserSettingOutList>;
}

describe("OrganizationUsersService localization settings", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: OrganizationUsersService;

    beforeAll(async () => {
        vi.resetModules();
        const { OrganizationUsersService } = await import("./users.js");
        service = new OrganizationUsersService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getUserLocalizationSettings", () => {
        it("returns the languages the user set for themselves", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
                userSettingsResponse([
                    { type: "LOCALE", value: "ko-KR" },
                    { type: "METADATA_LOCALE", value: "de-DE" },
                ]),
            );

            await expect(service.getUserLocalizationSettings("ben")).resolves.toEqual({
                LOCALE: "ko-KR",
                METADATA_LOCALE: "de-DE",
            });
            expect(api.EntitiesApi_GetAllEntitiesUserSettings).toHaveBeenCalledWith({}, "", {
                userId: "ben",
                filter: 'type=in=("LOCALE","METADATA_LOCALE","DATA_LOCALE")',
            });
        });

        it("leaves out settings without a language", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
                userSettingsResponse([
                    { type: "LOCALE", value: "" },
                    { type: "DATA_LOCALE", value: null },
                ]),
            );

            await expect(service.getUserLocalizationSettings("ben")).resolves.toEqual({});
        });
    });

    it("reads the same setting it updates when a type is stored twice", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
            userSettingsResponse([
                { type: "LOCALE", value: "ko-KR" },
                { type: "LOCALE", value: "fr-FR" },
            ]),
        );

        await expect(service.getUserLocalizationSettings("ben")).resolves.toEqual({ LOCALE: "ko-KR" });
    });

    describe("setUserLocalizationSetting", () => {
        it("creates the setting when the user does not have it", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(userSettingsResponse([]));

            await service.setUserLocalizationSetting("ben", "DATA_LOCALE", "fr-FR");

            expect(api.EntitiesApi_GetAllEntitiesUserSettings).toHaveBeenCalledWith({}, "", {
                userId: "ben",
                filter: "type==DATA_LOCALE",
            });
            expect(api.EntitiesApi_CreateEntityUserSettings).toHaveBeenCalledWith(
                {},
                "",
                expect.objectContaining({
                    userId: "ben",
                    jsonApiUserSettingInDocument: {
                        data: expect.objectContaining({
                            type: "userSetting",
                            attributes: { type: "DATA_LOCALE", content: { value: "fr-FR" } },
                        }),
                    },
                }),
            );
            expect(api.EntitiesApi_UpdateEntityUserSettings).not.toHaveBeenCalled();
        });

        it("updates the setting the user already has", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
                userSettingsResponse([{ type: "LOCALE", value: "ko-KR" }]),
            );

            await service.setUserLocalizationSetting("ben", "LOCALE", "fr-FR");

            expect(api.EntitiesApi_UpdateEntityUserSettings).toHaveBeenCalledWith({}, "", {
                id: "setting-0",
                userId: "ben",
                jsonApiUserSettingInDocument: {
                    data: {
                        type: "userSetting",
                        id: "setting-0",
                        attributes: { type: "LOCALE", content: { value: "fr-FR" } },
                    },
                },
            });
            expect(api.EntitiesApi_CreateEntityUserSettings).not.toHaveBeenCalled();
        });

        it("removes the other records of the type when it updates a setting stored twice", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
                userSettingsResponse([
                    { type: "LOCALE", value: "ko-KR" },
                    { type: "LOCALE", value: "ja-JP" },
                ]),
            );

            await service.setUserLocalizationSetting("ben", "LOCALE", "fr-FR");

            expect(api.EntitiesApi_UpdateEntityUserSettings).toHaveBeenCalledWith(
                {},
                "",
                expect.objectContaining({ id: "setting-0" }),
            );
            expect(api.EntitiesApi_DeleteEntityUserSettings).toHaveBeenCalledTimes(1);
            expect(api.EntitiesApi_DeleteEntityUserSettings).toHaveBeenCalledWith({}, "", {
                userId: "ben",
                id: "setting-1",
            });
        });

        it("removes the setting when there is no language", async () => {
            vi.mocked(api.EntitiesApi_GetAllEntitiesUserSettings).mockResolvedValue(
                userSettingsResponse([{ type: "METADATA_LOCALE", value: "de-DE" }]),
            );

            await service.setUserLocalizationSetting("ben", "METADATA_LOCALE", undefined);

            expect(api.EntitiesApi_DeleteEntityUserSettings).toHaveBeenCalledWith({}, "", {
                userId: "ben",
                id: "setting-0",
            });
            expect(api.EntitiesApi_CreateEntityUserSettings).not.toHaveBeenCalled();
            expect(api.EntitiesApi_UpdateEntityUserSettings).not.toHaveBeenCalled();
        });
    });
});
