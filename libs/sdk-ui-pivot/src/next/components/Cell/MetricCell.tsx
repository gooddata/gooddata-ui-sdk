// (C) 2025 GoodData Corporation

import { type ICellRendererParams } from "ag-grid-enterprise";

import { METRIC_EMPTY_VALUE } from "../../constants/internal.js";
import { isTableTotalCellData } from "../../features/columns/shared.js";
import { getPivotCellTestIdPropsFromCellTypes } from "../../testing/dataTestIdGenerators.js";
import { type CellTypes } from "../../types/cellRendering.js";

/**
 * Cell renderer for metrics.
 *
 * Empty value is handled with specific string,
 * except for subtotal and grand total cells which have no cell value in case of empty value.
 *
 * @internal
 */
export function MetricCell(
    params: ICellRendererParams & {
        cellTypes?: CellTypes;
    },
) {
    const value = params.value;
    const dataTestIdProps = getPivotCellTestIdPropsFromCellTypes(params.cellTypes);

    if (!value) {
        const colId = params.colDef?.colId;
        const cellData = colId ? params.data?.cellDataByColId?.[colId] : undefined;

        if (isTableTotalCellData(cellData)) {
            return <span {...dataTestIdProps} />;
        }

        return <span {...dataTestIdProps}>{METRIC_EMPTY_VALUE}</span>;
    }

    return <span {...dataTestIdProps}>{value}</span>;
}
