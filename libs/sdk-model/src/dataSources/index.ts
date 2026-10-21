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
    | "DENODO"
    | "STARROCKS"
    | "ATHENA"
    | "SINGLESTORE"
    | "MOTHERDUCK"
    | "FLEXCONNECT"
    | "AILAKEHOUSE"
    | "TRINO";

/**
 * @alpha
 */
export interface IDataSourceIdentifierDescriptor {
    id: string;
    name: string;
    schema: string;
    type: DataSourceType;
}

/**
 * Permission of the current user to a data source.
 *
 * @alpha
 */
export type DataSourceUserPermission = "MANAGE" | "USE";

/**
 * Strategy that the backend uses to cache results of a data source.
 *
 * @alpha
 */
export type DataSourceCacheStrategy = "ALWAYS" | "NEVER";

/**
 * Determines how the backend interprets date and time values of a data source.
 *
 * @alpha
 */
export type DataSourceDateTimeSemantics = "LOCAL" | "UTC";

/**
 * Method that the backend uses to authenticate to a data source.
 *
 * @alpha
 */
export type DataSourceAuthenticationType =
    | "USERNAME_PASSWORD"
    | "TOKEN"
    | "KEY_PAIR"
    | "CLIENT_SECRET"
    | "OIDC_PASSTHROUGH";

/**
 * Additional connection parameter of a data source.
 *
 * @alpha
 */
export interface IDataSourceParameter {
    name: string;
    value: string;
}

/**
 * Cached results of the data source never expire on their own.
 *
 * @alpha
 */
export interface IDataSourceIndefiniteCacheRetention {
    type: "INDEFINITE";
}

/**
 * Cached results of the data source expire according to a cron schedule.
 *
 * @alpha
 */
export interface IDataSourceScheduleCacheRetention {
    type: "SCHEDULE";
    schedule: {
        cron: string;
        timezone?: string | null;
    };
}

/**
 * Cached results of the data source expire when the validity period elapses.
 *
 * @alpha
 */
export interface IDataSourceValidityPeriodCacheRetention {
    type: "VALIDITY_PERIOD";
    /**
     * ISO-8601 duration, for example `PT1H`.
     */
    validityPeriod: string;
}

/**
 * Determines when the cached results of a data source expire. Narrow it by the `type` property.
 *
 * @alpha
 */
export type DataSourceCacheRetention =
    | IDataSourceIndefiniteCacheRetention
    | IDataSourceScheduleCacheRetention
    | IDataSourceValidityPeriodCacheRetention;

/**
 * Data source with its connection details. Secrets, such as passwords or tokens, are never included.
 *
 * @alpha
 */
export interface IDataSourceDescriptor extends IDataSourceIdentifierDescriptor {
    username?: string;
    clientId?: string;
    url?: string | null;
    permissions?: DataSourceUserPermission[];
    parameters?: IDataSourceParameter[] | null;
    decodedParameters?: IDataSourceParameter[] | null;
    cacheStrategy?: DataSourceCacheStrategy | null;
    cacheRetention?: DataSourceCacheRetention | null;
    authenticationType?: DataSourceAuthenticationType | null;
    dateTimeSemantics?: DataSourceDateTimeSemantics | null;
    /**
     * Identifier of the data source that the backend uses instead of this one.
     */
    alternativeDataSourceId?: string | null;
    disableStatistics?: boolean | null;
    /**
     * Skip the audience check of JWT tokens in the OIDC authentication.
     */
    ignoreJwtAud?: boolean | null;
}

/**
 * Full definition of a data source used to create it or to replace it.
 *
 * @alpha
 */
export interface IDataSourceDefinition {
    id: string;
    name: string;
    schema: string;
    type: DataSourceType;
    url?: string;
    username?: string;
    password?: string;
    token?: string;
    parameters?: IDataSourceParameter[];
    cacheStrategy?: DataSourceCacheStrategy;
    /**
     * Use `null` to remove the cache retention policy of the data source.
     */
    cacheRetention?: DataSourceCacheRetention | null;
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
    dateTimeSemantics?: DataSourceDateTimeSemantics | null;
    authenticationType?: DataSourceAuthenticationType | null;
    /**
     * Identifier of the data source that the backend uses instead of this one.
     */
    alternativeDataSourceId?: string | null;
    disableStatistics?: boolean | null;
    /**
     * Skip the audience check of JWT tokens in the OIDC authentication.
     */
    ignoreJwtAud?: boolean | null;
}

/**
 * Partial update of a data source. Properties that are `undefined` keep their current value.
 * Use `null` to remove a value.
 *
 * @alpha
 */
export interface IDataSourcePatch {
    id: string;
    name?: string;
    schema?: string;
    type?: DataSourceType;
    url?: string | null;
    username?: string | null;
    password?: string | null;
    token?: string | null;
    parameters?: IDataSourceParameter[] | null;
    cacheStrategy?: DataSourceCacheStrategy | null;
    cacheRetention?: DataSourceCacheRetention | null;
    privateKey?: string | null;
    privateKeyPassphrase?: string | null;
    clientId?: string | null;
    clientSecret?: string | null;
    dateTimeSemantics?: DataSourceDateTimeSemantics | null;
    authenticationType?: DataSourceAuthenticationType | null;
    /**
     * Identifier of the data source that the backend uses instead of this one.
     */
    alternativeDataSourceId?: string | null;
    disableStatistics?: boolean | null;
    /**
     * Skip the audience check of JWT tokens in the OIDC authentication.
     */
    ignoreJwtAud?: boolean | null;
}

/**
 * Connection details of a data source to test, before or after the data source is saved.
 *
 * @alpha
 */
export interface IDataSourceConnectionTest {
    type: DataSourceType;
    url: string;
    schema: string;
    username?: string;
    password?: string;
    token?: string;
    parameters?: IDataSourceParameter[];
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
    authenticationType?: DataSourceAuthenticationType | null;
}

/**
 * Result of a data source connection test.
 *
 * @alpha
 */
export interface IDataSourceConnectionTestResult {
    successful: boolean;
    /**
     * Reason of the failure, when the test is not successful.
     */
    error?: string;
}
