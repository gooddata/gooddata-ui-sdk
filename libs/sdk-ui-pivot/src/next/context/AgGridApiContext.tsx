// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { type AgGridApi } from "../types/agGrid.js";

type IAgGridApiContext = {
    agGridApi: AgGridApi | null;
    setAgGridApi: (api: AgGridApi | null) => void;
    containerWidth: number;
    setContainerWidth: (width: number) => void;
    autoSizeInitialized: boolean;
    setAutoSizeInitialized: (value: boolean) => void;
};

const AgGridApiContext = createContext<IAgGridApiContext | undefined>(undefined);

/**#
 * @internal
 */
export function AgGridApiProvider({ children }: { children: ReactNode }) {
    const [agGridApi, setAgGridApi] = useState<AgGridApi | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [autoSizeInitialized, setAutoSizeInitialized] = useState(false);

    return (
        <AgGridApiContext.Provider
            value={{
                agGridApi,
                setAgGridApi,
                containerWidth,
                setContainerWidth,
                autoSizeInitialized,
                setAutoSizeInitialized,
            }}
        >
            {children}
        </AgGridApiContext.Provider>
    );
}

/**
 * @internal
 */
export function useAgGridApi(): IAgGridApiContext {
    const context = useContext(AgGridApiContext);

    if (context === undefined) {
        throw new Error("useAgGridApi must be used within a AgGridApiProvider");
    }

    return context;
}
