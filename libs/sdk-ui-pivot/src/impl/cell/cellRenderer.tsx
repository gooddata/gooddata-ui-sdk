// (C) 2007-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { ICellRendererParams } from "ag-grid-community";
import cx from "classnames";

import { IMeasureDescriptorItem, ITotal } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { MIXED_HEADERS_COLUMN, ROW_MEASURE_COLUMN, VALUE_CLASS } from "../base/constants.js";
import { isSomeTotal } from "../data/dataSourceUtils.js";
import { IGridTotalsRow } from "../data/resultTypes.js";
import { IMenuAggregationClickConfig } from "../privateTypes.js";
import { TableDescriptor } from "../structure/tableDescriptor.js";
import { agColId, isRootCol } from "../structure/tableDescriptorTypes.js";

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

function shouldShowAggregationsMenu(params: ICellRendererParams) {
    return (
        (params.colDef?.type === ROW_MEASURE_COLUMN || params.colDef?.type === MIXED_HEADERS_COLUMN) &&
        params.data?.measureDescriptor
    );
}

/**
 * Returns common implementation of cell renderer used for normal cells, sticky header cells and totals.
 */
export function createCellRenderer(
    tableDescriptor: TableDescriptor,
): (params: ICellRendererParams) => ReactElement {
    // eslint-disable-next-line react/display-name
    return (params: ICellRendererParams): ReactElement => {
        const loadingDone = params.node.id !== undefined || params.node.rowPinned === "bottom";

        const theme = useTheme();
        const column = params.colDef && tableDescriptor?.getCol(params.colDef);
        const showLoadingComponent =
            column && !isRootCol(column) && tableDescriptor.getAbsoluteLeafColIndex(column) === 0; // only for first column
        if (!loadingDone && showLoadingComponent) {
            const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;
            return <LoadingComponent color={color} width={36} imageHeight={8} height={26} speed={2} />;
        }

        const isRowTotalOrSubtotal = isSomeTotal(params.data?.type);
        const isActiveRowTotal = isRowTotalOrSubtotal && hasTotalForCurrentColumn(params);
        const formattedValue =
            isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
                ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
                : params.formatValue!(params.value);

        if (shouldShowAggregationsMenu(params)) {
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

            const className = cx("gd-row-measure-name", {
                "s-loading-done": loadingDone,
            });

            return (
                <HeaderComponent
                    {...headerParams}
                    className={className}
                    column={params.column}
                    displayName={formattedValue}
                    getRowTotals={getMatchingRowTotals}
                    getColumnTotals={getMatchingColTotals}
                    {...menuOverride}
                />
            );
        }

        const className = cx(params.node.rowPinned === "top" ? "gd-sticky-header-value" : VALUE_CLASS, {
            "s-loading-done": loadingDone,
        });

        return (
            <span className={className} title={formattedValue || ""}>
                {formattedValue || ""}
            </span>
        );
    };
}
