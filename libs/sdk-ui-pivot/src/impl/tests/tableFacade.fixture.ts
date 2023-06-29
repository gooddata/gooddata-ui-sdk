// (C) 2007-2021 GoodData Corporation
import { DataViewFacade, getIntl } from "@gooddata/sdk-ui";
import { flatMap, noop } from "lodash";
import { TableConfigAccessors, TableDataCallbacks, TableLegacyCallbacks } from "../privateTypes.js";
import { TableFacadeInitializer } from "../tableFacadeInitializer.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { invariant } from "ts-invariant";
import { TableFacade } from "../tableFacade.js";

const TestTableDataCallbacks: TableDataCallbacks = {
    onError: noop,
    onExportReady: noop,
    onLoadingChanged: noop,
    onPageLoaded: noop,
    onExecutionTransformed: noop,
};

const TestTableLegacyCallbacks: TableLegacyCallbacks = {
    pushData: noop,
};

function createTestConfigAccessors(dv: DataViewFacade): TableConfigAccessors {
    return {
        hasColumnWidths: false,
        getExecutionDefinition: () => dv.definition,
        getColumnTotals: () => flatMap(dv.definition.dimensions, (dim) => dim.totals ?? []),
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
            onColumnResized: noop,
            widths: undefined,
            containerRef: undefined,
            separators: undefined,
        }),
    };
}

function createTestPivotTableProps(dv: DataViewFacade): ICorePivotTableProps {
    return {
        execution: dv.result().transform(),
        intl: getIntl(),
        afterRender: noop,
        onColumnResized: noop,
        onDrill: noop,
        onError: noop,
        onExportReady: noop,
        onLoadingChanged: noop,
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

    return new TableFacadeInitializer(dv.result().transform(), testTableMethods, testProps)
        .initialize()
        .then((res) => {
            invariant(res);

            return [res.table, testProps];
        });
}
