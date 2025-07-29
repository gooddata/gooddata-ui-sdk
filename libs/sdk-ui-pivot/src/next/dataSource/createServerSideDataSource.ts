// (C) 2025 GoodData Corporation
import { IServerSideDatasource, IServerSideGetRowsParams, LoadSuccessParams } from "ag-grid-enterprise";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../types/public.js";
import { AgGridRowData } from "../types/internal.js";
import { getPaginatedExecutionDataView } from "../execution/getExecution.js";
import { AG_GRID_DEFAULT_CACHE_BLOCK_SIZE } from "../constants/agGrid.js";
import { IAttribute, IMeasure, ISortItem } from "@gooddata/sdk-model";
import { getDesiredSorts } from "../mapProps/mapSortModelToSortItems.js";
import {
    ITableColumnDefinitionByPivotOrLocalId,
    mapDataViewToAgGridRowData,
} from "../mapProps/mapDataViewToAgGridRowData.js";
import isEqual from "lodash/isEqual.js";

/**
 * @internal
 */
interface ICreateServerSideDataSourceParams {
    measures: IMeasure[];
    rows: IAttribute[];
    sortBy: ISortItem[];
    executionResult: IExecutionResult;
    isPivotMode: boolean;
    columnHeadersPosition: ColumnHeadersPosition;
    setCurrentDataView: (dataView: DataViewFacade | undefined) => void;
}

export const createServerSideDataSource = ({
    measures,
    rows,
    sortBy,
    executionResult,
    isPivotMode,
    columnHeadersPosition = "top",
    setCurrentDataView,
}: ICreateServerSideDataSourceParams): IServerSideDatasource<AgGridRowData> => {
    const abortController = new AbortController();
    let isFirstRequest = true;
    let resultColumnDefinitionByColId: ITableColumnDefinitionByPivotOrLocalId = {};

    return {
        destroy: () => {
            abortController.abort();
            // Clear the context when data source is destroyed
            setCurrentDataView(undefined);
        },
        getRows: async (params: IServerSideGetRowsParams<AgGridRowData>) => {
            const startRow = params.request.startRow ?? 0;
            const endRow = params.request.endRow ?? AG_GRID_DEFAULT_CACHE_BLOCK_SIZE;
            const sortModel = params.request.sortModel;

            const desiredSorts = getDesiredSorts(
                isFirstRequest,
                sortModel,
                sortBy,
                resultColumnDefinitionByColId,
            );

            let effectiveExecutionResult = executionResult;
            if (!isEqual(desiredSorts, sortBy)) {
                effectiveExecutionResult = await executionResult
                    .transform()
                    .withSorting(...desiredSorts)
                    .execute();
            }

            getPaginatedExecutionDataView({
                executionResult: effectiveExecutionResult,
                startRow,
                endRow,
            })
                .then((dataView) => {
                    const { rowData, grandTotalRowData, pivotResultFields, columnDefinitionByColId } =
                        mapDataViewToAgGridRowData(dataView, columnHeadersPosition);

                    const [rowsCount, _columnsCount] = dataView.dataView.totalCount;

                    // In case of single column attribute, without metrics and rows, backend returns 1 as number of rows, which is not correct.
                    const realRowsCount = measures.length === 0 && rows.length === 0 ? 0 : rowsCount;

                    const successParam: LoadSuccessParams<AgGridRowData> = {
                        rowData,
                        rowCount: realRowsCount,
                    };

                    if (isPivotMode) {
                        successParam.pivotResultFields = pivotResultFields;
                    }

                    resultColumnDefinitionByColId = columnDefinitionByColId;
                    setCurrentDataView(dataView);

                    params.success(successParam);
                    params.api.setGridOption("pinnedBottomRowData", grandTotalRowData);
                })
                .catch(() => {
                    params.fail();
                })
                .finally(() => {
                    isFirstRequest = false;
                });
        },
    };
};
