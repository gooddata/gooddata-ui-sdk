// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import {
    IAttributeDescriptor,
    IBucket,
    IExecutionDefinition,
    ITotal,
    isMeasureValueFilter,
    isRankingFilter,
    measureValueFilterCondition,
} from "@gooddata/sdk-model";
import { BucketNames, isAttributeColumnDefinition } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import { constructAggregationsMenuItems } from "../../components/Header/utils/constructAggregationsMenuItems.js";
import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { IAggregationsSubMenuItem } from "../../types/menu.js";
import { useUpdateTotals } from "../totals/useUpdateTotals.js";

/**
 * Hook for header cell components that handles menu items and callbacks.
 *
 * @param measureIdentifiers - Array of measure identifiers for the cell
 * @param pivotAttributeDescriptors - Array of pivot attribute descriptors
 * @param gridApi - Optional ag-grid API for checking current text wrapping state
 * @returns Menu items and callbacks
 */
export const useHeaderMenuAggregations = (
    measureIdentifiers: string[],
    pivotAttributeDescriptors: IAttributeDescriptor[],
) => {
    const intl = useIntl();
    const { currentDataView } = useCurrentDataView();
    const { config, execution, rows, columns } = usePivotTableProps();
    const { onUpdateTotals } = useUpdateTotals();

    const { rowTotals, columnTotals } = getTotalsFromExecutionDefinition(execution.definition);

    const tableData = currentDataView?.data().asTable();
    const rowAttributeDescriptors =
        tableData?.columnDefinitions
            .filter(isAttributeColumnDefinition)
            .map((columnDefinition) => columnDefinition.attributeDescriptor) ?? [];

    const hasMeasureValueFilter = execution.definition.filters.some(
        (f) => isMeasureValueFilter(f) && !!measureValueFilterCondition(f),
    );
    const hasRankingFilter = execution.definition.filters.some(isRankingFilter);
    const disableRollupTotalTooltip = hasMeasureValueFilter
        ? intl.formatMessage(messages["disabled.mvf"])
        : hasRankingFilter
          ? intl.formatMessage(messages["disabled.ranking"])
          : undefined;

    const aggregationsItems = config.menu?.aggregations
        ? constructAggregationsMenuItems(
              measureIdentifiers,
              rowTotals,
              columnTotals,
              rows,
              columns,
              rowAttributeDescriptors,
              pivotAttributeDescriptors,
              config.menu,
              intl,
              disableRollupTotalTooltip,
          )
        : [];

    const handleAggregationsItemClick = (item: IAggregationsSubMenuItem) => {
        const currentTotals = item.isColumn ? columnTotals : rowTotals;

        onUpdateTotals(currentTotals, item.totalDefinitions, item.isActive, item.isColumn);
    };

    return {
        aggregationsItems,
        handleAggregationsItemClick,
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
