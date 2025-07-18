// (C) 2023-2025 GoodData Corporation
import { IHeaderParams } from "ag-grid-community";
import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell.js";
import { isEmptyScopeCol, isSliceCol } from "../tableDescriptorTypes.js";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    menu?: () => IMenu;
}

export default function ColumnTotalHeader(props: IColumnHeaderProps) {
    const getColDescriptor = () => {
        return props.getTableDescriptor().getCol(props.column);
    };

    const { displayName, column } = props;
    const col = getColDescriptor();
    const textAlign = isSliceCol(col) || isEmptyScopeCol(col) ? ALIGN_LEFT : ALIGN_RIGHT;

    return (
        <HeaderCell
            className="gd-pivot-table-column-total-header s-pivot-table-column-total-header"
            textAlign={textAlign}
            displayText={displayName}
            enableSorting={false}
            colId={column.getColDef().field}
            getTableDescriptor={props.getTableDescriptor}
            getExecutionDefinition={props.getExecutionDefinition}
            getColumnTotals={props.getColumnTotals}
            getRowTotals={props.getRowTotals}
            intl={props.intl}
        />
    );
}
