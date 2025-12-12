// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { type GridReadyEvent } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useAgGridApi } from "../context/AgGridApiContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid instance api if available.
 *
 * @alpha
 */
export function useAgGridApiProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { setAgGridApi } = useAgGridApi();

    const onGridReady = useCallback(
        (event: GridReadyEvent) => {
            setAgGridApi(event.api);
        },
        [setAgGridApi],
    );

    const onGridPreDestroyed = useCallback(() => {
        setAgGridApi(null);
    }, [setAgGridApi]);

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.onGridReady) {
                throw new UnexpectedSdkError("onGridReady is already set");
            }
            if (agGridReactProps.onGridPreDestroyed) {
                throw new UnexpectedSdkError("onGridPreDestroyed is already set");
            }
            return {
                ...agGridReactProps,
                onGridReady,
                onGridPreDestroyed,
            };
        },
        [onGridReady, onGridPreDestroyed],
    );
}
