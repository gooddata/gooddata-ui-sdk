// (C) 2021-2025 GoodData Corporation

/**
 * @alpha
 */
export type DataSourceType =
    | "POSTGRESQL"
    | "REDSHIFT"
    | "VERTICA"
    | "SNOWFLAKE"
    | "ADS"
    | "BIGQUERY"
    | "MSSQL"
    | "PRESTO"
    | "DREMIO"
    | "DRILL"
    | "GREENPLUM"
    | "AZURESQL"
    | "SYNAPSESQL"
    | "DATABRICKS"
    | "GDSTORAGE"
    | "CLICKHOUSE"
    | "MYSQL"
    | "MARIADB"
    | "ORACLE"
    | "PINOT"
    | "STARROCKS"
    | "ATHENA"
    | "SINGLESTORE"
    | "MOTHERDUCK"
    | "MONGODB"
    | "FLEXCONNECT";

/**
 * @alpha
 */
export interface IDataSourceIdentifierDescriptor {
    id: string;
    name: string;
    schema: string;
    type: DataSourceType;
}
