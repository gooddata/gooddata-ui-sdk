// (C) 2007-2025 GoodData Corporation
import { ColDef, ValueFormatterParams } from "ag-grid-community";
import { IMeasureDescriptor, ISeparators } from "@gooddata/sdk-model";
import { TableFacade } from "../tableFacade.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { headerClassFactory } from "./colDefHeaderClass.js";
import { AVAILABLE_TOTALS } from "../base/constants.js";
import { getMeasureCellFormattedValue, getMeasureCellStyle } from "../cell/cellUtils.js";
import cx from "classnames";
import { invariant } from "ts-invariant";
import { isSeriesCol } from "./tableDescriptorTypes.js";
import { cellClassFactory } from "../cell/cellClass.js";
import { createCellRenderer } from "../cell/cellRenderer.js";
import ColumnTotalHeader from "./headers/ColumnTotalHeader.js";
import MixedValuesColumnHeader from "./headers/MixedValuesColumnHeader.js";

export function rowAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);

    return {
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, "gd-row-attribute-column"),
        headerClass: headerClassFactory(table, props, "gd-row-attribute-column-header"),
        colSpan: (params) => {
            if (
                // params.data is undefined when rows are in loading state
                params.data?.colSpan &&
                AVAILABLE_TOTALS.find((item: string) => item === params.data[params.data.colSpan.headerKey])
            ) {
                return params.data.colSpan.count;
            }
            return 1;
        },
        valueFormatter: (params) => {
            return params.value === undefined ? null : params.value;
        },
        cellRenderer,
    };
}

export function rowMeasureTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);

    return {
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, "gd-row-measure-column"),
        headerClass: headerClassFactory(table, props, "gd-row-measure-header"),
        colSpan: (_params) => {
            return 1;
        },
        valueFormatter: (params) => {
            return params.value === undefined ? null : params.value;
        },
        cellRenderer,
        sortable: false,
    };
}

function potentialRowMeasureFormatter(params: ValueFormatterParams, separators?: ISeparators) {
    if (params.data?.measureDescriptor) {
        const measureDescriptor: IMeasureDescriptor = params.data?.measureDescriptor;

        return params.value !== undefined
            ? getMeasureCellFormattedValue(
                  params.value,
                  measureDescriptor.measureHeaderItem.format,
                  separators,
              )
            : (null as any);
    }
    return params.value === undefined ? null : params.value;
}

export function columnAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const separators = props.config?.separators;
    const cellRenderer = createCellRenderer(table.tableDescriptor);

    return {
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, "gd-column-attribute-column"),
        headerClass: headerClassFactory(table, props, "gd-column-attribute-column-header"),
        valueFormatter: (params: ValueFormatterParams) => {
            return potentialRowMeasureFormatter(params, separators);
        },
        cellStyle: (params) => {
            if (params.data?.measureDescriptor) {
                const measureDescriptor: IMeasureDescriptor = params.data?.measureDescriptor;

                return params.value !== undefined
                    ? getMeasureCellStyle(
                          params.value,
                          measureDescriptor.measureHeaderItem.format,
                          separators,
                          true,
                      )
                    : null;
            }
            return null;
        },
        cellRenderer,
    };
}

export function mixedHeadersTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);

    return {
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, "gd-mixed-headers-column"),
        headerClass: headerClassFactory(table, props, "gd-mixed-headers-column-header"),
        colSpan: (params) => {
            if (
                // params.data is undefined when rows are in loading state
                params.data?.colSpan &&
                AVAILABLE_TOTALS.find((item: string) => item === params.data[params.data.colSpan.headerKey])
            ) {
                return params.data.colSpan.count;
            }
            return 1;
        },
        valueFormatter: (params) => {
            return params.value === undefined ? null : params.value;
        },
        cellRenderer,
    };
}

const AG_NUMERIC_CELL_CLASSNAME = "ag-numeric-cell";
const AG_NUMERIC_HEADER_CLASSNAME = "ag-numeric-header";

export function measureColumnTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);
    const separators = props.config?.separators;

    return {
        suppressSpanHeaderHeight: true,
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

            return params.value !== undefined
                ? getMeasureCellFormattedValue(
                      params.value,
                      colDesc.seriesDescriptor.measureFormat(),
                      separators,
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

export function totalSubTotalColumnTemplate(
    table: TableFacade,
    props: Readonly<ICorePivotTableProps>,
): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);
    const separators = props.config?.separators;

    return {
        headerComponent: ColumnTotalHeader,
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, cx(AG_NUMERIC_CELL_CLASSNAME, "gd-total-column")),
        headerClass: headerClassFactory(table, props, "gd-total-column-header"),
        valueFormatter: (params: ValueFormatterParams) => {
            const colDesc = table.tableDescriptor.getCol(params.colDef);

            invariant(isSeriesCol(colDesc));

            return params.value !== undefined
                ? getMeasureCellFormattedValue(
                      params.value,
                      colDesc.seriesDescriptor.measureFormat(),
                      separators,
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

export function mixedValuesColsTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer(table.tableDescriptor);
    const separators = props.config?.separators;

    return {
        headerComponent: MixedValuesColumnHeader,
        suppressSpanHeaderHeight: true,
        cellClass: cellClassFactory(table, props, cx("gd-mixed-values-column")),
        headerClass: headerClassFactory(table, props, "gd-mixed-values-column-header"),
        valueFormatter: (params: ValueFormatterParams) => {
            return potentialRowMeasureFormatter(params, separators);
        },
        cellStyle: (params) => {
            if (params.data?.measureDescriptor) {
                const measureDescriptor: IMeasureDescriptor = params.data?.measureDescriptor;

                return params.value !== undefined
                    ? getMeasureCellStyle(
                          params.value,
                          measureDescriptor.measureHeaderItem.format,
                          separators,
                          true,
                      )
                    : null;
            }
            return {
                textAlign: "left",
            };
        },
        cellRenderer,
    };
}
