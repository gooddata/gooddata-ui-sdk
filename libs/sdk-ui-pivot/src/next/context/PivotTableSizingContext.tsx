// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

type IPivotTableSizingStateContext = {
    containerWidth: number;
};

type IPivotTableSizingActionsContext = {
    setContainerWidth: (width: number) => void;
};

// Keep state and actions in separate contexts so components that only dispatch
// (e.g. setContainerWidth) do not re-render on every sizing state change.
const PivotTableSizingStateContext = createContext<IPivotTableSizingStateContext | undefined>(undefined);
const PivotTableSizingActionsContext = createContext<IPivotTableSizingActionsContext | undefined>(undefined);

/**
 * @internal
 */
export function PivotTableSizingProvider({ children }: { children: ReactNode }) {
    const [containerWidth, setContainerWidth] = useState(0);

    const stateValue = useMemo<IPivotTableSizingStateContext>(
        () => ({
            containerWidth,
        }),
        [containerWidth],
    );

    const actionsValue = useMemo<IPivotTableSizingActionsContext>(
        () => ({
            setContainerWidth,
        }),
        [setContainerWidth],
    );

    return (
        <PivotTableSizingActionsContext.Provider value={actionsValue}>
            <PivotTableSizingStateContext.Provider value={stateValue}>
                {children}
            </PivotTableSizingStateContext.Provider>
        </PivotTableSizingActionsContext.Provider>
    );
}

/**
 * @internal
 */
export function usePivotTableSizing(): IPivotTableSizingStateContext {
    const context = useContext(PivotTableSizingStateContext);

    if (context === undefined) {
        throw new Error("usePivotTableSizing must be used within a PivotTableSizingProvider");
    }

    return context;
}

/**
 * @internal
 */
export function usePivotTableSizingActions(): IPivotTableSizingActionsContext {
    const context = useContext(PivotTableSizingActionsContext);

    if (context === undefined) {
        throw new Error("usePivotTableSizingActions must be used within a PivotTableSizingProvider");
    }

    return context;
}
