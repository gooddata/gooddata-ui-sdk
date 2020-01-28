// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { ITotal } from "@gooddata/sdk-model";
import { ColGroupDef, IHeaderGroupParams } from "ag-grid-community";
import * as React from "react";
import { IntlShape } from "react-intl";

import { IMenu, IMenuAggregationClickConfig } from "../types";

import HeaderCell, { ALIGN_LEFT } from "./HeaderCell";

export interface IProps extends IHeaderGroupParams {
    menu?: () => IMenu;
    getColumnTotals: () => ITotal[];
    getDataView: () => DataViewFacade;
    onMenuAggregationClick: (config: IMenuAggregationClickConfig) => void;
    intl: IntlShape;
}

export interface IColumnGroupDef extends ColGroupDef {
    field?: string;
}

export default class ColumnGroupHeader extends React.Component<IProps> {
    public render() {
        const { menu, intl } = this.props;
        const columnGroupDef = this.props.columnGroup.getColGroupDef() as IColumnGroupDef;
        const parent = this.props.columnGroup.getParent();

        // do not show menu for the first group header and empty headers above row attribute column heders
        const showMenu = !!parent && !!columnGroupDef.headerName;

        return (
            <HeaderCell
                className="s-pivot-table-column-group-header"
                displayText={this.props.displayName}
                enableSorting={false}
                menuPosition={ALIGN_LEFT}
                textAlign={ALIGN_LEFT}
                menu={showMenu ? menu() : null}
                onMenuAggregationClick={this.props.onMenuAggregationClick}
                colId={columnGroupDef.field}
                getColumnTotals={this.props.getColumnTotals}
                getDataView={this.props.getDataView}
                intl={intl}
            />
        );
    }
}
