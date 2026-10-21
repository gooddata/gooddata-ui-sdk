// (C) 2026 GoodData Corporation

import { backOff } from "exponential-backoff";

import {
    type AnalyzeCsvResponse,
    type AnalyzeSavResponse,
    type CsvParseOptions,
    type ImportCsvRequestTable,
    type ReadCsvFileManifestsResponse,
} from "@gooddata/api-client-tiger";
import {
    ResultApi_AnalyzeCsv,
    ResultApi_AnalyzeSav,
    ResultApi_DeleteFiles,
    ResultApi_ImportCsv,
    ResultApi_ImportSav,
    ResultApi_ListFiles,
    ResultApi_ReadCsvFileManifests,
    ResultApi_StagingUpload,
} from "@gooddata/api-client-tiger/endpoints/result";
import { type IDataSourceFilesService, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type ICsvAnalysis,
    type ICsvAnalysisRequest,
    type ICsvFileManifest,
    type ICsvImportResult,
    type ICsvImportTable,
    type ICsvParseOptions,
    type IDataSourceFile,
    type ISavAnalysis,
    type ISavAnalysisRequest,
    type ISavImportResult,
    type ISavImportTable,
} from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertApiError } from "../../utils/errorHandling.js";

// The generated client types the escape and quote characters as `object`, but the backend
// accepts a string or `false` there.
const toParseOptions = (parseOptions: ICsvParseOptions | undefined): CsvParseOptions | undefined =>
    parseOptions as CsvParseOptions | undefined;

const fromParseOptions = (parseOptions: CsvParseOptions | undefined): ICsvParseOptions | undefined =>
    parseOptions as ICsvParseOptions | undefined;

const convertAnalysis = (analysis: AnalyzeCsvResponse): ICsvAnalysis => ({
    location: analysis.location,
    columns: analysis.columns,
    previewData: analysis.previewData,
    config: analysis.config && {
        ...analysis.config,
        parseOptions: fromParseOptions(analysis.config.parseOptions),
    },
});

const convertSavAnalysis = ({ location, columns, previewData }: AnalyzeSavResponse): ISavAnalysis => ({
    location,
    columns: columns.map(({ name, type, label, valueLabels }) => ({
        name,
        type,
        label,
        valueLabels: valueLabels?.map(({ value, label }) => ({ value, label })),
    })),
    previewData,
});

const toImportTable = ({ name, source }: ICsvImportTable): ImportCsvRequestTable => ({
    name,
    source: {
        location: source.location,
        config: {
            ...source.config,
            parseOptions: toParseOptions(source.config.parseOptions),
        },
    },
});

const convertManifest = ({ name, version, manifest }: ReadCsvFileManifestsResponse): ICsvFileManifest => ({
    name,
    version,
    readMethod: manifest.read_method,
    readOptions: manifest.read,
    parseOptions: fromParseOptions(manifest.parse),
    convertOptions: manifest.convert,
    columnDateFormats: manifest.column_date_formats,
});

export class TigerDataSourceFilesService implements IDataSourceFilesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async upload(file: File): Promise<string> {
        const upload = () =>
            this.authCall(async (client) => {
                const result = await ResultApi_StagingUpload(client.axios, client.basePath, { file });
                return result.data.location;
            });

        // The upload API has rate limits and responds with 503 when it is overloaded.
        // Retry only then, with a random delay, so that the clients do not retry at the same time.
        return backOff(upload, {
            jitter: "full",
            numOfAttempts: 3,
            startingDelay: 1000,
            maxDelay: 4000,
            retry: (error) => {
                const converted = convertApiError(error);
                return isUnexpectedResponseError(converted) && converted.httpStatus === 503;
            },
        });
    }

    public async analyzeCsv(requests: ICsvAnalysisRequest[]): Promise<ICsvAnalysis[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_AnalyzeCsv(client.axios, client.basePath, {
                analyzeCsvRequest: { analyzeRequests: requests },
            });
            return result.data.map(convertAnalysis);
        });
    }

    public async importCsv(dataSourceId: string, tables: ICsvImportTable[]): Promise<ICsvImportResult[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_ImportCsv(client.axios, client.basePath, {
                dataSourceId,
                importCsvRequest: { tables: tables.map(toImportTable) },
            });
            return result.data;
        });
    }

    public async analyzeSav(requests: ISavAnalysisRequest[]): Promise<ISavAnalysis[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_AnalyzeSav(client.axios, client.basePath, {
                analyzeSavRequest: { analyzeRequests: requests },
            });
            return result.data.map(convertSavAnalysis);
        });
    }

    public async importSav(dataSourceId: string, tables: ISavImportTable[]): Promise<ISavImportResult[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_ImportSav(client.axios, client.basePath, {
                dataSourceId,
                importSavRequest: {
                    tables: tables.map(({ name, source }) => ({
                        name,
                        source: { location: source.location },
                    })),
                },
            });
            return result.data.map(({ name, version }) => ({ name, version }));
        });
    }

    public async getFiles(dataSourceId: string): Promise<IDataSourceFile[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_ListFiles(client.axios, client.basePath, { dataSourceId });
            return result.data;
        });
    }

    public async deleteFiles(dataSourceId: string, fileNames: string[]): Promise<void> {
        await this.authCall((client) =>
            ResultApi_DeleteFiles(client.axios, client.basePath, {
                dataSourceId,
                deleteFilesRequest: { fileNames },
            }),
        );
    }

    public async getCsvManifests(dataSourceId: string, fileNames: string[]): Promise<ICsvFileManifest[]> {
        return this.authCall(async (client) => {
            const result = await ResultApi_ReadCsvFileManifests(client.axios, client.basePath, {
                dataSourceId,
                readCsvFileManifestsRequest: {
                    manifestRequests: fileNames.map((fileName) => ({ fileName })),
                },
            });
            return result.data.map(convertManifest);
        });
    }
}
