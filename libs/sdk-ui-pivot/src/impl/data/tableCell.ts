// (C) 2007-2021 GoodData Corporation
import cx from "classnames";
import { colors2Object, ISeparators, numberFormat } from "@gooddata/numberjs";

import { ITableCellStyle, MeasureCell } from "../../types";
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import escape from "lodash/escape";
import { VALUE_CLASS } from "../base/constants";
import { isSomeTotal } from "./dataSourceUtils";
import { IGridTotalsRow } from "./resultTypes";
import { agColId } from "../structure/tableDescriptorTypes";

function getFormattedNumber(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
): string {
    const parsedNumber: string | number =
        cellContent === null ? "" : typeof cellContent === "string" ? parseFloat(cellContent) : cellContent;

    return numberFormat(parsedNumber, format, undefined, separators);
}

function hasTotalForCurrentColumn(params: ICellRendererParams): boolean {
    const row = params.data as IGridTotalsRow;

    if (!row || !row.calculatedForColumns) {
        return false;
    }

    const colId = agColId(params.colDef);

    return row.calculatedForColumns.some((col) => col === colId);
}

export function getCellClassNames(rowIndex: number, columnIndex: number, isDrillable: boolean): string {
    return cx(
        {
            "gd-cell-drillable": isDrillable,
        },
        "gd-cell",
        `s-cell-${rowIndex}-${columnIndex}`,
        "s-table-cell",
    );
}

export function getMeasureCellFormattedValue(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
): string {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { label } = colors2Object(formattedNumber);

    return label === "" ? "–" : label;
}

export function getMeasureCellStyle(
    cellContent: MeasureCell,
    format: string,
    separators: ISeparators | undefined,
    applyColor: boolean,
): ITableCellStyle {
    const formattedNumber = getFormattedNumber(cellContent, format, separators);
    const { backgroundColor, color, label } = colors2Object(formattedNumber);

    if (label === "") {
        return {
            color: "#94a1ad",
            fontWeight: "bold",
        };
    }

    if (!applyColor) {
        return {};
    }

    return {
        ...(color && { color }),
        ...(backgroundColor && { backgroundColor }),
    };
}

/**
 * Returns common implementation of cell renderer used for normal cells, sticky header cells and totals.
 *
 * TODO: Consider to use custom pinnerRowCellRenderer in order to reduce number of conditionals
 */
export function createCellRenderer(): (params: ICellRendererParams) => string {
    return (params: ICellRendererParams): string => {
        const isRowTotalOrSubtotal = isSomeTotal(params.data?.type);
        const isActiveRowTotal = isRowTotalOrSubtotal && hasTotalForCurrentColumn(params);
        const formattedValue =
            isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
                ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
                : escape(params.formatValue(params.value));
        const className = params.node.rowPinned === "top" ? "gd-sticky-header-value" : VALUE_CLASS;

        return `<span class="${className}">${formattedValue || ""}</span>`;
    };
}
