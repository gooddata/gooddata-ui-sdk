// (C) 2025 GoodData Corporation
import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";
import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { IPivotTableNextProps } from "./types/public.js";
import { useInitExecution } from "./hooks/useInitExecution.js";
import { useServerSideRowModel } from "./hooks/useServerSideRowModel.js";
import { getIsPivotMode, getMeasureGroupDimension, getExecutionProps } from "./mapProps/props.js";
import { mapDimensionsToColDefs } from "./mapProps/mapDimensionsToColDefs.js";
import { AG_GRID_DEFAULT_PROPS } from "./constants/agGrid.js";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

ModuleRegistry.registerModules([
    // TODO: replace with used modules only (to decrease bundle size)
    AllEnterpriseModule,
]);

/**
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    return <PivotTableNextInit {...props} />;
}

function PivotTableNextInit(props: IPivotTableNextProps) {
    const { result: executionResult, status, error } = useInitExecution(props);

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }

    return <PivotTableNextRenderAgGrid {...props} executionResult={executionResult} />;
}

function PivotTableNextRenderAgGrid(
    props: IPivotTableNextProps & {
        executionResult: IExecutionResult;
    },
) {
    const { executionResult } = props;
    const serverSideRowModelProps = useServerSideRowModel({ ...props, executionResult });
    const measureGroupDimension = getMeasureGroupDimension(props);
    const { sortBy } = getExecutionProps(props);

    const columnDefs = executionResult?.dimensions
        ? mapDimensionsToColDefs(executionResult.dimensions, measureGroupDimension, sortBy)
        : [];

    const isPivotMode = getIsPivotMode(props);

    return (
        <AgGridReact
            {...AG_GRID_DEFAULT_PROPS}
            {...serverSideRowModelProps}
            columnDefs={columnDefs}
            pivotMode={isPivotMode}
        />
    );
}
