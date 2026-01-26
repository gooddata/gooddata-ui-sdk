// (C) 2025-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

// Scan Model API - Export scan model ActionsApi functions with ScanModelApi_ prefix
export {
    ActionsApi_ScanDataSource as ScanModelApi_ScanDataSource,
    type ActionsApiScanDataSourceRequest as ScanModelApiScanDataSourceRequest,
    ActionsApi_ScanSql as ScanModelApi_ScanSql,
    type ActionsApiScanSqlRequest as ScanModelApiScanSqlRequest,
    ActionsApi_TestDataSource as ScanModelApi_TestDataSource,
    type ActionsApiTestDataSourceRequest as ScanModelApiTestDataSourceRequest,
    ActionsApi_TestDataSourceDefinition as ScanModelApi_TestDataSourceDefinition,
    type ActionsApiTestDataSourceDefinitionRequest as ScanModelApiTestDataSourceDefinitionRequest,
    ActionsApi_GetDataSourceSchemata as ScanModelApi_GetDataSourceSchemata,
    type ActionsApiGetDataSourceSchemataRequest as ScanModelApiGetDataSourceSchemataRequest,
    ActionsApi_ColumnStatistics as ScanModelApi_ColumnStatistics,
    type ActionsApiColumnStatisticsRequest as ScanModelApiColumnStatisticsRequest,
} from "../../generated/scan-json-api/index.js";
