// (C) 2026 GoodData Corporation

import {
    type ScanApiSqlColumn,
    type ScanModelDeclarativeColumn,
    type ScanModelDeclarativeTable,
    type ScanResultPdm,
    type ScanSqlResponse,
    type TableWarning,
} from "@gooddata/api-client-tiger";
import {
    type IDataSourceScanResult,
    type IDataSourceScanTableWarning,
    type IPhysicalColumn,
    type IPhysicalTable,
    type ISqlScanColumn,
    type ISqlScanResult,
} from "@gooddata/sdk-model";

import { assertAllFieldsMapped, mapArray, withoutUndefined } from "../shared/declarativeFields.js";

export function convertScanResult(result: ScanResultPdm): IDataSourceScanResult {
    const { pdm, warnings, ...unmapped } = result;
    assertAllFieldsMapped(unmapped);
    const { tables, ...unmappedPdm } = pdm;
    assertAllFieldsMapped(unmappedPdm);
    return {
        pdm: { tables: tables.map(convertPhysicalTable) },
        warnings: mapArray(warnings, convertTableWarning) ?? [],
    };
}

function convertPhysicalTable(table: ScanModelDeclarativeTable): IPhysicalTable {
    const { columns, id, namePrefix, path, type, ...unmapped } = table;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        columns: columns.map(convertPhysicalColumn),
        id,
        namePrefix,
        path: [...path],
        type,
    });
}

function convertPhysicalColumn(column: ScanModelDeclarativeColumn): IPhysicalColumn {
    const {
        dataType,
        defaultLabelOf,
        description,
        isNullable,
        isPrimaryKey,
        name,
        nullValue,
        referencedTableColumn,
        referencedTableId,
        ...unmapped
    } = column;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        dataType,
        defaultLabelOf,
        description,
        isNullable,
        isPrimaryKey,
        name,
        nullValue,
        referencedTableColumn,
        referencedTableId,
    });
}

function convertTableWarning(warning: TableWarning): IDataSourceScanTableWarning {
    const { columns, message, name, ...unmapped } = warning;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        columns: columns.map(({ message, name, ...rest }) => {
            assertAllFieldsMapped(rest);
            return { message, name };
        }),
        message,
        name,
    });
}

export function convertSqlScanResult(result: ScanSqlResponse): ISqlScanResult {
    const { columns, dataPreview, ...unmapped } = result;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        columns: columns.map(convertSqlColumn),
        dataPreview: mapArray(dataPreview, (row) => [...row]),
    });
}

function convertSqlColumn(column: ScanApiSqlColumn): ISqlScanColumn {
    const { dataType, description, name, nullValue, ...unmapped } = column;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({ dataType, description, name, nullValue });
}
