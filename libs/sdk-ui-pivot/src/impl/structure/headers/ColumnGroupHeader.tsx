// (C) 2007-2025 GoodData Corporation
import { IHeaderGroupParams } from "ag-grid-community";

import { IMenu } from "../../../publicTypes.js";

import HeaderCell, { ALIGN_LEFT, ICommonHeaderParams } from "./HeaderCell.js";
import { agColId } from "../tableDescriptorTypes.js";

export interface IProps extends ICommonHeaderParams, IHeaderGroupParams {
    menu?: () => IMenu;
}

export default function ColumnGroupHeader({
    menu,
    columnGroup,
    intl,
    getTableDescriptor,
    displayName,
    onMenuAggregationClick,
    getExecutionDefinition,
    getColumnTotals,
    getRowTotals,
}: IProps) {
    const colGroupDef = columnGroup.getColGroupDef()!;
    const colId = agColId(colGroupDef);
    const parent = columnGroup.getParent();

    // do not show menu for the first group header and empty headers above row attribute column headers
    // and also do not show when table is transposed => handled in rows
    const isTransposed = getTableDescriptor().isTransposed();
    const showMenu = !!parent && !!colGroupDef.headerName && !isTransposed;

    return (
        <HeaderCell
            className="s-pivot-table-column-group-header"
            displayText={displayName}
            enableSorting={false}
            menuPosition={ALIGN_LEFT}
            textAlign={ALIGN_LEFT}
            menu={showMenu ? menu?.() : undefined}
            onMenuAggregationClick={onMenuAggregationClick}
            colId={colId}
            getTableDescriptor={getTableDescriptor}
            getExecutionDefinition={getExecutionDefinition}
            getColumnTotals={getColumnTotals}
            getRowTotals={getRowTotals}
            intl={intl}
        />
    );
}
