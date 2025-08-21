// (C) 2025 GoodData Corporation
import { useCallback, useMemo } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useSetAgGridPivotResultColumns } from "./columns/useSetAgGridPivotResultColumns.js";
import { useInitSizingForEmptyData } from "./resizing/useInitSizingForEmptyData.js";
import { useGrandTotalRows } from "./useGrandTotalRows.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../constants/agGridDefaultProps.js";
import { useColumnDefs } from "../context/ColumnDefsContext.js";
import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { useInitialExecution } from "../context/InitialExecutionContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { createServerSideDataSource } from "../features/data/createServerSideDataSource.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with data loading applied.
 
 * @alpha
 */
export const useDataLoadingProps = (): ((agGridReactProps: AgGridProps) => AgGridProps) => {
    const props = usePivotTableProps();
    const { initialExecutionResult, initialDataView } = useInitialExecution();
    const { columnDefinitionByColId } = useColumnDefs();
    const { setGrandTotalRows } = useGrandTotalRows();
    const { initSizingForEmptyData } = useInitSizingForEmptyData();
    const { setPivotResultColumns } = useSetAgGridPivotResultColumns();

    const { rows, measures, sortBy, config, pageSize, onDataView } = props;
    const { columnHeadersPosition } = config;

    const { setCurrentDataView } = useCurrentDataView();

    const dataSource = useMemo(
        () =>
            createServerSideDataSource({
                rows,
                measures,
                sortBy,
                columnHeadersPosition,
                setCurrentDataView,
                initialExecutionResult,
                initialDataView,
                columnDefinitionByColId,
                setPivotResultColumns,
                setGrandTotalRows,
                initSizingForEmptyData,
                pageSize,
                onDataView,
            }),
        [
            rows,
            measures,
            sortBy,
            columnHeadersPosition,
            initialExecutionResult,
            initialDataView,
            columnDefinitionByColId,
            setCurrentDataView,
            setPivotResultColumns,
            setGrandTotalRows,
            initSizingForEmptyData,
            pageSize,
            onDataView,
        ],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.rowModelType) {
                throw new UnexpectedSdkError("rowModelType is already set");
            }

            if (agGridReactProps.serverSideDatasource) {
                throw new UnexpectedSdkError("serverSideDatasource is already set");
            }

            if (agGridReactProps.serverSidePivotResultFieldSeparator) {
                throw new UnexpectedSdkError("serverSidePivotResultFieldSeparator is already set");
            }
            if (agGridReactProps.cacheBlockSize) {
                throw new UnexpectedSdkError("cacheBlockSize is already set");
            }

            return {
                ...agGridReactProps,
                rowModelType: "serverSide",
                serverSideDatasource: dataSource,
                serverSidePivotResultFieldSeparator: AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR,
                cacheBlockSize: pageSize,
            };
        },
        [dataSource, pageSize],
    );
};
