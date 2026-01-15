// (C) 2025-2026 GoodData Corporation

import { type AxiosError, type AxiosPromise, type AxiosRequestConfig } from "axios";

import { type ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    ExportApi_GetExportedFile,
    ExportApi_GetImageExport,
    ExportApi_GetRawExport,
    ExportApi_GetSlidesExport,
    ExportApi_GetTabularExport,
} from "@gooddata/api-client-tiger/endpoints/export";
import {
    DataTooLargeError,
    type IDataTooLargeResponseBody,
    type IExportResult,
    TimeoutError,
} from "@gooddata/sdk-backend-spi";

import { parseNameFromContentDisposition } from "./downloadFile.js";

const DEFAULT_POLL_DELAY = 5000;
// default to 5 minutes: this is roughly the same as the previous
// 50 attempts * (5 seconds + the length of the request) each
const DEFAULT_POLL_TIMEOUT_MS = 5 * 60 * 1000;

export interface IPayloadBase {
    workspaceId: string;
    exportId: string;
}

/*
This might seem unnecessary: why not make the handleExportResultPolling accept something like
`client.export.getExportedFile`?
While that sounds correct, it actually does not work: all the client callbacks need `this` bound to the `client`
instance, otherwise they do not work.
So it was either mandating passing things like `client.export.getExportedFile.bind(client)` which is error prone
because the type system does not guard against it, or doing this more explicit "call table".
This approach ensures the correct `this` is bound and the whole thing is much safer for the callers.
 */
const EXPORT_GETTERS: Record<
    string,
    (client: ITigerClientBase, payload: IPayloadBase, options?: AxiosRequestConfig) => AxiosPromise<File>
> = {
    getExportedFile: (client, payload, options) =>
        ExportApi_GetExportedFile(client.axios, client.basePath, payload, options),
    getImageExport: (client, payload, options) =>
        ExportApi_GetImageExport(client.axios, client.basePath, payload, options),
    getRawExport: (client, payload, options) =>
        ExportApi_GetRawExport(client.axios, client.basePath, payload, options),
    getSlidesExport: (client, payload, options) =>
        ExportApi_GetSlidesExport(client.axios, client.basePath, payload, options),
    getTabularExport: (client, payload, options) =>
        ExportApi_GetTabularExport(client.axios, client.basePath, payload, options),
};

type ExportGetter = keyof typeof EXPORT_GETTERS;

/**
 * Handles the polling for export results including timeout handling, error parsing and more.
 */
export async function handleExportResultPolling(
    client: ITigerClientBase,
    payload: IPayloadBase,
    exportGetter: ExportGetter,
    timeout = DEFAULT_POLL_TIMEOUT_MS,
): Promise<IExportResult> {
    const timeoutSignal = AbortSignal.timeout(timeout);
    let lastPollingTimeoutId;
    try {
        while (!timeoutSignal.aborted) {
            try {
                const result = await EXPORT_GETTERS[exportGetter](client, payload, {
                    responseType: "blob",
                    signal: timeoutSignal,
                });
                if (result?.status === 200) {
                    return {
                        uri: result.config?.url || "",
                        objectUrl: URL.createObjectURL(result.data),
                        fileName: parseNameFromContentDisposition(result),
                    };
                }
            } catch (error: any) {
                await tryParseError(error);
            }

            await new Promise((resolve) => {
                lastPollingTimeoutId = setTimeout(resolve, DEFAULT_POLL_DELAY);
            });
        }
    } finally {
        // Prevent memory leak by ensuring there is no dangling timeout in case anything goes wrong.
        clearTimeout(lastPollingTimeoutId);
    }

    throw new TimeoutError(
        `Export timeout for export id "${payload.exportId}" in workspace "${payload.workspaceId}"`,
    );
}

function isAxiosErrorWithBlob(error: Error): error is AxiosError<Blob> {
    return error.name === "AxiosError";
}

/**
 * Given an error, try parsing a structured error from it and throws it.
 * If that is not possible, throw the original error.
 *
 * This is necessary because errors coming from the export API have their details wrapped in a Blob,
 * just like the data are when the call succeeds.
 *
 * @param error - the error to try parsing
 */
async function tryParseError(error: any): Promise<never> {
    // Errors coming from the export API have their details wrapped in a Blob, just like the data
    // are when the call succeeds.
    if (!isAxiosErrorWithBlob(error)) {
        throw error;
    }
    if (!error.response?.data) {
        throw error;
    }
    if (error.status === 400) {
        let parsed: IDataTooLargeResponseBody;
        // In case of any parsing errors, throw the original error:
        // it has unexpected shape and the parsing error is useless.
        try {
            const type = error.response.data.type;
            const blob = new Blob([error.response.data], { type });
            const data = await blob.text();
            parsed = JSON.parse(data);
        } catch {
            throw error;
        }
        throw new DataTooLargeError(error.message, undefined, parsed);
    }

    throw error;
}
