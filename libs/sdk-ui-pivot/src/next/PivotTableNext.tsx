// (C) 2025 GoodData Corporation
import React, { useMemo } from "react";

import { AllEnterpriseModule, ModuleRegistry } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { OVERLAY_CONTROLLER_Z_INDEX } from "./constants/internal.js";
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

const pivotOverlayController = OverlayController.getInstance(OVERLAY_CONTROLLER_Z_INDEX);

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
                <IntlWrapper locale={props.locale}>
                    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
                        <OverlayControllerProvider overlayController={pivotOverlayController}>
                            <PivotTableNextWithInitialization />
                        </OverlayControllerProvider>
                    </ThemeContextProvider>
                </IntlWrapper>
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
