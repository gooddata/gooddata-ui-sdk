// (C) 2025 GoodData Corporation
import React, { useMemo } from "react";

import { AllEnterpriseModule, ModuleRegistry } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { IntlProvider } from "react-intl";

import { DefaultLocale } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { ColumnDefsProvider } from "./context/ColumnDefsContext.js";
import { CurrentDataViewProvider } from "./context/CurrentDataViewContext.js";
import { InitialExecutionContextProvider } from "./context/InitialExecutionContext.js";
import { PivotTablePropsProvider } from "./context/PivotTablePropsContext.js";
import { b } from "./features/styling/bem.js";
import { useInitExecution } from "./hooks/init/useInitExecution.js";
import { useInitExecutionResult } from "./hooks/init/useInitExecutionResult.js";
import { useAgGridReactProps } from "./hooks/useAgGridReactProps.js";
import { ICorePivotTableNextProps } from "./types/internal.js";
import { IPivotTableNextProps } from "./types/public.js";

/**
 * Note: The controller instance uses base z-index 6000 so overlays spawned by the pivot table
 * align with KD drilling overlay stacking.
 */
const pivotOverlayController = OverlayController.getInstance(6000);

/**
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    const execution = useInitExecution(props);

    return <PivotTableNextImplementation {...props} execution={execution} />;
}

/**
 * @internal
 */
export function PivotTableNextImplementation(props: ICorePivotTableNextProps) {
    return (
        <PivotTablePropsProvider {...props}>
            <CurrentDataViewProvider>
                <IntlProvider locale={props.locale ?? DefaultLocale}>
                    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
                        <OverlayControllerProvider overlayController={pivotOverlayController}>
                            <PivotTableNextWithInitialization />
                        </OverlayControllerProvider>
                    </ThemeContextProvider>
                </IntlProvider>
            </CurrentDataViewProvider>
        </PivotTablePropsProvider>
    );
}

function PivotTableNextWithInitialization() {
    const { result, status, error } = useInitExecutionResult();

    if (status === "error") {
        return <ErrorComponent error={error} />;
    }

    if (status === "pending" || status === "loading") {
        return <LoadingComponent />;
    }
    const { initialExecutionResult, initialDataView } = result;

    return (
        <InitialExecutionContextProvider
            initialExecutionResult={initialExecutionResult}
            initialDataView={initialDataView}
        >
            <ColumnDefsProvider>
                <RenderPivotTableNextAgGrid />
            </ColumnDefsProvider>
        </InitialExecutionContextProvider>
    );
}

function RenderPivotTableNextAgGrid() {
    const agGridReactProps = useAgGridReactProps();

    useMemo(() => {
        ModuleRegistry.registerModules([
            // TODO: replace with used modules only (to decrease bundle size)
            AllEnterpriseModule,
        ]);
    }, []);

    return (
        <div className={b()}>
            <AgGridReact {...agGridReactProps} />
        </div>
    );
}
