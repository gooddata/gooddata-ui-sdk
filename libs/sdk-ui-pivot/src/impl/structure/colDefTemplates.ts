// (C) 2007-2021 GoodData Corporation
import { ColDef, ValueFormatterParams } from "@ag-grid-community/all-modules";
import { TableFacade } from "../tableFacade";
import { ICorePivotTableProps } from "../../publicTypes";
import { headerClassFactory } from "./colDefHeaderClass";
import { AVAILABLE_TOTALS } from "../base/constants";
import { getMeasureCellFormattedValue, getMeasureCellStyle } from "../cell/cellUtils";
import cx from "classnames";
import { invariant } from "ts-invariant";
import { isSeriesCol } from "./tableDescriptorTypes";
import { cellClassFactory } from "../cell/cellClass";
import { createCellRenderer } from "../cell/cellRenderer";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate";
import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";
import { IGridRow } from "../data/resultTypes";

export function rowAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer();

    return {
        cellClass: cellClassFactory(table, props, "gd-row-attribute-column"),
        headerClass: headerClassFactory(table, props, "gd-row-attribute-column-header"),
        colSpan: (params) => {
            if (
                // params.data is undefined when rows are in loading state
                params.data &&
                params.data.colSpan &&
                AVAILABLE_TOTALS.find((item: string) => item === params.data[params.data.colSpan.headerKey])
            ) {
                return params.data.colSpan.count;
            }
            return 1;
        },
        valueFormatter: (params: ValueFormatterParams) => {
            const colDesc = table.tableDescriptor.getCol(params.colDef);
            const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);
            const dv = table.getDrillDataContext();
            const row: IGridRow = params.data;
            const drillCheck = colDesc && row && row[colDesc.id];
            const isDrillable = drillCheck ? isCellDrillable(colDesc, row, dv, drillablePredicates) : false;

            return params.value === undefined
                ? null
                : isDrillable && props.drillableItemDecorator
                ? props.drillableItemDecorator(params.value)
                : params.value;
        },
        cellRenderer,
    };
}

export function columnAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    return {
        cellClass: cellClassFactory(table, props, "gd-column-attribute-column"),
        headerClass: headerClassFactory(table, props, "gd-column-attribute-column-header"),
    };
}

const AG_NUMERIC_CELL_CLASSNAME = "ag-numeric-cell";
const AG_NUMERIC_HEADER_CLASSNAME = "ag-numeric-header";

export function measureColumnTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer();
    const separators = props.config?.separators;

    return {
        cellClass: cellClassFactory(table, props, cx(AG_NUMERIC_CELL_CLASSNAME, "gd-measure-column")),
        headerClass: headerClassFactory(
            table,
            props,
            cx(AG_NUMERIC_HEADER_CLASSNAME, "gd-measure-column-header"),
        ),
        // wrong params type from ag-grid, we need any
        valueFormatter: (params: ValueFormatterParams) => {
            const colDesc = table.tableDescriptor.getCol(params.colDef);

            invariant(isSeriesCol(colDesc));

            const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);
            const dv = table.getDrillDataContext();
            const row: IGridRow = params.data;
            const hasDrillableHeader = isCellDrillable(colDesc, row, dv, drillablePredicates);

            return params.value !== undefined
                ? getMeasureCellFormattedValue(
                      params.value,
                      colDesc.seriesDescriptor.measureFormat(),
                      separators,
                      hasDrillableHeader,
                      props.drillableItemDecorator,
                  )
                : (null as any);
        },
        cellStyle: (params) => {
            const colDesc = table.tableDescriptor.getCol(params.colDef);

            invariant(isSeriesCol(colDesc));

            return params.value !== undefined
                ? getMeasureCellStyle(
                      params.value,
                      colDesc.seriesDescriptor.measureFormat(),
                      separators,
                      true,
                  )
                : null;
        },
        cellRenderer,
    };
}
