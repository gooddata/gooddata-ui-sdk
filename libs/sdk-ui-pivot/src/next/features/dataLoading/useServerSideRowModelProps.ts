// (C) 2025 GoodData Corporation
import { useCallback, useMemo } from "react";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGrid.js";
import { createServerSideDataSource } from "./createServerSideDataSource.js";
import { useTableMetadata } from "../../context/TableMetadataContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridProps } from "../../types/agGrid.js";
import { IInitialExecutionData, ITableColumnDefinitionByColId } from "../../types/internal.js";

/**
 * @alpha
 */
export const useServerSideRowModelProps = (
    initialExecutionData: IInitialExecutionData,
    columnDefinitionByColId: ITableColumnDefinitionByColId,
): ((agGridReactProps: AgGridProps) => AgGridProps) => {
    const { initialExecutionResult, initialDataView } = initialExecutionData;
    const props = usePivotTableProps();
    const { rows, measures, sortBy, config, drillableItems } = props;
    const { columnHeadersPosition, columnSizing } = config;
    const isPivotMode = props.columns.length > 0;

    const { setCurrentDataView } = useTableMetadata();

    const dataSource = useMemo(
        () =>
            createServerSideDataSource({
                rows,
                measures,
                sortBy,
                isPivotMode,
                columnHeadersPosition,
                setCurrentDataView,
                columnSizing,
                initialExecutionResult,
                initialDataView,
                columnDefinitionByColId,
                drillableItems,
            }),
        [
            rows,
            measures,
            sortBy,
            isPivotMode,
            columnHeadersPosition,
            columnSizing,
            initialExecutionResult,
            initialDataView,
            columnDefinitionByColId,
            setCurrentDataView,
            drillableItems,
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

            return {
                ...agGridReactProps,
                rowModelType: "serverSide",
                serverSideDatasource: dataSource,
                serverSidePivotResultFieldSeparator: AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR,
            };
        },
        [dataSource],
    );
};
