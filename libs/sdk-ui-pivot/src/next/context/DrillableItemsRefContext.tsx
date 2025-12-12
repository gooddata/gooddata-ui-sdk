// (C) 2025 GoodData Corporation

import { type ReactNode, type RefObject, createContext, useContext, useRef } from "react";

import { type ExplicitDrill } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "./PivotTablePropsContext.js";

type IDrillableItemsRefContext = RefObject<ExplicitDrill[]>;

const DrillableItemsRefContext = createContext<IDrillableItemsRefContext | undefined>(undefined);

/**
 * Provides a stable ref to drillableItems that can be read from ag-grid callbacks
 * without causing column definition recreation when drillableItems change.
 *
 * WHY REF: drillableItems changes during dashboard init ([] → populated).
 * If drillableItems were in useMemo deps for columnDefs, columnDefs would recreate,
 * causing DataSource recreation. For tables with initial sort, this triggers
 * double execution due to ag-grid's SSRM quirk.
 *
 * @internal
 */
export function DrillableItemsRefProvider({ children }: { children: ReactNode }) {
    const { drillableItems } = usePivotTableProps();
    const drillableItemsRef = useRef(drillableItems);
    drillableItemsRef.current = drillableItems;

    return (
        <DrillableItemsRefContext.Provider value={drillableItemsRef}>
            {children}
        </DrillableItemsRefContext.Provider>
    );
}

/**
 * @internal
 */
export function useDrillableItemsRef(): IDrillableItemsRefContext {
    const context = useContext(DrillableItemsRefContext);

    if (context === undefined) {
        throw new Error("useDrillableItemsRef must be used within a DrillableItemsRefProvider");
    }

    return context;
}
