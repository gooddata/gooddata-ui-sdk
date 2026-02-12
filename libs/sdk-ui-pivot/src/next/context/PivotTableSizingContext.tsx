// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

type IPivotTableSizingContext = {
    containerWidth: number;
    setContainerWidth: (width: number) => void;
    autoSizeInitialized: boolean;
    setAutoSizeInitialized: (value: boolean) => void;
};

const PivotTableSizingContext = createContext<IPivotTableSizingContext | undefined>(undefined);

/**
 * @internal
 */
export function PivotTableSizingProvider({ children }: { children: ReactNode }) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [autoSizeInitialized, setAutoSizeInitialized] = useState(false);

    const value = useMemo<IPivotTableSizingContext>(
        () => ({
            containerWidth,
            setContainerWidth,
            autoSizeInitialized,
            setAutoSizeInitialized,
        }),
        [containerWidth, autoSizeInitialized],
    );

    return <PivotTableSizingContext.Provider value={value}>{children}</PivotTableSizingContext.Provider>;
}

/**
 * @internal
 */
export function usePivotTableSizing(): IPivotTableSizingContext {
    const context = useContext(PivotTableSizingContext);

    if (context === undefined) {
        throw new Error("usePivotTableSizing must be used within a PivotTableSizingProvider");
    }

    return context;
}
