// (C) 2007-2022 GoodData Corporation
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
import { IMeasureDescriptor } from '@gooddata/sdk-model';
import ColumnTotalHeader from "./headers/ColumnTotalHeader";

export function rowAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer();

    return {
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

// TODO remove sonar warning, update template implementation
// eslint-disable-next-line sonarjs/no-identical-functions
export function rowMeasureTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer();

    return {
        cellClass: cellClassFactory(table, props, "gd-row-attribute-column"), // TODO unique style
        headerClass: headerClassFactory(table, props, "gd-row-attribute-column-header"), // TODO unique style
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

// TODO revert these changes and create a new column type that will have all these changes
export function columnAttributeTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const separators = props.config?.separators;
    const cellRenderer = createCellRenderer();

    return {
        cellClass: cellClassFactory(table, props, "gd-column-attribute-column"),
        headerClass: headerClassFactory(table, props, "gd-column-attribute-column-header"),
        valueFormatter: (params: ValueFormatterParams) => {
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


// TODO remove sonar warning, update template implementation
// eslint-disable-next-line sonarjs/no-identical-functions
export function columnAttributeAndMeasuresHeadersTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const cellRenderer = createCellRenderer();

    return {
        cellClass: cellClassFactory(table, props, "gd-row-attribute-column-header gd-transposed-header"), // TODO unique style
        headerClass: headerClassFactory(table, props, "gd-row-attribute-column-header"), // TODO unique style
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

// TODO remove sonar warning, update template implementation
// eslint-disable-next-line sonarjs/no-identical-functions
export function columnAttributeAndMeasuresValuesTemplate(table: TableFacade, props: Readonly<ICorePivotTableProps>): ColDef {
    const separators = props.config?.separators;
    const cellRenderer = createCellRenderer();

    return {
        cellClass: cellClassFactory(table, props, "gd-column-attribute-column"),   // TODO unique styles
        headerClass: headerClassFactory(table, props, "gd-column-attribute-column-header"), // TODO unique styles
        valueFormatter: (params: ValueFormatterParams) => {
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
    const cellRenderer = createCellRenderer();
    const separators = props.config?.separators;

    return {
        headerComponent: ColumnTotalHeader,
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
