// (C) 2026 GoodData Corporation

import {
    type DeclarativeColumnDataType,
    type DeclarativeLabelValueType,
} from "../ldm/declarativeModel/index.js";

/**
 * Physical data model of a data source: its tables and their columns.
 *
 * @alpha
 */
export interface IPhysicalDataModel {
    tables: IPhysicalTable[];
}

/**
 * Table or view of a data source.
 *
 * @alpha
 */
export interface IPhysicalTable {
    columns: IPhysicalColumn[];
    id: string;
    namePrefix?: string;
    /**
     * Path to the table, for example the schema and the table name.
     */
    path: string[];
    /**
     * Type of the table, for example TABLE or VIEW.
     */
    type: string;
}

/**
 * Column of a data source table.
 *
 * @alpha
 */
export interface IPhysicalColumn {
    dataType: DeclarativeColumnDataType;
    /**
     * Name of the column whose values this column labels.
     * Logical model generation makes this column the default label of the attribute on that column.
     */
    defaultLabelOf?: string;
    description?: string;
    isNullable?: boolean;
    isPrimaryKey?: boolean;
    name: string;
    nullValue?: string;
    referencedTableColumn?: string;
    referencedTableId?: string;
}

/**
 * Options of a data source scan.
 *
 * @alpha
 */
export interface IDataSourceScanRequest {
    scanTables: boolean;
    scanViews: boolean;
    /**
     * Schemata to scan. When not set, the backend scans the schema of the data source.
     */
    schemata?: string[];
    /**
     * Separator of the parts of table and column names that the backend uses to detect LDM objects.
     */
    separator: string;
    tablePrefix?: string;
    viewPrefix?: string;
}

/**
 * Result of a data source scan.
 *
 * @alpha
 */
export interface IDataSourceScanResult {
    pdm: IPhysicalDataModel;
    warnings: IDataSourceScanTableWarning[];
}

/**
 * Problem with a table that the scan found.
 *
 * @alpha
 */
export interface IDataSourceScanTableWarning {
    columns: IDataSourceScanColumnWarning[];
    message?: string;
    name: string;
}

/**
 * Problem with a column that the scan found.
 *
 * @alpha
 */
export interface IDataSourceScanColumnWarning {
    message: string;
    name: string;
}

/**
 * Result of an SQL statement scan.
 *
 * @alpha
 */
export interface ISqlScanResult {
    columns: ISqlScanColumn[];
    /**
     * First rows of the result of the statement.
     */
    dataPreview?: (string | null)[][];
}

/**
 * Column of the result of an SQL statement.
 *
 * @alpha
 */
export interface ISqlScanColumn {
    dataType: DeclarativeColumnDataType;
    description?: string;
    name: string;
    nullValue?: string;
}

/**
 * Options of the logical data model generation from a data source.
 *
 * @remarks
 * The prefixes and the separator tell the backend how to detect LDM objects from table and column names.
 *
 * @alpha
 */
export interface IGenerateLogicalModelRequest {
    aggregatedFactPrefix?: string;
    dateGranularities?: string;
    dateReferencePrefix?: string;
    denormPrefix?: string;
    factPrefix?: string;
    generateLongIds?: boolean;
    grainMultivalueReferencePrefix?: string;
    grainPrefix?: string;
    grainReferencePrefix?: string;
    multivalueReferencePrefix?: string;
    /**
     * Physical data model to generate the logical data model from. When not set, the backend scans the data source.
     */
    pdm?: IGenerateLogicalModelPdm;
    primaryLabelPrefix?: string;
    referencePrefix?: string;
    secondaryLabelPrefix?: string;
    separator?: string;
    tablePrefix?: string;
    translationPrefix?: string;
    viewPrefix?: string;
    wdfPrefix?: string;
    /**
     * Workspace whose logical data model the backend uses to keep the existing identifiers.
     */
    workspaceId?: string;
}

/**
 * Physical data model that the logical data model generation uses.
 *
 * @alpha
 */
export interface IGenerateLogicalModelPdm {
    sqls?: IGenerateLogicalModelSql[];
    tableOverrides?: IGenerateLogicalModelTableOverride[];
    tables?: IPhysicalTable[];
}

/**
 * SQL statement that the logical data model generation makes a dataset from.
 *
 * @alpha
 */
export interface IGenerateLogicalModelSql {
    columns?: IGenerateLogicalModelSqlColumn[];
    statement: string;
    title: string;
}

/**
 * Column of an SQL statement that the logical data model generation uses.
 *
 * @alpha
 */
export interface IGenerateLogicalModelSqlColumn {
    dataType: DeclarativeColumnDataType;
    name: string;
    nullValue?: string;
}

/**
 * Change of the LDM object types that the generation detects for the columns of a table.
 *
 * @alpha
 */
export interface IGenerateLogicalModelTableOverride {
    columns: IGenerateLogicalModelColumnOverride[];
    path: string[];
}

/**
 * Change of the LDM object type that the generation detects for a column.
 *
 * @alpha
 */
export interface IGenerateLogicalModelColumnOverride {
    labelTargetColumn?: string;
    labelType?: DeclarativeLabelValueType;
    ldmTypeOverride?: "FACT" | "LABEL";
    name: string;
}
