// (C) 2025 GoodData Corporation

import { type ICellRendererParams } from "ag-grid-enterprise";

import { METRIC_EMPTY_VALUE } from "../../constants/internal.js";
import { isTableTotalCellData } from "../../features/columns/shared.js";
import { getPivotCellTestIdPropsFromCellTypes } from "../../testing/dataTestIdGenerators.js";
import { type CellTypes } from "../../types/cellRendering.js";

/**
 * Cell renderer for transposed metrics.
 *
 * With special case handling empty values if table has no measures.
 *
 * @internal
 */
export function TransposedMetricCell(
    params: ICellRendererParams & { tableHasMeasures?: boolean; cellTypes?: CellTypes },
) {
    const value = params.value;
    const dataTestIdProps = getPivotCellTestIdPropsFromCellTypes(params.cellTypes);

    if (!value && !params.tableHasMeasures) {
        return <span {...dataTestIdProps} />;
    }

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
