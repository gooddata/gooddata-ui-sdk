// (C) 2021-2026 GoodData Corporation

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
    | "CRATEDB"
    | "MYSQL"
    | "MARIADB"
    | "ORACLE"
    | "PINOT"
    | "STARROCKS"
    | "ATHENA"
    | "SINGLESTORE"
    | "MOTHERDUCK"
    | "MONGODB"
    | "FLEXCONNECT"
    | "AILAKEHOUSE";

/**
 * @alpha
 */
export interface IDataSourceIdentifierDescriptor {
    id: string;
    name: string;
    schema: string;
    type: DataSourceType;
}
