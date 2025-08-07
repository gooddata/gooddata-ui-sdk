// (C) 2025 GoodData Corporation
import { IServerSideDatasource, IServerSideGetRowsParams, LoadSuccessParams } from "ag-grid-enterprise";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { AgGridRowData, IInitialExecutionData, ITableColumnDefinitionByColId } from "../../types/internal.js";
import { IAttribute, IMeasure, ISortItem } from "@gooddata/sdk-model";
import { sortModelToSortItems } from "../sorting/sortModelToSortItems.js";
import { dataViewToRowData } from "./dataViewToRowData.js";
import isEqual from "lodash/isEqual.js";
import { getSortModel } from "../sorting/agGridSortingApi.js";
import { loadDataView } from "./loadDataView.js";
import { AgGridApi } from "../../types/agGrid.js";
import { agGridSetLoading } from "./agGridLoadingApi.js";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
interface ICreateServerSideDataSourceParams extends IInitialExecutionData {
    measures: IMeasure[];
    rows: IAttribute[];
    sortBy: ISortItem[];
    columnHeadersPosition: ColumnHeadersPosition;
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    pageSize: number;
    setCurrentDataView: (dataView: DataViewFacade | undefined) => void;
    setPivotResultColumns: (gridApi: AgGridApi) => void;
    setGrandTotalRows: (gridApi: AgGridApi, grandTotalRowData: AgGridRowData[]) => void;
    initSizingForEmptyData: (gridApi: AgGridApi, rowData: AgGridRowData[]) => void;
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
    columnDefinitionByColId,
    pageSize,
    setCurrentDataView,
    setPivotResultColumns,
    setGrandTotalRows,
    initSizingForEmptyData,
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
        const rowCount = fixRowsCount(initialDataView, measures, rows);
        setPivotResultColumns(params.api);
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
            currentExecutionResult = await currentExecutionResult
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

                const nextDataView = isFirstRequest
                    ? initialDataView
                    : await loadDataView({
                          executionResult,
                          startRow: params.request.startRow ?? 0,
                          endRow: params.request.endRow ?? pageSize,
                      });

                const { rowData, grandTotalRowData } = dataViewToRowData(nextDataView, columnHeadersPosition);

                const successParam: LoadSuccessParams<AgGridRowData> = {
                    rowData,
                    rowCount: fixRowsCount(nextDataView, measures, rows),
                };

                params.success(successParam);

                if (isFirstRequest) {
                    setGrandTotalRows(params.api, grandTotalRowData);
                    initSizingForEmptyData(params.api, rowData);
                    isFirstRequest = false;
                    agGridSetLoading({ isLoading: false }, params.api);
                    // Without setting pivot cols, tables without any row attributes do not work
                    setPivotResultColumns(params.api);
                }

                setCurrentDataView(nextDataView);
            } catch {
                params.fail();
            }
        },
    };
};

function fixRowsCount(dataView: DataViewFacade, measures: IMeasure[], rows: IAttribute[]) {
    const [rowsCount] = dataView.dataView.totalCount;
    // // In case of single column attribute, without metrics and rows, backend returns 1 as number of rows, which is not correct.
    return measures.length === 0 && rows.length === 0 ? 0 : rowsCount;
}
