// (C) 2021-2024 GoodData Corporation

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
    | "MARIADB";

/**
 * @alpha
 */
export interface IDataSourceIdentifierDescriptor {
    id: string;
    name: string;
    schema: string;
    type: DataSourceType;
}
