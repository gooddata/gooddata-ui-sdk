// (C) 2025 GoodData Corporation
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { IInitialExecutionData } from "../types/internal.js";

const InitialExecutionContextContext = createContext<IInitialExecutionData | undefined>(undefined);

/**
 * @internal
 */
export function InitialExecutionContextProvider({
    children,
    initialExecutionResult,
    initialDataView,
}: IInitialExecutionData & { children: ReactNode }) {
    const context = useMemo(() => {
        return {
            initialExecutionResult,
            initialDataView,
        };
    }, [initialExecutionResult, initialDataView]);

    return (
        <InitialExecutionContextContext.Provider value={context}>
            {children}
        </InitialExecutionContextContext.Provider>
    );
}

/**
 * @internal
 */
export function useInitialExecution(): IInitialExecutionData {
    const context = useContext(InitialExecutionContextContext);

    if (context === undefined) {
        throw new Error("useInitialExecution must be used within a InitialExecutionContextProvider");
    }

    return context;
}
