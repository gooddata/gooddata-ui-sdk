// (C) 2025 GoodData Corporation

import { IServerSideDatasource, IServerSideGetRowsParams, LoadSuccessParams } from "ag-grid-enterprise";
import { isEqual } from "lodash-es";

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IAttribute, IMeasure, ISeparators, ISortItem } from "@gooddata/sdk-model";
import { DataViewFacade, OnDataView, OnError, OnExportReady, convertError } from "@gooddata/sdk-ui";

import { agGridSetLoading } from "./agGridLoadingApi.js";
import { dataViewToRowData } from "./dataViewToRowData.js";
import { loadDataView } from "./loadDataView.js";
import { AgGridApi } from "../../types/agGrid.js";
import { GrandTotalsPosition } from "../../types/grandTotalsPosition.js";
import { AgGridRowData, IInitialExecutionData, ITableColumnDefinitionByColId } from "../../types/internal.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { handleExportReady } from "../exports/exports.js";
import { getSortModel } from "../sorting/agGridSortingApi.js";
import { sortModelToSortItems } from "../sorting/sortModelToSortItems.js";

/**
 * @internal
 */
interface ICreateServerSideDataSourceParams extends IInitialExecutionData {
    measures: IMeasure[];
    rows: IAttribute[];
    sortBy: ISortItem[];
    columnHeadersPosition: ColumnHeadersPosition;
    grandTotalsPosition: GrandTotalsPosition;
    separators?: ISeparators;
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    pageSize: number;
    setCurrentDataView: (dataView: DataViewFacade | undefined) => void;
    setPivotResultColumns: (gridApi: AgGridApi) => void;
    setGrandTotalRows: (gridApi: AgGridApi, grandTotalRowData: AgGridRowData[]) => void;
    initSizingForEmptyData: (gridApi: AgGridApi, rowData: AgGridRowData[]) => void;
    onDataView?: OnDataView;
    onError?: OnError;
    onExportReady?: OnExportReady;
    exportTitle?: string;
}

/**
 * Determines if the current page is the first or last page of data.
 * Used for non-pinned grand totals positioning to avoid duplicates.
 *
 * @internal
 */
function getPageFlags(
    dataView: DataViewFacade,
    measures: IMeasure[],
    rows: IAttribute[],
    startRow: number,
    endRow: number,
): { isFirstPage: boolean; isLastPage: boolean } {
    const [totalRowCount] = dataView.dataView.totalCount;
    // In case of single column attribute, without metrics and rows, backend returns 1 as number of rows, which is not correct.
    const actualRowCount = measures.length === 0 && rows.length === 0 ? 0 : totalRowCount;

    return {
        isFirstPage: startRow === 0,
        isLastPage: endRow >= actualRowCount,
    };
}

/**
 * Creates ag-grid server side data source for pivot table, that handles infinite-scrolling.
 * 
 * Handles also sorting changes, so component does not need to be fully re-initialized,
 * when sort is changed via ag-grid UI or programmatic sort model change.
 
 * @internal
 */
