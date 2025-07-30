// (C) 2025 GoodData Corporation
import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";
import isEqual from "lodash/isEqual.js";
import flow from "lodash/flow.js";
import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { IPivotTableNextProps } from "./types/public.js";
import { ICorePivotTableNextProps, IInitialExecutionData } from "./types/internal.js";
import { useInitExecution, useInitExecutionResult } from "./features/dataLoading/useInitExecution.js";
import { useServerSideRowModelProps } from "./features/dataLoading/useServerSideRowModelProps.js";
import { useDrillingProps } from "./features/drilling/useDrillingProps.js";
import { useSortingProps } from "./features/sorting/useSortingProps.js";
import { TableMetadataProvider } from "./context/TableMetadataContext.js";
import { AG_GRID_DEFAULT_PROPS } from "./constants/agGrid.js";
import { useColumnSizingProps } from "./features/columnSizing/useColumnSizingProps.js";
import { useTextWrappingProps } from "./features/textWrapping/useTextWrappingProps.js";
import { PivotTablePropsProvider, usePivotTableProps } from "./context/PivotTablePropsContext.js";
import { dataViewToColumnDefs } from "./features/dataLoading/dataViewToColumnDefs.js";
import { useThemeProps } from "./features/styling/useThemeProps.js";
import { b } from "./features/styling/bem.js";

/**
 * Simple wrapper for the core pivot table component that creates execution based on provided props.
 * There is no sophisticated props validation so when used directly, it is recommended to handle the validation yourself.
 *
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    const execution = useInitExecution(props);

    return <PivotTableNextImplementation {...props} execution={execution} />;
}

function PivotTableNextImplementation(props: ICorePivotTableNextProps) {
    return (
        <PivotTablePropsProvider {...props}>
            <TableMetadataProvider>
                <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
                    <PivotTableNextLoading />
                </ThemeContextProvider>
            </TableMetadataProvider>
        </PivotTablePropsProvider>
    );
}

function PivotTableNextLoading() {
    const { result, status, error } = useInitExecutionResult();

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }
    const { initialExecutionResult, initialDataView } = result;

    return <RenderAgGrid initialExecutionResult={initialExecutionResult} initialDataView={initialDataView} />;
}

function RenderAgGrid(initialExecutionData: IInitialExecutionData) {
    useMemo(() => {
        ModuleRegistry.registerModules([
            // TODO: replace with used modules only (to decrease bundle size)
            AllEnterpriseModule,
        ]);
    }, []);

    const props = usePivotTableProps();
    const { sortBy, config, drillableItems } = props;
    const {
        columnHeadersPosition,
        columnSizing: { columnWidths },
    } = config;
    const { initialDataView } = initialExecutionData;

    const { columnDefs, isPivoted, columnDefinitionByColId } = useMemo(() => {
        return dataViewToColumnDefs(
            initialDataView,
            columnHeadersPosition,
            columnWidths,
            sortBy,
            drillableItems,
        );
    }, [initialDataView, columnHeadersPosition, columnWidths, sortBy, drillableItems]);

    const enhanceWithSorting = useSortingProps(columnDefinitionByColId);
    const enhanceWithDrilling = useDrillingProps();
    const enhanceWithTextWrapping = useTextWrappingProps();
    const enhanceWithColumnSizing = useColumnSizingProps();
    const enhanceWithServerSideRowModel = useServerSideRowModelProps(
        initialExecutionData,
        columnDefinitionByColId,
    );
    const enhanceWithTheme = useThemeProps();

    const agGridReactProps = useMemo(
        () =>
            flow(
                enhanceWithServerSideRowModel,
                enhanceWithColumnSizing,
                enhanceWithSorting,
                enhanceWithDrilling,
                enhanceWithTextWrapping,
                enhanceWithTheme,
            )(AG_GRID_DEFAULT_PROPS),
        [
            enhanceWithServerSideRowModel,
            enhanceWithColumnSizing,
            enhanceWithSorting,
            enhanceWithDrilling,
            enhanceWithTextWrapping,
            enhanceWithTheme,
        ],
    );

    return (
        <div className={b()}>
            <AgGridReact {...agGridReactProps} columnDefs={columnDefs} pivotMode={isPivoted} />
        </div>
    );
}

/**
 * Memoized wrapper for the AgGridReact component that needs to be provided with prepared execution.
 *
 * @internal
 */
export const CorePivotTableNext = React.memo(PivotTableNextImplementation, (prevProps, nextProps) => {
    // More specific comparison to avoid unnecessary re-renders
    const executionChanged = prevProps.execution.fingerprint() !== nextProps.execution.fingerprint();
    const configChanged = !isEqual(prevProps.config, nextProps.config);
    const measuresChanged = !isEqual(prevProps.measures, nextProps.measures);
    const rowsChanged = !isEqual(prevProps.rows, nextProps.rows);
    const columnsChanged = !isEqual(prevProps.columns, nextProps.columns);
    const filtersChanged = !isEqual(prevProps.filters, nextProps.filters);
    const sortChanged = !isEqual(prevProps.sortBy, nextProps.sortBy);
    const totalsChanged = !isEqual(prevProps.totals, nextProps.totals);
    const drillableItemsChanged = !isEqual(prevProps.drillableItems, nextProps.drillableItems);
    const themeChanged = prevProps.theme !== nextProps.theme;

    return !(
        executionChanged ||
        configChanged ||
        measuresChanged ||
        rowsChanged ||
        columnsChanged ||
        filtersChanged ||
        sortChanged ||
        totalsChanged ||
        drillableItemsChanged ||
        themeChanged
    );
});
