// (C) 2026 GoodData Corporation

import {
    type ColumnOverride,
    type DeclarativeColumn,
    type DeclarativeTable,
    type GenerateLdmRequest,
    type PdmLdmRequest,
    type PdmSql,
    type ScanRequest,
    type TableOverride,
} from "@gooddata/api-client-tiger";
import {
    type IDataSourceScanRequest,
    type IGenerateLogicalModelColumnOverride,
    type IGenerateLogicalModelPdm,
    type IGenerateLogicalModelRequest,
    type IGenerateLogicalModelSql,
    type IGenerateLogicalModelTableOverride,
    type IPhysicalColumn,
    type IPhysicalTable,
} from "@gooddata/sdk-model";

import { assertAllFieldsMapped, copyArray, mapArray, withoutUndefined } from "../shared/declarativeFields.js";

export function convertScanRequest(request: IDataSourceScanRequest): ScanRequest {
    const { scanTables, scanViews, schemata, separator, tablePrefix, viewPrefix, ...unmapped } = request;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        scanTables,
        scanViews,
        schemata: copyArray(schemata),
        separator,
        tablePrefix,
        viewPrefix,
    });
}

export function convertGenerateLogicalModelRequest(
    request: IGenerateLogicalModelRequest,
): GenerateLdmRequest {
    const {
        aggregatedFactPrefix,
        dateGranularities,
        dateReferencePrefix,
        denormPrefix,
        factPrefix,
        generateLongIds,
        grainMultivalueReferencePrefix,
        grainPrefix,
        grainReferencePrefix,
        multivalueReferencePrefix,
        pdm,
        primaryLabelPrefix,
        referencePrefix,
        secondaryLabelPrefix,
        separator,
        tablePrefix,
        translationPrefix,
        viewPrefix,
        wdfPrefix,
        workspaceId,
        ...unmapped
    } = request;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        aggregatedFactPrefix,
        dateGranularities,
        dateReferencePrefix,
        denormPrefix,
        factPrefix,
        generateLongIds,
        grainMultivalueReferencePrefix,
        grainPrefix,
        grainReferencePrefix,
        multivalueReferencePrefix,
        pdm: pdm && convertPdm(pdm),
        primaryLabelPrefix,
        referencePrefix,
        secondaryLabelPrefix,
        separator,
        tablePrefix,
        translationPrefix,
        viewPrefix,
        wdfPrefix,
        workspaceId,
    });
}

function convertPdm(pdm: IGenerateLogicalModelPdm): PdmLdmRequest {
    const { sqls, tableOverrides, tables, ...unmapped } = pdm;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        sqls: mapArray(sqls, convertSql),
        tableOverrides: mapArray(tableOverrides, convertTableOverride),
        tables: mapArray(tables, convertTable),
    });
}

function convertSql(sql: IGenerateLogicalModelSql): PdmSql {
    const { columns, statement, title, ...unmapped } = sql;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        columns: mapArray(columns, ({ dataType, name, nullValue, ...rest }) => {
            assertAllFieldsMapped(rest);
            return withoutUndefined({ dataType, name, nullValue });
        }),
        statement,
        title,
    });
}

function convertTableOverride(override: IGenerateLogicalModelTableOverride): TableOverride {
    const { columns, path, ...unmapped } = override;
    assertAllFieldsMapped(unmapped);
    return { columns: columns.map(convertColumnOverride), path: [...path] };
}

function convertColumnOverride(override: IGenerateLogicalModelColumnOverride): ColumnOverride {
    const { labelTargetColumn, labelType, ldmTypeOverride, name, ...unmapped } = override;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({ labelTargetColumn, labelType, ldmTypeOverride, name });
}

function convertTable(table: IPhysicalTable): DeclarativeTable {
    const { columns, id, namePrefix, path, type, ...unmapped } = table;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        columns: columns.map(convertColumn),
        id,
        namePrefix,
        path: [...path],
        type,
    });
}

function convertColumn(column: IPhysicalColumn): DeclarativeColumn {
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
