// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import type * as exponentialBackoff from "exponential-backoff";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type ReadCsvFileManifestsResponse, type UploadFileResponse } from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/result";
import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerDataSourceFilesService } from "./files.js";

vi.mock("@gooddata/api-client-tiger/endpoints/result", () => ({
    ResultApi_AnalyzeCsv: vi.fn(),
    ResultApi_AnalyzeSav: vi.fn(),
    ResultApi_DeleteFiles: vi.fn(),
    ResultApi_ImportCsv: vi.fn(),
    ResultApi_ImportSav: vi.fn(),
    ResultApi_ListFiles: vi.fn(),
    ResultApi_ReadCsvFileManifests: vi.fn(),
    ResultApi_StagingUpload: vi.fn(),
}));

vi.mock("exponential-backoff", async (importOriginal) => {
    const original = await importOriginal<typeof exponentialBackoff>();
    return {
        ...original,
        backOff: (call: () => Promise<unknown>, options: object) =>
            original.backOff(call, { ...options, startingDelay: 0, maxDelay: 0 }),
    };
});

const serviceUnavailable = () => new UnexpectedResponseError("Service Unavailable", 503, {});

describe("TigerDataSourceFilesService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerDataSourceFilesService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerDataSourceFilesService } = await import("./files.js");
        service = new TigerDataSourceFilesService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should retry the upload when the backend is overloaded", async () => {
        vi.mocked(api.ResultApi_StagingUpload)
            .mockRejectedValueOnce(serviceUnavailable())
            .mockResolvedValueOnce({
                data: { location: "staging/file.csv" },
            } as AxiosResponse<UploadFileResponse>);

        expect(await service.upload(new File(["a,b"], "file.csv"))).toBe("staging/file.csv");
        expect(api.ResultApi_StagingUpload).toHaveBeenCalledTimes(2);
    });

    it("should not retry the upload on other errors", async () => {
        const error = new UnexpectedResponseError("Bad Request", 400, {});
        vi.mocked(api.ResultApi_StagingUpload).mockRejectedValue(error);

        await expect(service.upload(new File(["a,b"], "file.csv"))).rejects.toBe(error);
        expect(api.ResultApi_StagingUpload).toHaveBeenCalledTimes(1);
    });

    it("should convert the manifest keys to the model", async () => {
        vi.mocked(api.ResultApi_ReadCsvFileManifests).mockResolvedValue({
            data: [
                {
                    name: "file.csv",
                    version: 2,
                    manifest: {
                        column_date_formats: { created: "yyyy-MM-dd" },
                        convert: { columnTypes: [{ name: "created", type: "string" }] },
                        read_method: "csv",
                    },
                },
            ],
        } as unknown as AxiosResponse<ReadCsvFileManifestsResponse[]>);

        expect(await service.getCsvManifests("ds1", ["file.csv"])).toEqual([
            {
                name: "file.csv",
                version: 2,
                readMethod: "csv",
                readOptions: undefined,
                parseOptions: undefined,
                convertOptions: { columnTypes: [{ name: "created", type: "string" }] },
                columnDateFormats: { created: "yyyy-MM-dd" },
            },
        ]);
        expect(api.ResultApi_ReadCsvFileManifests).toHaveBeenCalledWith({}, "", {
            dataSourceId: "ds1",
            readCsvFileManifestsRequest: { manifestRequests: [{ fileName: "file.csv" }] },
        });
    });

    it("should send the import tables to the data source", async () => {
        vi.mocked(api.ResultApi_ImportCsv).mockResolvedValue({
            data: [{ name: "orders", version: 1 }],
        } as AxiosResponse);
        const table = {
            name: "orders",
            source: { location: "staging/file.csv", config: { columnDateFormats: { created: "yyyy" } } },
        };

        expect(await service.importCsv("ds1", [table])).toEqual([{ name: "orders", version: 1 }]);
        expect(api.ResultApi_ImportCsv).toHaveBeenCalledWith({}, "", {
            dataSourceId: "ds1",
            importCsvRequest: { tables: [table] },
        });
    });

    it("should convert the analysis of an SPSS file with its labels", async () => {
        vi.mocked(api.ResultApi_AnalyzeSav).mockResolvedValue({
            data: [
                {
                    location: "staging/survey.sav",
                    columns: [
                        {
                            name: "q1",
                            type: "float64",
                            label: "Question 1",
                            valueLabels: [{ value: 1, label: "Yes" }],
                        },
                    ],
                    previewData: [[1]],
                },
            ],
        } as AxiosResponse);

        expect(await service.analyzeSav([{ location: "staging/survey.sav" }])).toEqual([
            {
                location: "staging/survey.sav",
                columns: [
                    {
                        name: "q1",
                        type: "float64",
                        label: "Question 1",
                        valueLabels: [{ value: 1, label: "Yes" }],
                    },
                ],
                previewData: [[1]],
            },
        ]);
        expect(api.ResultApi_AnalyzeSav).toHaveBeenCalledWith({}, "", {
            analyzeSavRequest: { analyzeRequests: [{ location: "staging/survey.sav" }] },
        });
    });

    it("should send the SPSS import tables to the data source", async () => {
        vi.mocked(api.ResultApi_ImportSav).mockResolvedValue({
            data: [{ name: "survey", version: 2 }],
        } as AxiosResponse);
        const table = { name: "survey", source: { location: "staging/survey.sav" } };

        expect(await service.importSav("ds1", [table])).toEqual([{ name: "survey", version: 2 }]);
        expect(api.ResultApi_ImportSav).toHaveBeenCalledWith({}, "", {
            dataSourceId: "ds1",
            importSavRequest: { tables: [table] },
        });
    });
});
