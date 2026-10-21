// (C) 2026 GoodData Corporation

import {
    type ICsvAnalysis,
    type ICsvAnalysisRequest,
    type ICsvFileManifest,
    type ICsvImportResult,
    type ICsvImportTable,
    type IDataSourceFile,
    type ISavAnalysis,
    type ISavAnalysisRequest,
    type ISavImportResult,
    type ISavImportTable,
} from "@gooddata/sdk-model";

/**
 * Service to manage files of data sources that keep their data in files, for example CSV data sources.
 *
 * @remarks
 * A file goes to a data source in three steps: upload it to the staging area, analyze it, and import it.
 *
 * @alpha
 */
export interface IDataSourceFilesService {
    /**
     * Uploads a file to the staging area.
     *
     * @param file - file to upload
     * @returns location of the uploaded file, to use in the analysis and the import
     */
    upload(file: File): Promise<string>;

    /**
     * Analyzes CSV files in the staging area.
     *
     * @param requests - files to analyze
     */
    analyzeCsv(requests: ICsvAnalysisRequest[]): Promise<ICsvAnalysis[]>;

    /**
     * Imports CSV files from the staging area into a data source.
     *
     * @param dataSourceId - identifier of the data source
     * @param tables - tables to create or update from the files
     */
    importCsv(dataSourceId: string, tables: ICsvImportTable[]): Promise<ICsvImportResult[]>;

    /**
     * Analyzes SPSS (.sav) files in the staging area.
     *
     * @param requests - files to analyze
     */
    analyzeSav(requests: ISavAnalysisRequest[]): Promise<ISavAnalysis[]>;

    /**
     * Imports SPSS (.sav) files from the staging area into a data source.
     *
     * @param dataSourceId - identifier of the data source
     * @param tables - tables to create or update from the files
     */
    importSav(dataSourceId: string, tables: ISavImportTable[]): Promise<ISavImportResult[]>;

    /**
     * Returns files of a data source.
     *
     * @param dataSourceId - identifier of the data source
     */
    getFiles(dataSourceId: string): Promise<IDataSourceFile[]>;

    /**
     * Deletes files of a data source.
     *
     * @param dataSourceId - identifier of the data source
     * @param fileNames - names of the files to delete
     */
    deleteFiles(dataSourceId: string, fileNames: string[]): Promise<void>;

    /**
     * Returns the options that the backend used to import CSV files into a data source.
     *
     * @param dataSourceId - identifier of the data source
     * @param fileNames - names of the files
     */
    getCsvManifests(dataSourceId: string, fileNames: string[]): Promise<ICsvFileManifest[]>;
}
