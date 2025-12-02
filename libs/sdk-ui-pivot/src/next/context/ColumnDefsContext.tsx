// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useMemo } from "react";

import { useIntl } from "react-intl";

import { useInitialProp } from "@gooddata/sdk-ui/internal";

import { DrillableItemsRefProvider, useDrillableItemsRef } from "./DrillableItemsRefContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";
import { usePivotTableProps } from "./PivotTablePropsContext.js";
import { dataViewToColDefs } from "../features/data/dataViewToColDefs.js";

type IColumnDefsContext = ReturnType<typeof dataViewToColDefs>;

const ColumnDefsContext = createContext<IColumnDefsContext | undefined>(undefined);

/**
 * @internal
 */
export function ColumnDefsProvider({ children }: { children: ReactNode }) {
    return (
        <DrillableItemsRefProvider>
            <ColumnDefsProviderInner>{children}</ColumnDefsProviderInner>
        </DrillableItemsRefProvider>
    );
}

function ColumnDefsProviderInner({ children }: { children: ReactNode }) {
    const intl = useIntl();
    const initialExecutionData = useInitialExecution();
    const props = usePivotTableProps();
    const { config } = props;
    const {
        columnHeadersPosition,
        columnSizing: { columnWidths: initialColumnWidths },
        textWrapping,
    } = config;
    const { initialDataView } = initialExecutionData;
    const columnWidths = useInitialProp(initialColumnWidths);
    const drillableItemsRef = useDrillableItemsRef();

    const columnDefs = useMemo(() => {
        return dataViewToColDefs({
            dataView: initialDataView,
            columnHeadersPosition,
            columnWidths,
            drillableItemsRef,
            textWrapping,
            intl,
        });
    }, [initialDataView, columnHeadersPosition, columnWidths, textWrapping, intl, drillableItemsRef]);

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
