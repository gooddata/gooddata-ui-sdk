// (C) 2025 GoodData Corporation
import { createContext, useContext, useState, ReactNode } from "react";
import { DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Context for sharing table metadata between data source and other components
 * @internal
 */
interface ITableMetadataContext {
    currentDataView: DataViewFacade | null;
    setCurrentDataView: (dataView: DataViewFacade | null) => void;
}

const TableMetadataContext = createContext<ITableMetadataContext | undefined>(undefined);

/**
 * Provider for table metadata context
 * @internal
 */
export function TableMetadataProvider({ children }: { children: ReactNode }) {
    const [currentDataView, setCurrentDataView] = useState<DataViewFacade | null>(null);

    return (
        <TableMetadataContext.Provider
            value={{
                currentDataView,
                setCurrentDataView,
            }}
        >
            {children}
        </TableMetadataContext.Provider>
    );
}

/**
 * Hook to access table metadata context
 * @internal
 */
export function useTableMetadata(): ITableMetadataContext {
    const context = useContext(TableMetadataContext);
    if (context === undefined) {
        throw new Error("useTableMetadata must be used within a TableMetadataProvider");
    }
    return context;
}
