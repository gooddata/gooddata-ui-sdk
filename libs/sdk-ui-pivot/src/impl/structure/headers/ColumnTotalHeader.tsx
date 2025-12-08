// (C) 2023-2025 GoodData Corporation

import { useCallback } from "react";

import { IHeaderParams } from "ag-grid-community";

import { ALIGN_LEFT, ALIGN_RIGHT, HeaderCell, ICommonHeaderParams } from "./HeaderCell.js";
import { IMenu } from "../../../publicTypes.js";
import { isEmptyScopeCol, isSliceCol } from "../tableDescriptorTypes.js";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    menu?: () => IMenu;
}

export function ColumnTotalHeader({
    getTableDescriptor,
    getExecutionDefinition,
    getColumnTotals,
    getRowTotals,
    displayName,
    column,
    intl,
}: IColumnHeaderProps) {
    const getColDescriptor = useCallback(() => {
        return getTableDescriptor().getCol(column);
    }, [column, getTableDescriptor]);

    const col = getColDescriptor();
    const textAlign = isSliceCol(col) || isEmptyScopeCol(col) ? ALIGN_LEFT : ALIGN_RIGHT;

    return (
        <HeaderCell
            className="gd-pivot-table-column-total-header s-pivot-table-column-total-header"
            textAlign={textAlign}
            displayText={displayName}
            enableSorting={false}
            colId={column.getColDef().field}
            getTableDescriptor={getTableDescriptor}
            getExecutionDefinition={getExecutionDefinition}
            getColumnTotals={getColumnTotals}
            getRowTotals={getRowTotals}
            intl={intl}
        />
    );
}
