// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

import { type AgGridApi } from "../types/agGrid.js";

// NOTE: Keep this context **AG Grid API-only**.
type IAgGridApiContext = {
    agGridApi: AgGridApi | null;
    setAgGridApi: (api: AgGridApi | null) => void;
};

const AgGridApiContext = createContext<IAgGridApiContext | undefined>(undefined);

/**#
 * @internal
 */
export function AgGridApiProvider({ children }: { children: ReactNode }) {
    const [agGridApi, setAgGridApi] = useState<AgGridApi | null>(null);

    const value = useMemo<IAgGridApiContext>(
        () => ({
            agGridApi,
            setAgGridApi,
        }),
        [agGridApi],
    );

    return <AgGridApiContext.Provider value={value}>{children}</AgGridApiContext.Provider>;
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
