// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiDataSourceOutDocument } from "@gooddata/api-client-tiger";
import * as actionsApi from "@gooddata/api-client-tiger/endpoints/actions";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import * as scanApi from "@gooddata/api-client-tiger/endpoints/scanModel";
import { NotAuthenticated } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerDataSourcesService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityDataSources: vi.fn(),
    EntitiesApi_DeleteEntityDataSources: vi.fn(),
    EntitiesApi_GetAllEntitiesDataSourceIdentifiers: vi.fn(),
    EntitiesApi_GetAllEntitiesDataSources: vi.fn(),
    EntitiesApi_GetEntityDataSources: vi.fn(),
    EntitiesApi_PatchEntityDataSources: vi.fn(),
    EntitiesApi_UpdateEntityDataSources: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/scanModel", () => ({
    ScanModelApi_GetDataSourceSchemata: vi.fn(),
    ScanModelApi_TestDataSource: vi.fn(),
    ScanModelApi_TestDataSourceDefinition: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_RegisterUploadNotification: vi.fn(),
}));

const dataSourceDocument = {
    data: {
        id: "ds1",
        type: "dataSource",
        attributes: {
            name: "Sales",
            type: "POSTGRESQL",
            schema: "public",
            url: "jdbc:postgresql://localhost/sales",
            username: null,
            cacheStrategy: "ALWAYS",
        },
        meta: { permissions: ["MANAGE"] },
    },
} as unknown as JsonApiDataSourceOutDocument;

const badRequest = (detail: string) =>
    Object.assign(new Error("Request failed with status code 400"), {
        response: { status: 400, data: { detail } },
    });

describe("TigerDataSourcesService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerDataSourcesService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerDataSourcesService } = await import("./index.js");
        service = new TigerDataSourcesService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should convert the data source to the model", async () => {
        vi.mocked(api.EntitiesApi_GetEntityDataSources).mockResolvedValue({
            data: dataSourceDocument,
        } as AxiosResponse<JsonApiDataSourceOutDocument>);

        const result = await service.getDataSource("ds1");

        expect(result).toMatchObject({
            id: "ds1",
            name: "Sales",
            type: "POSTGRESQL",
            schema: "public",
            username: undefined,
            permissions: ["MANAGE"],
            cacheStrategy: "ALWAYS",
        });
    });

    it("should send only the data source attributes in the JSON:API document", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityDataSources).mockResolvedValue({
            data: dataSourceDocument,
        } as AxiosResponse<JsonApiDataSourceOutDocument>);

        await service.createDataSource({
            id: "ds1",
            name: "Sales",
            type: "POSTGRESQL",
            schema: "public",
            password: "secret",
        });

        const document = vi.mocked(api.EntitiesApi_CreateEntityDataSources).mock.calls[0][2]
            .jsonApiDataSourceInDocument;
        expect(document.data.id).toBe("ds1");
        expect(document.data.type).toBe("dataSource");
        expect(document.data.attributes).not.toHaveProperty("id");
        expect(document.data.attributes).toMatchObject({ name: "Sales", password: "secret" });
    });

    it("should send the extended data source attributes", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityDataSources).mockResolvedValue({
            data: dataSourceDocument,
        } as AxiosResponse<JsonApiDataSourceOutDocument>);

        await service.createDataSource({
            id: "ds1",
            name: "Sales",
            type: "POSTGRESQL",
            schema: "public",
            alternativeDataSourceId: "ds2",
            disableStatistics: true,
            ignoreJwtAud: true,
        });

        expect(
            vi.mocked(api.EntitiesApi_CreateEntityDataSources).mock.calls[0][2].jsonApiDataSourceInDocument
                .data.attributes,
        ).toMatchObject({ alternativeDataSourceId: "ds2", disableStatistics: true, ignoreJwtAud: true });
    });

    it("should reject when the backend refuses to save the data source", async () => {
        const error = badRequest("name is too long");
        vi.mocked(api.EntitiesApi_PatchEntityDataSources).mockRejectedValue(error);

        await expect(service.patchDataSource("ds1", { id: "ds1", name: "x" })).rejects.toBe(error);
    });

    it("should reject when the backend refuses the deletion", async () => {
        const error = badRequest("in use");
        vi.mocked(api.EntitiesApi_DeleteEntityDataSources).mockRejectedValue(error);

        await expect(service.deleteDataSource("ds1")).rejects.toBe(error);
    });

    it("should test the saved data source when its identifier is set", async () => {
        vi.mocked(scanApi.ScanModelApi_TestDataSource).mockResolvedValue({
            data: { successful: true },
        } as AxiosResponse);
        const connection = { type: "POSTGRESQL" as const, url: "jdbc:postgresql://x", schema: "public" };

        expect(await service.testConnection(connection, "ds1")).toEqual({
            successful: true,
            error: undefined,
        });
        expect(scanApi.ScanModelApi_TestDataSource).toHaveBeenCalledWith({}, "", {
            dataSourceId: "ds1",
            testRequest: connection,
        });
        expect(scanApi.ScanModelApi_TestDataSourceDefinition).not.toHaveBeenCalled();
    });

    it("should resolve with an unsuccessful result when the connection test request fails", async () => {
        vi.mocked(scanApi.ScanModelApi_TestDataSourceDefinition).mockRejectedValue(badRequest("bad url"));

        expect(
            await service.testConnection({
                type: "POSTGRESQL",
                url: "jdbc:postgresql://x",
                schema: "public",
            }),
        ).toEqual({ successful: false, error: "bad url" });
    });

    it("should list the data sources sorted by name with the permissions of the current user", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesDataSourceIdentifiers).mockResolvedValue({
            data: {
                data: [
                    {
                        id: "ds1",
                        type: "dataSourceIdentifier",
                        attributes: { name: "Sales", schema: "public", type: "POSTGRESQL" },
                        meta: { permissions: ["MANAGE"] },
                    },
                ],
            },
        } as AxiosResponse);

        expect(await service.getDataSources()).toEqual([
            { id: "ds1", name: "Sales", schema: "public", type: "POSTGRESQL", permissions: ["MANAGE"] },
        ]);
        expect(vi.mocked(api.EntitiesApi_GetAllEntitiesDataSourceIdentifiers).mock.calls[0][2]).toMatchObject(
            {
                sort: ["name"],
                metaInclude: ["permissions"],
            },
        );
    });

    it("should not hide an expired session when it checks for data sources", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesDataSources).mockRejectedValue(
            new NotAuthenticated("expired"),
        );

        await expect(service.hasDataSources()).rejects.toBeInstanceOf(NotAuthenticated);
    });

    it("should report no data sources when the backend refuses the request", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesDataSources).mockRejectedValue(new Error("forbidden"));

        expect(await service.hasDataSources()).toBe(false);
    });

    it("should register an upload notification for the data source", async () => {
        vi.mocked(actionsApi.ActionsApi_RegisterUploadNotification).mockResolvedValue({} as AxiosResponse);

        await service.registerUploadNotification("ds1");

        expect(actionsApi.ActionsApi_RegisterUploadNotification).toHaveBeenCalledWith({}, "", {
            dataSourceId: "ds1",
        });
    });
});
