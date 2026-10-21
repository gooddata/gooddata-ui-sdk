// (C) 2026 GoodData Corporation

/**
 * Format of a file stored in a data source that keeps its data in files.
 *
 * @alpha
 */
export type DataSourceFileType = "CSV" | "SAV";

/**
 * File stored in a data source that keeps its data in files, for example a CSV data source.
 *
 * @alpha
 */
export interface IDataSourceFile {
    name: string;
    /**
     * Size of the file in bytes.
     */
    size: number;
    /**
     * Date and time of the last change, as an ISO-8601 string.
     */
    modifiedAt: string;
    type: DataSourceFileType;
}

/**
 * Type of a CSV column that the backend uses when it converts the CSV data.
 *
 * @alpha
 */
export interface ICsvColumnType {
    name?: string;
    type?: string;
    nullable?: boolean;
}

/**
 * Options that control how the backend converts values of CSV columns.
 *
 * @alpha
 */
export interface ICsvConvertOptions {
    autoDictEncode?: boolean;
    autoDictMaxCardinality?: number;
    checkUtf8?: boolean;
    columnTypes?: ICsvColumnType[];
    decimalPoint?: string;
    falseValues?: string[];
    includeColumns?: string[];
    includeMissingColumns?: boolean;
    nullValues?: string[];
    quotedStringsCanBeNull?: boolean;
    stringsCanBeNull?: boolean;
    timestampParsers?: string[];
    trueValues?: string[];
}

/**
 * Options that control how the backend parses a CSV file.
 *
 * @alpha
 */
export interface ICsvParseOptions {
    delimiter?: string;
    doubleQuote?: boolean;
    /**
     * Escape character, or `false` when the file does not use escaping.
     */
    escapeChar?: string | false;
    ignoreEmptyLines?: boolean;
    newlinesInValues?: boolean;
    /**
     * Quote character, or `false` when the file does not use quoting.
     */
    quoteChar?: string | false;
}

/**
 * Options that control how the backend reads a CSV file.
 *
 * @alpha
 */
export interface ICsvReadOptions {
    autoGenerateColumnNames?: boolean;
    blockSize?: number;
    columnNames?: string[];
    encoding?: string;
    skipRows?: number;
    skipRowsAfterNames?: number;
    useThreads?: boolean;
}

/**
 * Options that the backend uses to read, parse and convert a CSV file.
 *
 * @alpha
 */
export interface ICsvFileConfig {
    convertOptions?: ICsvConvertOptions;
    parseOptions?: ICsvParseOptions;
    readOptions?: ICsvReadOptions;
}

/**
 * Request to analyze a CSV file that is uploaded to the staging area.
 *
 * @alpha
 */
export interface ICsvAnalysisRequest {
    /**
     * Location of the uploaded file, as returned by the upload.
     */
    location: string;
    config?: {
        delimiters?: string[];
        headerDetectMaxRows?: number;
        /**
         * Number of header rows. When not set, the backend detects the header.
         */
        headerRowCount?: number;
        /**
         * Number of rows to return in the preview data.
         */
        resultRows?: number;
    };
}

/**
 * Column of an analyzed CSV file.
 *
 * @alpha
 */
export interface ICsvAnalysisColumn {
    name: string;
    /**
     * Data type that the backend detected for the column.
     */
    type: string;
    detectedDateFormats?: string[];
}

/**
 * Result of a CSV file analysis.
 *
 * @alpha
 */
export interface ICsvAnalysis {
    location: string;
    columns: ICsvAnalysisColumn[];
    /**
     * Options that the backend detected for the file. Use them to import the file.
     */
    config?: ICsvFileConfig;
    /**
     * First rows of the file.
     */
    previewData: unknown[][];
}

/**
 * Table to create from a CSV file that is uploaded to the staging area.
 *
 * @alpha
 */
export interface ICsvImportTable {
    /**
     * Name of the table in the data source.
     */
    name: string;
    source: {
        /**
         * Location of the uploaded file, as returned by the upload.
         */
        location: string;
        config: ICsvFileConfig & {
            /**
             * Date format of each date column, by column name.
             */
            columnDateFormats?: Record<string, string>;
        };
    };
}

/**
 * Table that the backend created or updated from a CSV file.
 *
 * @alpha
 */
export interface ICsvImportResult {
    name: string;
    version: number;
}

/**
 * Options that the backend used when it imported a CSV file into a data source.
 *
 * @alpha
 */
export interface ICsvFileManifest {
    /**
     * Name of the file in the data source.
     */
    name: string;
    version: number;
    readMethod?: string;
    readOptions?: ICsvReadOptions;
    parseOptions?: ICsvParseOptions;
    convertOptions?: ICsvConvertOptions;
    /**
     * Date format of each date column, by column name.
     */
    columnDateFormats?: Record<string, string>;
}

/**
 * SPSS (.sav) file in the staging area to analyze.
 *
 * @alpha
 */
export interface ISavAnalysisRequest {
    /**
     * Location of the uploaded file, as returned by the upload.
     */
    location: string;
    config?: {
        /**
         * Number of rows in the preview data.
         */
        resultRows?: number;
    };
}

/**
 * Label of one value of an SPSS column.
 *
 * @alpha
 */
export interface ISavValueLabel {
    value: unknown;
    label: string;
}

/**
 * Column of an analyzed SPSS (.sav) file.
 *
 * @alpha
 */
export interface ISavAnalysisColumn {
    name: string;
    /**
     * Arrow type name of the column, for example "float64" or "date32[day]".
     */
    type: string;
    label?: string;
    valueLabels?: ISavValueLabel[];
}

/**
 * Result of the analysis of an SPSS (.sav) file.
 *
 * @alpha
 */
export interface ISavAnalysis {
    location: string;
    columns: ISavAnalysisColumn[];
    previewData: unknown[][];
}

/**
 * Table to create or update from an SPSS (.sav) file.
 *
 * @alpha
 */
export interface ISavImportTable {
    /**
     * Name of the table in the data source.
     */
    name: string;
    source: {
        /**
         * Location of the uploaded file, as returned by the upload.
         */
        location: string;
    };
}

/**
 * Table that the backend created or updated from an SPSS (.sav) file.
 *
 * @alpha
 */
export interface ISavImportResult {
    name: string;
    version: number;
}
