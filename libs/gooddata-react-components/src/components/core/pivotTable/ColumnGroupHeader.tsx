// (C) 2007-2018 GoodData Corporation
import * as React from "react";

import { AFM, Execution } from "@gooddata/typings";
import { IHeaderGroupParams, ColGroupDef } from "ag-grid-community";

import HeaderCell, { ALIGN_LEFT } from "./HeaderCell";
import { IMenu, IMenuAggregationClickConfig } from "../../../interfaces/PivotTable";

export interface IProps extends IHeaderGroupParams {
    menu?: IMenu;
    getColumnTotals: () => AFM.ITotalItem[];
    getExecutionResponse: () => Execution.IExecutionResponse;
    onMenuAggregationClick: (config: IMenuAggregationClickConfig) => void;
    intl: ReactIntl.InjectedIntl;
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
                menu={showMenu ? menu : null}
                onMenuAggregationClick={this.props.onMenuAggregationClick}
                colId={columnGroupDef.field}
                getColumnTotals={this.props.getColumnTotals}
                getExecutionResponse={this.props.getExecutionResponse}
                intl={intl}
            />
        );
    }
}
