// (C) 2025 GoodData Corporation
import React, { useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";
import { SortChangedEvent } from "ag-grid-community";
import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { ICorePivotTableNextProps, IPivotTableNextProps } from "./types/public.js";
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
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

ModuleRegistry.registerModules([
    // TODO: replace with used modules only (to decrease bundle size)
    AllEnterpriseModule,
]);

/**
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    const execution = useInitExecution(props);

    return <CorePivotTableNext {...props} execution={execution} />;
}

/**
 * @alpha
 */
export const CorePivotTableNext = function CorePivotTableNext(props: ICorePivotTableNextProps) {
    const { execution, onLoadingChanged, pushData, onExportReady, pageSize = PAGE_SIZE } = props;
    const measureGroupDimension = getMeasureGroupDimension(props);
    const columnHeadersPosition = getColumnHeadersPosition(props);

    const {
        result: executionResult,
        status,
        error,
    } = useInitExecutionResult(execution, {
        onLoadingChanged,
        pushData,
        onExportReady,
        measureGroupDimension,
        columnHeadersPosition,
        pageSize,
    });

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }

    return <PivotTableNextRenderAgGrid {...props} executionResult={executionResult} />;
};

function PivotTableNextRenderAgGrid(props: ICorePivotTableNextProps & { executionResult: IExecutionResult }) {
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
