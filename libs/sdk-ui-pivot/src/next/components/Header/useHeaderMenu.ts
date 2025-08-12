// (C) 2025 GoodData Corporation

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { constructAggregationsMenuItems } from "./constructAggregationsMenuItems.js";
import { IAttributeDescriptor, IBucket, IExecutionDefinition, ITotal } from "@gooddata/sdk-model";
import { sanitizeTotals } from "../../features/aggregations/sanitization.js";
import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { BucketNames, isAttributeColumnDefinition } from "@gooddata/sdk-ui";
import { AVAILABLE_TOTALS } from "../../constants/internal.js";
import { IAggregationsMenuTotalItem } from "../../types/menu.js";
import uniqWith from "lodash/uniqWith.js";
import isEqual from "lodash/isEqual.js";

export function useHeaderMenu(
    measureIdentifiers: string[],
    pivotAttributeDescriptors: IAttributeDescriptor[],
) {
    const { currentDataView } = useCurrentDataView();
    const { pushData, config, execution, rows, columns } = usePivotTableProps();

    const { rowTotals, columnTotals } = getTotalsFromExecutionDefinition(execution.definition);

    const tableData = currentDataView?.data().asTable();
    const rowAttributeDescriptors =
        tableData?.columnDefinitions
            .filter(isAttributeColumnDefinition)
            .map((columnDefinition) => columnDefinition.attributeDescriptor) ?? [];

    const aggregationsMenuItems = constructAggregationsMenuItems(
        measureIdentifiers,
        config.menu?.aggregationTypes ?? AVAILABLE_TOTALS,
        rowTotals,
        columnTotals,
        rows,
        columns,
        rowAttributeDescriptors,
        pivotAttributeDescriptors,
    );

    const handleItemClick = (item: IAggregationsMenuTotalItem) => {
        if (!pushData) {
            return;
        }

        const currentTotals = item.isColumn ? columnTotals : rowTotals;
        const newTotals = updateTotalDefinitions(currentTotals, item.totalDefinitions, item.isActive);

        if (item.isColumn) {
            pushData({
                properties: {
                    totals: newTotals,
                    bucketType: BucketNames.COLUMNS,
                },
            });
        } else {
            const sanitizedTotals = sanitizeTotals(execution.definition, newTotals);

            pushData({
                properties: {
                    totals: sanitizedTotals,
                    bucketType: BucketNames.ATTRIBUTE,
                },
            });
        }
    };

    return {
        isMenuEnabled: config.menu?.aggregations ?? false,
        handleItemClick,
        items: aggregationsMenuItems,
    };
}

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

/**
 * Updates total definitions in the current totals array.
 *
 * @remarks If the total definitions are active (all present in current totals),
 * they will be removed. If not active, they will be added and deduplicated.
 *
 * @param currentTotals - Array of existing totals
 * @param totalDefinitions - Array of total definitions to toggle
 * @param isActive - Whether the total definitions are currently active
 * @returns New array of totals with the definitions updated
 */
function updateTotalDefinitions(
    currentTotals: ITotal[],
    totalDefinitions: ITotal[],
    isActive: boolean,
): ITotal[] {
    if (isActive) {
        // Remove the total definitions from current totals
        return currentTotals.filter((total) => !totalDefinitions.some((def) => isEqual(def, total)));
    } else {
        // Add the total definitions to current totals and deduplicate
        return uniqWith([...currentTotals, ...totalDefinitions], isEqual);
    }
}
