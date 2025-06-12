// (C) 2007-2025 GoodData Corporation
import cx from "classnames";
import { DataValue, ISeparators, isResultTotalHeader } from "@gooddata/sdk-model";
import { CellStyle, ColDef } from "ag-grid-community";
import { ClientFormatterFacade, IFormattedResult } from "@gooddata/number-formatter";
import { AnyCol, isMixedValuesCol, isScopeCol } from "../structure/tableDescriptorTypes.js";
import { IGridRow } from "../data/resultTypes.js";
import { ColumnHeadersPosition } from "src/publicTypes.js";
import { COLUMN_TOTAL, COLUMN_SUBTOTAL } from "../base/constants.js";

export interface ITableCellStyle {
    backgroundColor?: string;
    color?: string;
    fontWeight?: React.CSSProperties["fontWeight"];
}

function getFormattedNumber(value: DataValue, format?: string, separators?: ISeparators): IFormattedResult {
    const parsedNumber = ClientFormatterFacade.convertValue(value);
    return ClientFormatterFacade.formatValue(parsedNumber, format, separators);
}

// TODO: move to cell class; refactor tests
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
    value: DataValue,
    format: string,
    separators: ISeparators | undefined,
): string {
    const { formattedValue } = getFormattedNumber(value, format, separators);

    return formattedValue === "" ? "–" : formattedValue;
}

export function getMeasureCellStyle(
    value: DataValue,
    format: string,
    separators: ISeparators | undefined,
    applyColor: boolean,
): CellStyle {
    const { formattedValue, colors } = getFormattedNumber(value, format, separators);
    const color = colors.color;
    const backgroundColor = colors.backgroundColor;

    const measureCellDefault = {
        textAlign: "right",
    };

    if (formattedValue === "") {
        return {
            ...measureCellDefault,
            color: "var(--gd-table-nullValueColor, var(--gd-palette-complementary-6, #94a1ad))",
            fontWeight: "bold",
        };
    }

    if (!applyColor) {
        return {
            ...measureCellDefault,
        };
    }

    return {
        ...measureCellDefault,
        ...(color && { color }),
        ...(backgroundColor && { backgroundColor }),
    };
}

export function getColumnTotalOrSubTotalInfo(
    colDef: ColDef,
    col: AnyCol,
    row: IGridRow,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
) {
    if (columnHeadersPosition === "left" && isTransposed) {
        if (Object.keys(row.headerItemMap).length > 0) {
            return {
                isColumnTotal:
                    isMixedValuesCol(col) &&
                    isResultTotalHeader(row.headerItemMap[col.id]) &&
                    col.isTotal === true,
                isColumnSubtotal:
                    isMixedValuesCol(col) &&
                    isResultTotalHeader(row.headerItemMap[col.id]) &&
                    col.isSubtotal === true,
            };
        } else {
            return {
                isColumnTotal: isMixedValuesCol(col) && col.isTotal === true,
                isColumnSubtotal: isMixedValuesCol(col) && col.isSubtotal === true,
            };
        }
    } else if (isTransposed) {
        return {
            isColumnTotal: isScopeCol(col) && col.isTotal === true,
            isColumnSubtotal: isScopeCol(col) && col.isSubtotal === true,
        };
    } else {
        return {
            isColumnTotal: colDef.type === COLUMN_TOTAL,
            isColumnSubtotal: colDef.type === COLUMN_SUBTOTAL,
        };
    }
}
