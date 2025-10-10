// (C) 2025 GoodData Corporation

import { CSSProperties, FocusEvent, MouseEvent, useCallback, useMemo } from "react";

import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { AvoidResizeFlickering } from "./components/AvoidResizeFlickering.js";
import { ErrorComponent } from "./components/ErrorComponent.js";
import { LoadingComponent } from "./components/LoadingComponent.js";
import { OVERLAY_CONTROLLER_Z_INDEX } from "./constants/internal.js";
import { AgGridApiProvider, useAgGridApi } from "./context/AgGridApiContext.js";
import { ColumnDefsProvider } from "./context/ColumnDefsContext.js";
import { CurrentDataViewProvider } from "./context/CurrentDataViewContext.js";
import { InitialExecutionContextProvider } from "./context/InitialExecutionContext.js";
import { PivotTablePropsProvider, usePivotTableProps } from "./context/PivotTablePropsContext.js";
import { b } from "./features/styling/bem.js";
import { useInitExecution } from "./hooks/init/useInitExecution.js";
import { useInitExecutionResult } from "./hooks/init/useInitExecutionResult.js";
import { useAgGridReactProps } from "./hooks/useAgGridReactProps.js";
import { useClearCellSelection } from "./hooks/useClearCellSelection.js";
import { useResolvedProps } from "./hooks/useResolvedProps.js";
import { ICorePivotTableNextProps } from "./types/internal.js";
import { IPivotTableNextProps } from "./types/public.js";

const pivotOverlayController = OverlayController.getInstance(OVERLAY_CONTROLLER_Z_INDEX);

/**
 * @alpha
 */
export function PivotTableNext(props: IPivotTableNextProps) {
    const resolvedProps = useResolvedProps(props);
    const execution = useInitExecution(resolvedProps);

    return <PivotTableNextImplementation {...resolvedProps} execution={execution} />;
}

/**
 * @internal
 */
export function PivotTableNextImplementation(props: ICorePivotTableNextProps) {
    return (
        <AgGridApiProvider>
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
        </AgGridApiProvider>
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
    const { config } = usePivotTableProps();
    const { setContainerWidth } = useAgGridApi();
    const clearCellSelection = useClearCellSelection();

    useMemo(() => {
        if (config.agGridToken) {
            LicenseManager.setLicenseKey(config.agGridToken);
        }
    }, [config.agGridToken]);

    useMemo(() => {
        ModuleRegistry.registerModules([
            // TODO: replace with used modules only (to decrease bundle size)
            AllEnterpriseModule,
        ]);
    }, []);

    const stopEventWhenResizeHeader = (e: MouseEvent): void => {
        // Prevents triggering drag and drop in dashboard edit mode
        if ((e.target as Element)?.className?.includes?.("ag-header-cell-resize")) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleBlur = useCallback(
        (e: FocusEvent<HTMLDivElement>) => {
            // Only clear selection if focus is moving outside the table container
            if (!e.currentTarget.contains(e.relatedTarget)) {
                clearCellSelection();
            }
        },
        [clearCellSelection],
    );

    return (
        <AvoidResizeFlickering>
            {({ isReadyForInitialPaint }) => {
                const isAutoHeight = agGridReactProps.domLayout === "autoHeight";
                const containerStyle: CSSProperties = {
                    height: config.maxHeight ?? "100%",
                    overflowX: "hidden",
                    overflowY: isAutoHeight ? "auto" : "hidden",
                    visibility: isReadyForInitialPaint ? "visible" : "hidden",
                };
                return (
                    <div
                        ref={(element) => {
                            if (element) setContainerWidth(element.clientWidth);
                        }}
                        className={b()}
                        style={containerStyle}
                        onMouseDown={stopEventWhenResizeHeader}
                        onDragStart={stopEventWhenResizeHeader}
                        onClick={stopEventWhenResizeHeader}
                        onBlur={handleBlur}
                        data-testid={isReadyForInitialPaint ? "pivot-table-next" : undefined}
                    >
                        <AgGridReact {...agGridReactProps} />
                    </div>
                );
            }}
        </AvoidResizeFlickering>
    );
}
