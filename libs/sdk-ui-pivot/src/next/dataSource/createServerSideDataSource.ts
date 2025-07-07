// (C) 2025 GoodData Corporation
import { IServerSideDatasource, IServerSideGetRowsParams, LoadSuccessParams } from "ag-grid-enterprise";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { ColumnHeadersPosition } from "../types/public.js";
import { AgGridRowData } from "../types/internal.js";
import { getPaginatedExecutionDataView } from "../execution/getExecution.js";
import { mapDataViewToAgGridRowData } from "../mapProps/mapDataViewToAgGridRowData.js";
import { AG_GRID_DEFAULT_CACHE_BLOCK_SIZE } from "../constants/agGrid.js";
import { IAttribute, IMeasure } from "@gooddata/sdk-model";

/**
 * @internal
 */
interface ICreateServerSideDataSourceParams {
    measures: IMeasure[];
    rows: IAttribute[];
    executionResult: IExecutionResult;
    isPivotMode: boolean;
    columnHeadersPosition: ColumnHeadersPosition;
}

export const createServerSideDataSource = ({
    measures,
    rows,
    executionResult,
    isPivotMode,
    columnHeadersPosition = "top",
}: ICreateServerSideDataSourceParams): IServerSideDatasource<AgGridRowData> => {
    const abortController = new AbortController();

    return {
        destroy: () => {
            abortController.abort();
        },
        getRows: (params: IServerSideGetRowsParams<AgGridRowData>) => {
            const startRow = params.request.startRow ?? 0;
            const endRow = params.request.endRow ?? AG_GRID_DEFAULT_CACHE_BLOCK_SIZE;
            getPaginatedExecutionDataView({
                executionResult,
                startRow,
                endRow,
            })
                .then((dataView) => {
                    const { rowData, pivotResultFields } = mapDataViewToAgGridRowData(
                        dataView,
                        columnHeadersPosition,
                    );

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
                    params.success(successParam);
                })
                .catch(() => {
                    params.fail();
                });
        },
    };
};
