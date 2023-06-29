// (C) 2007-2022 GoodData Corporation
import { IHeaderParams } from "@ag-grid-community/all-modules";
import React from "react";
import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell.js";
import { isEmptyScopeCol, isSliceCol } from "../tableDescriptorTypes.js";
import { SortDirection } from "@gooddata/sdk-model";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    menu?: () => IMenu;
}

export interface IColumnHeaderState {
    sorting?: SortDirection;
}

class ColumnHeader extends React.Component<IColumnHeaderProps, IColumnHeaderState> {
    public state: IColumnHeaderState = {
        sorting: undefined,
    };

    public UNSAFE_componentWillMount(): void {
        this.props.column.addEventListener("sortChanged", this.getCurrentSortDirection);
        this.setState({
            sorting: this.props.column.getSort() as SortDirection,
        });
    }

    public componentWillUnmount(): void {
        this.props.column.removeEventListener("sortChanged", this.getCurrentSortDirection);
    }

    public getCurrentSortDirection = (): void => {
        const currentSort: SortDirection = this.props.column.getSort() as SortDirection;
        this.setState({
            sorting: currentSort,
        });
    };

    public getDefaultSortDirection(): SortDirection {
        return isSliceCol(this.getColDescriptor()) ? "asc" : "desc";
    }

    public onSortRequested = (sortDir: SortDirection): void => {
        const multiSort = false; // Enable support for multisort with CMD key with 'event.shiftKey';
        /**
         * Header needs to be refreshed otherwise the grid will throw error.
         *
         * The whole grid is reinitialized during sorting and ag-grid expects
         * that the grid dom is there.
         */
        this.props.api.refreshHeader();
        this.props.setSort(sortDir, multiSort);
    };

    public render() {
        const { displayName, enableSorting, menu, column } = this.props;
        const col = this.getColDescriptor();
        const textAlign = isSliceCol(col) || isEmptyScopeCol(col) ? ALIGN_LEFT : ALIGN_RIGHT;
        const isColumnAttribute = isEmptyScopeCol(col);

        return (
            <HeaderCell
                className="s-pivot-table-column-header"
                textAlign={textAlign}
                displayText={displayName}
                enableSorting={!isColumnAttribute && enableSorting}
                sortDirection={this.state.sorting}
                defaultSortDirection={this.getDefaultSortDirection()}
                onSortClick={this.onSortRequested}
                onMenuAggregationClick={this.props.onMenuAggregationClick}
                menu={menu?.()}
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

export default ColumnHeader;
