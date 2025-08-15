// (C) 2025 GoodData Corporation

import { usePivotTableProps } from "../../../context/PivotTablePropsContext.js";
import { constructAggregationsMenuItems } from "../utils/constructAggregationsMenuItems.js";
import { IAttributeDescriptor, IBucket, IExecutionDefinition, ITotal } from "@gooddata/sdk-model";

import { useCurrentDataView } from "../../../context/CurrentDataViewContext.js";
import { BucketNames, isAttributeColumnDefinition } from "@gooddata/sdk-ui";
import { AVAILABLE_TOTALS } from "../../../constants/internal.js";
import { IAggregationsSubMenuItem, ITextWrappingMenuItem } from "../../../types/menu.js";

import { constructTextWrappingMenuItems } from "../utils/constructTextWrappingMenuItems.js";
import { useUpdateTextWrapping } from "../../../hooks/textWrapping/useUpdateTextWrapping.js";
import { useGetDefaultTextWrapping } from "../../../hooks/textWrapping/useGetDefaultTextWrapping.js";
import { useUpdateTotals } from "../../../hooks/totals/useUpdateTotals.js";
import { AgGridApi } from "../../../types/agGrid.js";

/**
 * Hook for header cell components that handles menu items and callbacks.
 *
 * @param measureIdentifiers - Array of measure identifiers for the cell
 * @param pivotAttributeDescriptors - Array of pivot attribute descriptors
 * @param gridApi - Optional ag-grid API for checking current text wrapping state
 * @returns Menu items and callbacks
 */
export const useHeaderMenuProps = (
    measureIdentifiers: string[],
    pivotAttributeDescriptors: IAttributeDescriptor[],
    gridApi?: AgGridApi,
) => {
    const { currentDataView } = useCurrentDataView();
    const { config, execution, rows, columns } = usePivotTableProps();
    const { onUpdateTextWrapping } = useUpdateTextWrapping();
    const { onUpdateTotals } = useUpdateTotals();
    const getCurrentTextWrapping = useGetDefaultTextWrapping();

    const { rowTotals, columnTotals } = getTotalsFromExecutionDefinition(execution.definition);

    const tableData = currentDataView?.data().asTable();
    const rowAttributeDescriptors =
        tableData?.columnDefinitions
            .filter(isAttributeColumnDefinition)
            .map((columnDefinition) => columnDefinition.attributeDescriptor) ?? [];

    const aggregationsItems = config.menu?.aggregations
        ? constructAggregationsMenuItems(
              measureIdentifiers,
              config.menu?.aggregationTypes ?? AVAILABLE_TOTALS,
              rowTotals,
              columnTotals,
              rows,
              columns,
              rowAttributeDescriptors,
              pivotAttributeDescriptors,
          )
        : [];

    const handleAggregationsItemClick = (item: IAggregationsSubMenuItem) => {
        const currentTotals = item.isColumn ? columnTotals : rowTotals;

        onUpdateTotals(currentTotals, item.totalDefinitions, item.isActive, item.isColumn);
    };

    const currentTextWrapping = getCurrentTextWrapping(gridApi, config.textWrapping);
    const textWrappingItems = constructTextWrappingMenuItems({ textWrapping: currentTextWrapping });

    const handleTextWrappingItemClick = (item: ITextWrappingMenuItem) => {
        const effectiveItem = textWrappingItems.find((i) => i.id === item.id);

        if (!effectiveItem) {
            return;
        }

        const isHeaderItem = effectiveItem.id === "header";
        const newTextWrapping = {
            ...currentTextWrapping,
            ...(isHeaderItem
                ? { wrapHeaderText: !effectiveItem.isActive }
                : { wrapText: !effectiveItem.isActive }),
        };

        onUpdateTextWrapping(newTextWrapping, gridApi);
    };

    return {
        aggregationsItems,
        handleAggregationsItemClick,
        textWrappingItems,
        handleTextWrappingItemClick,
    };
};

/**
 * Gets totals from an execution definition, if present.
 *
 * @param definition - The execution definition object
 * @returns Object with rowTotals and columnTotals
 */
function getTotalsFromExecutionDefinition(definition: IExecutionDefinition): {
    rowTotals: ITotal[];
    columnTotals: ITotal[];
} {
    const rowTotals = getTotalsFromBucket(definition.buckets, BucketNames.ATTRIBUTE);
    const columnTotals = getTotalsFromBucket(definition.buckets, BucketNames.COLUMNS);

    return {
        rowTotals,
        columnTotals,
    };
}

/**
 * Gets totals from a bucket.
 *
 * @param buckets - The buckets object
 * @param bucketName - The name of the bucket to get totals from
 * @returns Array of totals
 */
function getTotalsFromBucket(buckets: IBucket[], bucketName: string): ITotal[] {
    const selectedBucket = buckets.find((bucket) => bucket.localIdentifier === bucketName);
    return selectedBucket?.totals ?? [];
}
