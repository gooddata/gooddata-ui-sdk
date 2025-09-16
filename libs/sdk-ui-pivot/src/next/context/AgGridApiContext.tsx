// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useState } from "react";

import { AgGridApi } from "../types/agGrid.js";

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

    return (
        <AgGridApiContext.Provider value={{ agGridApi, setAgGridApi }}>{children}</AgGridApiContext.Provider>
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
