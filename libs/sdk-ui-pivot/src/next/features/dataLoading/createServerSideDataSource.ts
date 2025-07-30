// (C) 2025 GoodData Corporation
import { IServerSideDatasource, IServerSideGetRowsParams, LoadSuccessParams } from "ag-grid-enterprise";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/public.js";
import { AgGridRowData, IInitialExecutionData, ITableColumnDefinitionByColId } from "../../types/internal.js";
import { getPaginatedExecutionDataView } from "./getExecution.js";
import { AG_GRID_DEFAULT_CACHE_BLOCK_SIZE } from "../../constants/agGrid.js";
import { IAttribute, IMeasure, ISortItem } from "@gooddata/sdk-model";
import { sortModelToSortItems } from "../sorting/sortModelToSortItems.js";
import { dataViewToRowData } from "./dataViewToRowData.js";
import { dataViewToColumnDefs } from "./dataViewToColumnDefs.js";
import isEqual from "lodash/isEqual.js";
import { IColumnSizing } from "../../types/sizing.js";
import { agGridSetGrandTotalRows } from "../totals/agGridTotalsApi.js";
import { agGridUpdateColumnSizeForEmptyData } from "../../features/columnSizing/agGridColumnSizingApi.js";
import { agGridSetPivotResultColumns } from "../../features/pivoting/agGridPivotingApi.js";
import { getSortModel } from "../sorting/agGridSortingApi.js";

/**
 * @internal
 */
interface ICreateServerSideDataSourceParams extends IInitialExecutionData {
    measures: IMeasure[];
    rows: IAttribute[];
    sortBy: ISortItem[];
    isPivotMode: boolean;
    columnHeadersPosition: ColumnHeadersPosition;
    setCurrentDataView: (dataView: DataViewFacade | undefined) => void;
    columnSizing: IColumnSizing;
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    drillableItems: ExplicitDrill[];
}

export const createServerSideDataSource = ({
    measures,
    rows,
    sortBy,
    initialExecutionResult,
    initialDataView,
    isPivotMode,
    setCurrentDataView,
    columnHeadersPosition,
    columnSizing,
    columnDefinitionByColId,
    drillableItems,
}: ICreateServerSideDataSourceParams): IServerSideDatasource<AgGridRowData> => {
    const abortController = new AbortController();

    let isFirstRequest = true;

    const columnWidths = columnSizing.columnWidths ?? [];

    return {
        destroy: () => {
            abortController.abort();
            // Clear the context when data source is destroyed
            setCurrentDataView(undefined);
        },
        getRows: async (params: IServerSideGetRowsParams<AgGridRowData>) => {
            try {
                // params.request.sortModel is out of sync (empty) with the first getRows request,
                // once fixed in ag-grid, we can replace getSortModel this with it
                const sortModel = getSortModel(params.api);

                const startRow = params.request.startRow ?? 0;
                const endRow = params.request.endRow ?? AG_GRID_DEFAULT_CACHE_BLOCK_SIZE; // TODO: replace with page size

                const updatedSortBy = sortModelToSortItems(sortModel, columnDefinitionByColId);

                let effectiveExecutionResult = initialExecutionResult;

                if (!isEqual(sortBy, updatedSortBy)) {
                    effectiveExecutionResult = await initialExecutionResult
                        .transform()
                        .withSorting(...updatedSortBy)
                        .execute();
                }

                const dataView = isFirstRequest
                    ? initialDataView
                    : await getPaginatedExecutionDataView({
                          executionResult: effectiveExecutionResult,
                          startRow,
                          endRow,
                      });

                const { columnDefs } = dataViewToColumnDefs(
                    dataView,
                    columnHeadersPosition,
                    columnWidths,
                    updatedSortBy,
                    drillableItems,
                );

                const { rowData, grandTotalRowData } = dataViewToRowData(dataView, columnHeadersPosition);

                const [rowsCount, _columnsCount] = dataView.dataView.totalCount;

                // In case of single column attribute, without metrics and rows, backend returns 1 as number of rows, which is not correct.
                const realRowsCount = measures.length === 0 && rows.length === 0 ? 0 : rowsCount;

                const successParam: LoadSuccessParams<AgGridRowData> = {
                    rowData,
                    rowCount: realRowsCount,
                };

                if (isPivotMode) {
                    agGridSetPivotResultColumns({ colDefs: columnDefs }, params.api);
                }

                if (grandTotalRowData.length) {
                    agGridSetGrandTotalRows({ grandTotalRowData }, params.api);
                }

                if (startRow === 0 && !rowData.length) {
                    agGridUpdateColumnSizeForEmptyData({ columnSizing }, params.api);
                }

                setCurrentDataView(dataView);

                params.success(successParam);
            } catch (err) {
                console.error("Error in getRows", err);
                params.fail();
            } finally {
                isFirstRequest = false;
            }
        },
    };
};
