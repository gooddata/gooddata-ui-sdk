// (C) 2007-2022 GoodData Corporation
import { IHeaderGroupParams } from "@ag-grid-community/all-modules";
import React from "react";

import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ICommonHeaderParams } from "./HeaderCell.js";
import { agColId } from "../tableDescriptorTypes.js";

export interface IProps extends ICommonHeaderParams, IHeaderGroupParams {
    menu?: () => IMenu;
}

export default class ColumnGroupHeader extends React.Component<IProps> {
    public render() {
        const { menu, intl } = this.props;
        const colGroupDef = this.props.columnGroup.getColGroupDef()!;
        const colId = agColId(colGroupDef);
        const parent = this.props.columnGroup.getParent();

        // do not show menu for the first group header and empty headers above row attribute column headers
        const showMenu = !!parent && !!colGroupDef.headerName;

        return (
            <HeaderCell
                className="s-pivot-table-column-group-header"
                displayText={this.props.displayName}
                enableSorting={false}
                menuPosition={ALIGN_LEFT}
                textAlign={ALIGN_LEFT}
                menu={showMenu ? menu?.() : undefined}
                onMenuAggregationClick={this.props.onMenuAggregationClick}
                colId={colId}
                getTableDescriptor={this.props.getTableDescriptor}
                getExecutionDefinition={this.props.getExecutionDefinition}
                getColumnTotals={this.props.getColumnTotals}
                getRowTotals={this.props.getRowTotals}
                intl={intl}
            />
        );
    }
}