export const createServerSideDataSource = ({
    measures,
    rows,
    sortBy,
    initialExecutionResult,
    initialDataView,
    columnHeadersPosition,
    grandTotalsPosition,
    columnDefinitionByColId,
    pageSize,
    setCurrentDataView,
    setPivotResultColumns,
    setGrandTotalRows,
    initSizingForEmptyData,
    onDataView,
    onError,
    onExportReady,
    exportTitle,
    separators,
}: ICreateServerSideDataSourceParams): IServerSideDatasource<AgGridRowData> => {
    const abortController = new AbortController();

    let isFirstRequest = true;
    let lastSortBy = sortBy;
    // Keep track of the current execution result to ensure consistency across getRows calls
    let currentExecutionResult: IExecutionResult = initialExecutionResult;

    /**
     * There is 1 additional request when sorting + pivoting.
     * For some reason, ag-grid sends empty sort model in the first getRows request,
     * and then triggers another request with the correct sort model.
     */
    function handleExtraSortRequest(params: IServerSideGetRowsParams<AgGridRowData>) {
        setPivotResultColumns(params.api);

        // Extract grand total rows from initial data view (same as normal first request)
        // Determine page flags for proper grand totals positioning
        const { isFirstPage, isLastPage } = getPageFlags(
            initialDataView,
            measures,
            rows,
            params.request.startRow ?? 0,
            params.request.endRow ?? pageSize,
        );

        // This is the first page, but returns empty rowData
        const { grandTotalRowData, grandTotalCount } = dataViewToRowData(
            initialDataView,
            columnHeadersPosition,
            separators,
            grandTotalsPosition,
            isFirstPage,
            isLastPage,
        );

        const rowCount = fixRowsCount(initialDataView, measures, rows, grandTotalsPosition, grandTotalCount);

        // Set up grand totals as they may be missing
        setGrandTotalRows(params.api, grandTotalRowData);
        initSizingForEmptyData(params.api, []);

        isFirstRequest = false;

        params.success({
            rowData: [],
            rowCount,
        });
    }

    /**
     * Applies updated sort to execution result, if the sort model is changed.
     * Updates the currentExecutionResult to ensure subsequent calls use the correct execution.
     */
    async function applyChangedSortToExecutionResult(params: IServerSideGetRowsParams<AgGridRowData>) {
        // params.request.sortModel is out of sync (empty) with the first getRows request,
        // once fixed in ag-grid, we can replace getSortModel this with it
        const sortModel = getSortModel(params.api);
        const updatedSortBy = sortModelToSortItems(sortModel, columnDefinitionByColId);

        if (!isEqual(lastSortBy, updatedSortBy)) {
            // Always rebuild from the initial execution result to avoid accumulating
            // multiple layers of execution result decorators over time.
            currentExecutionResult = await initialExecutionResult
                .transform()
                .withSorting(...updatedSortBy)
                .execute();

            lastSortBy = updatedSortBy;
        }

        return currentExecutionResult;
    }

    return {
        destroy: () => {
            abortController.abort();
            // Clear the context when data source is destroyed
            setCurrentDataView(undefined);
        },
        getRows: async (params: IServerSideGetRowsParams<AgGridRowData>) => {
            try {
                if (sortBy.length > 0 && params.request.sortModel.length === 0 && isFirstRequest) {
                    handleExtraSortRequest(params);
                    return;
                }

                const executionResult = await applyChangedSortToExecutionResult(params);

                const startRow = params.request.startRow ?? 0;
                const endRow = params.request.endRow ?? pageSize;

                const nextDataView = isFirstRequest
                    ? initialDataView
                    : await loadDataView({
                          executionResult,
                          startRow,
                          endRow,
                      });

                // Determine if this is the first or last page for non-pinned grand totals
                const { isFirstPage, isLastPage } = getPageFlags(
                    nextDataView,
                    measures,
                    rows,
                    startRow,
                    endRow,
                );

                const { rowData, grandTotalRowData, grandTotalCount } = dataViewToRowData(
                    nextDataView,
                    columnHeadersPosition,
                    separators,
                    grandTotalsPosition,
                    isFirstPage,
                    isLastPage,
                );

                const successParam: LoadSuccessParams<AgGridRowData> = {
                    rowData,
                    rowCount: fixRowsCount(
                        nextDataView,
                        measures,
                        rows,
                        grandTotalsPosition,
                        grandTotalCount,
                    ),
                };

                params.success(successParam);

                if (isFirstRequest) {
                    setGrandTotalRows(params.api, grandTotalRowData);
                    initSizingForEmptyData(params.api, rowData);
                    isFirstRequest = false;
                    // Without setting pivot cols, tables without any row attributes do not work
                    setPivotResultColumns(params.api);
                }

                // After data is loaded with new sort, update the export function
                if (onExportReady) {
                    handleExportReady(nextDataView.result(), onExportReady, exportTitle);
                }

                setCurrentDataView(nextDataView);
                onDataView?.(nextDataView);
            } catch (e) {
                onError?.(convertError(e));
                params.fail();
            } finally {
                agGridSetLoading({ isLoading: false }, params.api);
            }
        },
    };
};

function fixRowsCount(
    dataView: DataViewFacade,
    measures: IMeasure[],
    rows: IAttribute[],
    grandTotalsPosition?: GrandTotalsPosition,
    grandTotalCount?: number,
) {
    const [rowsCount] = dataView.dataView.totalCount;
    // In case of single column attribute, without metrics and rows, backend returns 1 as number of rows, which is not correct.
    const baseRowCount = measures.length === 0 && rows.length === 0 ? 0 : rowsCount;

    // When grand totals are in regular row data (not pinned), add them to the row count
    if (
        grandTotalCount &&
        grandTotalCount > 0 &&
        grandTotalsPosition &&
        grandTotalsPosition !== "pinnedBottom" &&
        grandTotalsPosition !== "pinnedTop"
    ) {
        return baseRowCount + grandTotalCount;
    }

    return baseRowCount;
}
