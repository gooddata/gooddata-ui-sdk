// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import * as exportApi from "@gooddata/api-client-tiger/endpoints/export";
import { TimeoutError } from "@gooddata/sdk-backend-spi";

import { handleExportResultPolling } from "../exportPolling.js";

vi.mock("@gooddata/api-client-tiger/endpoints/export", () => ({
    ExportApi_GetExportedFile: vi.fn(),
    ExportApi_GetImageExport: vi.fn(),
    ExportApi_GetRawExport: vi.fn(),
    ExportApi_GetSlidesExport: vi.fn(),
    ExportApi_GetTabularExport: vi.fn(),
}));

describe("exportPolling", () => {
    describe("handleExportResultPolling", () => {
        const client = { axios: {}, basePath: "" } as unknown as Parameters<
            typeof handleExportResultPolling
        >[0];
        const payload = { workspaceId: "ws-1", exportId: "export-1" };

        it("throws TimeoutError when the export API responds with 504", async () => {
            const axios504Error = {
                name: "AxiosError",
                message: "Gateway Timeout",
                status: 504,
                response: {
                    status: 504,
                    data: new Blob(["timeout"]),
                },
            };
            vi.mocked(exportApi.ExportApi_GetRawExport).mockRejectedValue(axios504Error);

            await expect(handleExportResultPolling(client, payload, "getRawExport", 10000)).rejects.toThrow(
                TimeoutError,
            );
        });

        it("throws TimeoutError on 504 even when the response has no body", async () => {
            const axios504ErrorWithoutBody = {
                name: "AxiosError",
                message: "Gateway Timeout",
                status: 504,
                response: undefined,
            };
            vi.mocked(exportApi.ExportApi_GetRawExport).mockRejectedValue(axios504ErrorWithoutBody);

            await expect(handleExportResultPolling(client, payload, "getRawExport", 10000)).rejects.toThrow(
                TimeoutError,
            );
        });
    });
});
