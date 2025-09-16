// (C) 2023-2025 GoodData Corporation

import { IHeaderGroupParams } from "ag-grid-community";

import TotalHeaderCell, { ALIGN_LEFT } from "./TotalHeaderCell.js";

export function ColumnTotalGroupHeader(props: IHeaderGroupParams) {
    return (
        <TotalHeaderCell
            className="gd-pivot-table-column-total-group-header s-pivot-table-column-total-group-header"
            textAlign={ALIGN_LEFT}
            displayText={props.displayName}
        />
    );
}
