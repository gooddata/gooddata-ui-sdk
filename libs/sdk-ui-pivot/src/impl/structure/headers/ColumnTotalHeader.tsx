// (C) 2023 GoodData Corporation
import { IHeaderParams } from "@ag-grid-community/all-modules";
import React from "react";
import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell.js";
import { isEmptyScopeCol, isSliceCol } from "../tableDescriptorTypes.js";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    menu?: () => IMenu;
}

class ColumnTotalHeader extends React.Component<IColumnHeaderProps> {
    public render() {
        const { displayName, column } = this.props;
        const col = this.getColDescriptor();
        const textAlign = isSliceCol(col) || isEmptyScopeCol(col) ? ALIGN_LEFT : ALIGN_RIGHT;

        return (
            <HeaderCell
                className="gd-pivot-table-column-total-header s-pivot-table-column-total-header"
                textAlign={textAlign}
                displayText={displayName}
                enableSorting={false}
                colId={column.getColDef().field}
                getTableDescriptor={this.props.getTableDescriptor}
                getExecutionDefinition={this.props.getExecutionDefinition}
                getColumnTotals={this.props.getColumnTotals}
                getRowTotals={this.props.getRowTotals}
                intl={this.props.intl}
            />
        );
    }
    private getColDescriptor() {
        return this.props.getTableDescriptor().getCol(this.props.column);
    }
}

export default ColumnTotalHeader;
