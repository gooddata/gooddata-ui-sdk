// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ITotal, IMeasureDescriptorItem } from "@gooddata/sdk-model";
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import { isSomeTotal } from "../data/dataSourceUtils.js";
import { VALUE_CLASS, ROW_MEASURE_COLUMN } from "../base/constants.js";
import { IGridTotalsRow } from "../data/resultTypes.js";
import { agColId } from "../structure/tableDescriptorTypes.js";
import { IMenuAggregationClickConfig } from "../privateTypes.js";

function hasTotalForCurrentColumn(params: ICellRendererParams): boolean {
    const row = params.data as IGridTotalsRow;

    if (!row?.calculatedForColumns || !params.colDef) {
        return false;
    }

    const colId = agColId(params.colDef);

    return row.calculatedForColumns.some((col) => col === colId);
}

/**
 * For measures in rows, update menu aggregation click function to a single measure
 * instead of attaching all measures (all measures are associated with the column by default)
 * Take the info from measureDescriptor associated with the data property on the cell.
 */
function updateMenuAggregationClickForMeasure(
    headerComponentParams: any,
    measureDescriptorHeaderItem: IMeasureDescriptorItem,
) {
    if (!measureDescriptorHeaderItem) {
        return headerComponentParams;
    }

    const onMenuAggregationClick = (config: IMenuAggregationClickConfig) => {
        return headerComponentParams.onMenuAggregationClick({
            ...config,
            measureIdentifiers: [measureDescriptorHeaderItem.localIdentifier],
        });
    };

    return {
        ...headerComponentParams,
        onMenuAggregationClick,
    };
}

/**
 * Returns common implementation of cell renderer used for normal cells, sticky header cells and totals.
 */
export function createCellRenderer(): (params: ICellRendererParams) => JSX.Element {
    // eslint-disable-next-line react/display-name
    return (params: ICellRendererParams): JSX.Element => {
        const isRowTotalOrSubtotal = isSomeTotal(params.data?.type);
        const isActiveRowTotal = isRowTotalOrSubtotal && hasTotalForCurrentColumn(params);
        const formattedValue =
            isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
                ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
                : params.formatValue!(params.value);

        if (params.colDef?.type === ROW_MEASURE_COLUMN && params.data?.measureDescriptor) {
            const HeaderComponent = params.colDef?.headerComponent;
            const measureHeaderItem = params.data?.measureDescriptor?.measureHeaderItem;
            const headerParams = updateMenuAggregationClickForMeasure(
                params.colDef?.headerComponentParams,
                measureHeaderItem,
            );

            // for totals/subtotals, there is the name, but we don't want to render menu for them
            const menuOverride = isRowTotalOrSubtotal ? { menu: null } : {};
            const getMatchingRowTotals = () =>
                headerParams
                    .getRowTotals()
                    .filter(
                        (total: ITotal) => total.measureIdentifier === measureHeaderItem?.localIdentifier,
                    );
            const getMatchingColTotals = () =>
                headerParams
                    .getColumnTotals()
                    .filter(
                        (total: ITotal) => total.measureIdentifier === measureHeaderItem?.localIdentifier,
                    );

            return (
                <HeaderComponent
                    {...headerParams}
                    className="gd-row-measure-name"
                    column={params.column}
                    displayName={formattedValue}
                    getRowTotals={getMatchingRowTotals}
                    getColumnTotals={getMatchingColTotals}
                    {...menuOverride}
                />
            );
        }

        const className = params.node.rowPinned === "top" ? "gd-sticky-header-value" : VALUE_CLASS;

        return <span className={className}>{formattedValue || ""}</span>;
    };
}
