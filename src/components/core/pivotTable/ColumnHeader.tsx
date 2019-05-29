// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import { IHeaderParams } from "ag-grid-community";
import { AFM, Execution } from "@gooddata/typings";

import { getParsedFields } from "./agGridUtils";
import { IMenu, IMenuAggregationClickConfig } from "../../../interfaces/PivotTable";
import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT } from "./HeaderCell";
import { FIELD_TYPE_ATTRIBUTE, COLUMN_ATTRIBUTE_COLUMN } from "./agGridConst";

export interface IColumnHeaderProps extends IHeaderParams {
    menu?: IMenu;
    getColumnTotals?: () => AFM.ITotalItem[];
    getExecutionResponse?: () => Execution.IExecutionResponse;
    onMenuAggregationClick?: (config: IMenuAggregationClickConfig) => void;
    intl?: ReactIntl.InjectedIntl;
}

export interface IColumnHeaderState {
    sorting?: AFM.SortDirection;
}

export const ASC: AFM.SortDirection = "asc";
export const DESC: AFM.SortDirection = "desc";

class ColumnHeader extends React.Component<IColumnHeaderProps, IColumnHeaderState> {
    public static propTypes = {
        menu: PropTypes.object,
        getColumnTotals: PropTypes.func,
        getExecutionResponse: PropTypes.func,
        onMenuAggregationClick: PropTypes.func,
        intl: PropTypes.object,
        enableSorting: PropTypes.bool,
        displayName: PropTypes.string,
        column: PropTypes.any,
        reactContainer: PropTypes.any,
        showColumnMenu: PropTypes.func,
        setSort: PropTypes.func,
    };

    public state: IColumnHeaderState = {
        sorting: null,
    };

    public componentWillMount() {
        this.props.column.addEventListener("sortChanged", this.getCurrentSortDirection);
        this.setState({
            sorting: this.props.column.getSort() as AFM.SortDirection,
        });
    }

    public componentWillUnmount() {
        this.props.column.removeEventListener("sortChanged", this.getCurrentSortDirection);
    }

    public getCurrentSortDirection = () => {
        const currentSort: AFM.SortDirection = this.props.column.getSort() as AFM.SortDirection;
        this.setState({
            sorting: currentSort,
        });
    };

    public getDefaultSortDirection(): AFM.SortDirection {
        return this.getFieldType() === FIELD_TYPE_ATTRIBUTE ? ASC : DESC;
    }

    public onSortRequested = (sortDir: AFM.SortDirection) => {
        const multiSort = false; // Enable support for multisort with CMD key with 'event.shiftKey';
        this.props.setSort(sortDir, multiSort);
    };

    public render() {
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
                menu={menu}
                colId={column.getColDef().field}
                getColumnTotals={this.props.getColumnTotals}
                getExecutionResponse={this.props.getExecutionResponse}
                intl={this.props.intl}
            />
        );
    }

    private getFieldType() {
        const colId = this.props.column.getColDef().field;
        const fields = getParsedFields(colId);
        const [lastFieldType] = fields[fields.length - 1];

        return lastFieldType;
    }
}

export default ColumnHeader;
