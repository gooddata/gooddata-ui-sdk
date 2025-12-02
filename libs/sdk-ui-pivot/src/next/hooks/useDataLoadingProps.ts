// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { useInitialProp } from "@gooddata/sdk-ui/internal";

import { useSetAgGridPivotResultColumns } from "./columns/useSetAgGridPivotResultColumns.js";
import { useInitSizingForEmptyData } from "./resizing/useInitSizingForEmptyData.js";
import { useGrandTotalRows } from "./useGrandTotalRows.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../constants/agGridDefaultProps.js";
import { useColumnDefs } from "../context/ColumnDefsContext.js";
import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { useInitialExecution } from "../context/InitialExecutionContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { useRuntimeError } from "../context/RuntimeErrorContext.js";
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
    const { setRuntimeError } = useRuntimeError();

    const { rows, measures, sortBy, config, pageSize, onDataView, onExportReady, exportTitle } = props;
    const { columnHeadersPosition, separators, grandTotalsPosition = "pinnedBottom" } = config;

    const { setCurrentDataView } = useCurrentDataView();

    const initialSortBy = useInitialProp(sortBy);

    const dataSource = useMemo(
        () =>
            createServerSideDataSource({
                rows,
                measures,
                sortBy: initialSortBy,
                columnHeadersPosition,
                grandTotalsPosition,
                setCurrentDataView,
                initialExecutionResult,
                initialDataView,
                columnDefinitionByColId,
                setPivotResultColumns,
                setGrandTotalRows,
                initSizingForEmptyData,
                pageSize,
                onDataView,
                onExportReady,
                exportTitle,
                separators,
                setRuntimeError,
            }),
        [
            rows,
            measures,
            initialSortBy,
            columnHeadersPosition,
            grandTotalsPosition,
            initialExecutionResult,
            initialDataView,
            columnDefinitionByColId,
            setCurrentDataView,
            setPivotResultColumns,
            setGrandTotalRows,
            initSizingForEmptyData,
            pageSize,
            onDataView,
            onExportReady,
            exportTitle,
            separators,
            setRuntimeError,
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
