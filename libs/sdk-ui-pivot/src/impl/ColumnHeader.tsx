// (C) 2007-2018 GoodData Corporation
import { IHeaderParams } from "@ag-grid-community/all-modules";
import { SortDirection } from "@gooddata/sdk-model";
import React from "react";
import { IMenu } from "../types";
import { COLUMN_ATTRIBUTE_COLUMN, FIELD_TYPE_ATTRIBUTE } from "./agGridConst";

import { getParsedFields } from "./agGridUtils";
import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    menu?: () => IMenu;
}

export interface IColumnHeaderState {
    sorting?: SortDirection;
}

export const ASC: SortDirection = "asc";
export const DESC: SortDirection = "desc";

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
        return this.getFieldType() === FIELD_TYPE_ATTRIBUTE ? ASC : DESC;
    }

    public onSortRequested = (sortDir: SortDirection): void => {
        const multiSort = false; // Enable support for multisort with CMD key with 'event.shiftKey';
        this.props.setSort(sortDir, multiSort);
    };

    public render(): React.ReactNode {
        const { displayName, enableSorting, menu, column } = this.props;
        const textAlign = this.getFieldType() === FIELD_TYPE_ATTRIBUTE ? ALIGN_LEFT : ALIGN_RIGHT;
        const isColumnAttribute = column.getColDef().type === COLUMN_ATTRIBUTE_COLUMN;

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
                getExecutionDefinition={this.props.getExecutionDefinition}
                getColumnTotals={this.props.getColumnTotals}
                getDataView={this.props.getDataView}
                intl={this.props.intl}
            />
        );
    }

    private getFieldType() {
        const colId = this.props.column.getColDef().field;
        const fields = getParsedFields(colId!);
        const [lastFieldType] = fields[fields.length - 1];

        return lastFieldType;
    }
}

export default ColumnHeader;
