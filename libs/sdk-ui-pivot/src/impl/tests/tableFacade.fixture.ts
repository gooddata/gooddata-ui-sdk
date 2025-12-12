// (C) 2007-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, type DataViewFacade, getIntl } from "@gooddata/sdk-ui";

import { type ICorePivotTableProps } from "../../publicTypes.js";
import {
    type TableConfigAccessors,
    type TableDataCallbacks,
    type TableLegacyCallbacks,
} from "../privateTypes.js";
import { type TableFacade } from "../tableFacade.js";
import { TableFacadeInitializer } from "../tableFacadeInitializer.js";

const TestTableDataCallbacks: TableDataCallbacks = {
    onError: () => {},
    onExportReady: () => {},
    onLoadingChanged: () => {},
    onPageLoaded: () => {},
    onExecutionTransformed: () => {},
};

const TestTableLegacyCallbacks: TableLegacyCallbacks = {
    pushData: () => {},
};

function createTestConfigAccessors(dv: DataViewFacade): TableConfigAccessors {
    return {
        hasColumnWidths: false,
        getExecutionDefinition: () => dv.definition,
        getColumnTotals: () => dv.definition.dimensions.flatMap((dim) => dim.totals ?? []),
        getRowTotals: () => [],
        getGroupRows: () => true,
        getMenuConfig: () => ({}),
        getResizingConfig: () => ({
            columnAutoresizeOption: "unset",
            growToFit: false,
            clientWidth: 666,
            defaultWidth: 666,
            isAltKeyPressed: false,
            isMetaOrCtrlKeyPressed: false,
            onColumnResized: () => {},
            widths: undefined,
            containerRef: undefined,
            separators: undefined,
        }),
        getMeasureGroupDimension: () => "columns",
        getColumnHeadersPosition: () => "top",
    } as unknown as TableConfigAccessors;
}

function createTestPivotTableProps(dv: DataViewFacade): ICorePivotTableProps {
    return {
        execution: dv.result().transform(),
        intl: getIntl(DEFAULT_LANGUAGE, DEFAULT_MESSAGES[DEFAULT_LANGUAGE]),
        afterRender: () => {},
        onColumnResized: () => {},
        onDrill: () => {},
        onError: () => {},
        onExportReady: () => {},
        onLoadingChanged: () => {},
        pageSize: 100,
    };
}

export async function createTestTableFacade(
    dv: DataViewFacade,
): Promise<[TableFacade, Readonly<ICorePivotTableProps>]> {
    const testTableMethods: TableDataCallbacks & TableConfigAccessors & TableLegacyCallbacks = {
        ...TestTableDataCallbacks,
        ...TestTableLegacyCallbacks,
        ...createTestConfigAccessors(dv),
    };

    const testProps = createTestPivotTableProps(dv);

    return new TableFacadeInitializer(
        dv.result().transform(),
        testTableMethods,
        testProps,
        () => new AbortController(),
    )
        .initialize()
        .then((res) => {
            invariant(res);

            return [res.table, testProps];
        });
}
