// (C) 2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";
import { SortChangedEvent } from "ag-grid-community";
import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import {
    ICorePivotTableInnerNextProps,
    ICorePivotTableNextProps,
    IPivotTableNextProps,
} from "./types/public.js";
import { useInitExecution, useInitExecutionResult } from "./hooks/useInitExecution.js";
import { useServerSideRowModel } from "./hooks/useServerSideRowModel.js";
import {
    getIsPivotMode,
    getMeasureGroupDimension,
    getExecutionProps,
    getColumnHeadersPosition,
} from "./mapProps/props.js";
import { mapDimensionsToColDefs } from "./mapProps/mapDimensionsToColDefs.js";
import { mapSortModelToSortItems } from "./mapProps/mapSortModelToSortItems.js";
import { AG_GRID_DEFAULT_PROPS } from "./constants/agGrid.js";
import { PAGE_SIZE } from "./constants/internal.js";
import isEqual from "lodash/isEqual.js";

/**
 * Simple wrapper for the core pivot table component that creates execution based on provided props.
 * There is no sophisticated props validation so when used directly, it is recommended to handle the validation yourself.
 *
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    const execution = useInitExecution(props);

    return <CorePivotTableNext {...props} execution={execution} />;
}

function CorePivotTableNext(props: ICorePivotTableNextProps) {
    const { execution, onLoadingChanged, pushData, onExportReady, pageSize = PAGE_SIZE } = props;
    const measureGroupDimension = getMeasureGroupDimension(props);
    const columnHeadersPosition = getColumnHeadersPosition(props);

    const {
        result: executionResult,
        status,
        error,
    } = useInitExecutionResult(
        execution,
        {
            onLoadingChanged,
            pushData,
            onExportReady,
        },
        {
            measureGroupDimension,
            columnHeadersPosition,
            pageSize,
        },
    );

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }

    return <RenderAgGrid {...props} executionResult={executionResult} />;
}

function RenderAgGrid(props: ICorePivotTableInnerNextProps) {
    useMemo(() => {
        ModuleRegistry.registerModules([
            // TODO: replace with used modules only (to decrease bundle size)
            AllEnterpriseModule,
        ]);
    }, []);

    const { executionResult, pushData } = props;
    const serverSideRowModelProps = useServerSideRowModel({ ...props, executionResult });
    const measureGroupDimension = getMeasureGroupDimension(props);
    const { sortBy, rows, measures } = getExecutionProps(props);

    const columnDefs = executionResult?.dimensions
        ? mapDimensionsToColDefs(executionResult.dimensions, measureGroupDimension, sortBy)
        : [];

    const isPivotMode = getIsPivotMode(props);

    const onSortChanged = useCallback(
        (event: SortChangedEvent) => {
            if (!pushData) {
                return;
            }

            // Get the current sort model from ag-grid
            const sortModel = event.api
                .getColumnState()
                .filter((col) => col.sort !== null)
                .map((col) => ({
                    colId: col.colId!,
                    sort: col.sort!,
                }));

            const sortItems = mapSortModelToSortItems(sortModel, rows, measures);

            pushData({
                properties: {
                    sortItems,
                },
            });
        },
        [pushData, rows, measures],
    );

    return (
        <AgGridReact
            {...AG_GRID_DEFAULT_PROPS}
            {...serverSideRowModelProps}
            columnDefs={columnDefs}
            pivotMode={isPivotMode}
            onSortChanged={onSortChanged}
        />
    );
}

/**
 * Memoized wrapper for the AgGridReact component that needs to be provided with prepared execution.
 *
 * @alpha
 */
const MemoizedCorePivotTableNext = React.memo(CorePivotTableNext, (prevProps, nextProps) => {
    // More specific comparison to avoid unnecessary re-renders
    const executionChanged = prevProps.execution.fingerprint() !== nextProps.execution.fingerprint();
    const configChanged = !isEqual(prevProps.config, nextProps.config);
    const measuresChanged = !isEqual(prevProps.measures, nextProps.measures);
    const rowsChanged = !isEqual(prevProps.rows, nextProps.rows);
    const columnsChanged = !isEqual(prevProps.columns, nextProps.columns);
    const filtersChanged = !isEqual(prevProps.filters, nextProps.filters);
    const sortChanged = !isEqual(prevProps.sortBy, nextProps.sortBy);
    const themeChanged = prevProps.theme !== nextProps.theme;

    return !(
        executionChanged ||
        configChanged ||
        measuresChanged ||
        rowsChanged ||
        columnsChanged ||
        filtersChanged ||
        sortChanged ||
        themeChanged
    );
});

export { MemoizedCorePivotTableNext as CorePivotTableNext };
