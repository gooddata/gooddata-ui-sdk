// (C) 2025 GoodData Corporation
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { dataViewToColDefs } from "../features/data/dataViewToColDefs.js";
import { usePivotTableProps } from "./PivotTablePropsContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";

type IColumnDefsContext = ReturnType<typeof dataViewToColDefs>;

const ColumnDefsContext = createContext<IColumnDefsContext | undefined>(undefined);

/**
 * @internal
 */
export function ColumnDefsProvider({ children }: { children: ReactNode }) {
    const initialExecutionData = useInitialExecution();
    const props = usePivotTableProps();
    const { config, drillableItems } = props;
    const {
        columnHeadersPosition,
        columnSizing: { columnWidths },
        textWrapping,
    } = config;
    const { initialDataView } = initialExecutionData;

    const columnDefs = useMemo(() => {
        return dataViewToColDefs({
            dataView: initialDataView,
            columnHeadersPosition,
            columnWidths,
            drillableItems,
            textWrapping,
        });
    }, [initialDataView, columnHeadersPosition, columnWidths, drillableItems, textWrapping]);

    return <ColumnDefsContext.Provider value={columnDefs}>{children}</ColumnDefsContext.Provider>;
}

/**
 * @internal
 */
export function useColumnDefs(): IColumnDefsContext {
    const context = useContext(ColumnDefsContext);

    if (context === undefined) {
        throw new Error("useColumnDefs must be used within a ColumnDefsProvider");
    }

    return context;
}
