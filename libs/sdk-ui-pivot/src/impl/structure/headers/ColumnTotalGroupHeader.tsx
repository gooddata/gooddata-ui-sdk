// (C) 2023 GoodData Corporation
import { IHeaderGroupParams } from "@ag-grid-community/all-modules";
import React from "react";
import { IMenu } from "../../../publicTypes";
import { agColId } from "../tableDescriptorTypes";

import HeaderCell, { ALIGN_LEFT, ICommonHeaderParams } from "./HeaderCell";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderGroupParams {
    menu?: () => IMenu;
}

class ColumnTotalGroupHeader extends React.Component<IColumnHeaderProps> {
    public render() {
        const colGroupDef = this.props.columnGroup.getColGroupDef()!;
        const colId = agColId(colGroupDef);

        return (
            <HeaderCell
                className="gd-pivot-table-column-total-group-header s-pivot-table-column-total-group-header"
                textAlign={ALIGN_LEFT}
                displayText={this.props.displayName}
                enableSorting={false}
                colId={colId}
                getTableDescriptor={this.props.getTableDescriptor}
                getExecutionDefinition={this.props.getExecutionDefinition}
                getColumnTotals={this.props.getColumnTotals}
                getRowTotals={this.props.getRowTotals}
                intl={this.props.intl}
            />
        );
    }
}

export default ColumnTotalGroupHeader;
