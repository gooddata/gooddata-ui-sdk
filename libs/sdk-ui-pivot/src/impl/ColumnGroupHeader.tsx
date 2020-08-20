// (C) 2007-2018 GoodData Corporation
import { ColGroupDef, IHeaderGroupParams } from "@ag-grid-community/all-modules";
import React from "react";

import { IMenu } from "../types";

import HeaderCell, { ALIGN_LEFT, ICommonHeaderParams } from "./HeaderCell";

export interface IProps extends ICommonHeaderParams, IHeaderGroupParams {
    menu?: () => IMenu;
}

export interface IColumnGroupDef extends ColGroupDef {
    field?: string;
}

export default class ColumnGroupHeader extends React.Component<IProps> {
    public render(): React.ReactNode {
        const { menu, intl } = this.props;
        const columnGroupDef = this.props.columnGroup.getColGroupDef() as IColumnGroupDef;
        const parent = this.props.columnGroup.getParent();

        // do not show menu for the first group header and empty headers above row attribute column headers
        const showMenu = !!parent && !!columnGroupDef.headerName;

        return (
            <HeaderCell
                className="s-pivot-table-column-group-header"
                displayText={this.props.displayName}
                enableSorting={false}
                menuPosition={ALIGN_LEFT}
                textAlign={ALIGN_LEFT}
                menu={showMenu ? menu?.() : undefined}
                onMenuAggregationClick={this.props.onMenuAggregationClick}
                colId={columnGroupDef.field}
                getExecutionDefinition={this.props.getExecutionDefinition}
                getColumnTotals={this.props.getColumnTotals}
                getDataView={this.props.getDataView}
                intl={intl}
            />
        );
    }
}
