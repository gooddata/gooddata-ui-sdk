// (C) 2007-2025 GoodData Corporation
import { IHeaderParams, HeaderFocusedEvent, ColumnEvent } from "ag-grid-community";

import React, { useEffect, useState, useCallback } from "react";
import cx from "classnames";
import { IMenu } from "../../../publicTypes.js";
import { SortDirection } from "@gooddata/sdk-model";

import HeaderCell, { ALIGN_LEFT, ALIGN_RIGHT, ICommonHeaderParams } from "./HeaderCell.js";
import {
    isEmptyScopeCol,
    isSliceCol,
    isSliceMeasureCol,
    isMixedHeadersCol,
    isMixedValuesCol,
} from "../tableDescriptorTypes.js";
import { isEnterKey, isSpaceKey } from "@gooddata/sdk-ui-kit";

export interface IColumnHeaderProps extends ICommonHeaderParams, IHeaderParams {
    className?: string;
    menu?: () => IMenu;
}

export interface IColumnHeaderState {
    sorting?: SortDirection;
}

const ColumnHeader: React.FC<IColumnHeaderProps> = (props) => {
    const {
        className,
        column,
        api,
        getTableDescriptor,
        displayName,
        enableSorting,
        menu,
        progressSort,
        eGridHeader,
        setLastSortedColId,
    } = props;

    const [sorting, setSorting] = useState<SortDirection | undefined>(column.getSort() as SortDirection);

    // Only sync sort state locally; sorted column id is tracked at table level.
    useEffect(() => {
        const syncSortState = (_event: ColumnEvent<"sortChanged", any, any>) => {
            const currentSort: SortDirection = column.getSort() as SortDirection;
            setSorting(currentSort);
        };
        column.addEventListener("sortChanged", syncSortState);
        return () => {
            column.removeEventListener("sortChanged", syncSortState);
        };
    }, [column]);

    const onSortRequested = useCallback((): void => {
        const multiSort = false;
        progressSort(multiSort);
        api.refreshHeader();
    }, [api, progressSort]);

    const getColDescriptor = () => {
        return props.getTableDescriptor().getCol(props.column);
    };

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

    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!api) {
            return;
        }
        const handleFocusChange = (event: HeaderFocusedEvent) => {
            const focusedColId = event.column.isColumn ? event.column.getColId() : event.column.getGroupId();
            const myColId = column.getColId();
            setIsFocused(focusedColId === myColId);
        };

        api.addEventListener("headerFocused", handleFocusChange);

        return () => {
            api.removeEventListener("headerFocused", handleFocusChange);
        };
    }, [api, column]);

    useEffect(() => {
        if (!eGridHeader) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            // set last sorted column id to table only when sort was triggered by keyboard
            if (
                isEnterKey(event as unknown as React.KeyboardEvent) &&
                isSortingEnabled &&
                setLastSortedColId
            ) {
                setLastSortedColId(column.getColId());
            }
            if (isSpaceKey(event as unknown as React.KeyboardEvent)) {
                event.preventDefault();
                if (isSortingEnabled && setLastSortedColId) {
                    setLastSortedColId(column.getColId());
                    onSortRequested();
                }
            }
        };
        const handleBlur = () => {
            setIsFocused(false);
        };
        eGridHeader.addEventListener("keydown", handleKeyDown);
        if (!showMenu) {
            eGridHeader.addEventListener("blur", handleBlur);
        }

        return () => {
            eGridHeader.removeEventListener("keydown", handleKeyDown);
            if (!showMenu) {
                eGridHeader.removeEventListener("blur", handleBlur);
            }
        };
    }, [eGridHeader, column, isSortingEnabled, setLastSortedColId, showMenu, onSortRequested]);

    return (
        <HeaderCell
            className={cx("s-pivot-table-column-header", className)}
            textAlign={textAlign}
            displayText={displayName}
            enableSorting={isSortingEnabled}
            sortDirection={sorting}
            defaultSortDirection={column.getColDef().sortingOrder?.[0] ?? undefined}
            onSortClick={onSortRequested}
            onMenuAggregationClick={props.onMenuAggregationClick}
            menu={showMenu ? menu?.() : undefined}
            colId={column.getColDef().field}
            getTableDescriptor={getTableDescriptor}
            getExecutionDefinition={props.getExecutionDefinition}
            getColumnTotals={props.getColumnTotals}
            getRowTotals={props.getRowTotals}
            intl={props.intl}
            isFocused={isFocused}
        />
    );
};

export default ColumnHeader;
