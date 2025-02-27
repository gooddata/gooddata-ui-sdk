// (C) 2007-2025 GoodData Corporation
import { IHeaderParams } from "ag-grid-community";
import React, { useEffect, useState } from "react";
import cx from "classnames";
import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell.js";
import {
    isEmptyScopeCol,
    isSliceCol,
    isSliceMeasureCol,
    isMixedHeadersCol,
    isMixedValuesCol,
} from "../tableDescriptorTypes.js";
import { SortDirection } from "@gooddata/sdk-model";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    className?: string;
    menu?: () => IMenu;
}

export interface IColumnHeaderState {
    sorting?: SortDirection;
}

const ColumnHeader: React.FC<IColumnHeaderProps> = (props) => {
    const [sorting, setSorting] = useState<SortDirection | undefined>(
        props.column.getSort() as SortDirection,
    );

    useEffect(() => {
        const getCurrentSortDirection = () => {
            const currentSort: SortDirection = props.column.getSort() as SortDirection;
            setSorting(currentSort);
        };

        props.column.addEventListener("sortChanged", getCurrentSortDirection);
        return () => {
            props.column.removeEventListener("sortChanged", getCurrentSortDirection);
        };
    }, [props.column]);

    const getDefaultSortDirection = (): SortDirection => {
        return isSliceCol(getColDescriptor()) ? "asc" : "desc";
    };

    const onSortRequested = (sortDir: SortDirection): void => {
        const multiSort = false;

        props.setSort(sortDir, multiSort);
        props.api.refreshHeader();
    };

    const getColDescriptor = () => {
        return props.getTableDescriptor().getCol(props.column);
    };

    const { className, getTableDescriptor, displayName, enableSorting, menu, column } = props;
    const col = getColDescriptor();
    const textAlign =
        isSliceCol(col) ||
        isEmptyScopeCol(col) ||
        isSliceMeasureCol(col) ||
        isMixedValuesCol(col) ||
        isMixedHeadersCol(col)
            ? ALIGN_LEFT
            : ALIGN_RIGHT;
    const isColumnAttribute = isEmptyScopeCol(col);
    const isSortingEnabled =
        !isColumnAttribute &&
        !isSliceMeasureCol(col) &&
        !isMixedValuesCol(col) &&
        !isMixedHeadersCol(col) &&
        enableSorting;

    const tableDescriptor = getTableDescriptor();
    const showMenu = tableDescriptor.isTransposed()
        ? (isSliceMeasureCol(col) && displayName) || isMixedHeadersCol(col)
        : true;

    return (
        <HeaderCell
            className={cx("s-pivot-table-column-header", className)}
            textAlign={textAlign}
            displayText={displayName}
            enableSorting={isSortingEnabled}
            sortDirection={sorting}
            defaultSortDirection={getDefaultSortDirection()}
            onSortClick={onSortRequested}
            onMenuAggregationClick={props.onMenuAggregationClick}
            menu={showMenu ? menu?.() : undefined}
            colId={column.getColDef().field}
            getTableDescriptor={getTableDescriptor}
            getExecutionDefinition={props.getExecutionDefinition}
            getColumnTotals={props.getColumnTotals}
            getRowTotals={props.getRowTotals}
            intl={props.intl}
        />
    );
};

export default ColumnHeader;
