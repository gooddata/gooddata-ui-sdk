// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext, useState } from "react";

import { type DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Context for sharing last loaded data view between data source and other components.
 *
 * @internal
 */
interface ICurrentDataViewContext {
    currentDataView: DataViewFacade | undefined;
    setCurrentDataView: (dataView: DataViewFacade | undefined) => void;
}

const CurrentDataViewContext = createContext<ICurrentDataViewContext | undefined>(undefined);

/**
 * Provider for last loaded data view.
 *
 * @internal
 */
export function CurrentDataViewProvider({ children }: { children: ReactNode }) {
    const [currentDataView, setCurrentDataView] = useState<DataViewFacade | undefined>(undefined);

    return (
        <CurrentDataViewContext.Provider
            value={{
                currentDataView,
                setCurrentDataView,
            }}
        >
            {children}
        </CurrentDataViewContext.Provider>
    );
}

/**
 * Hook to access last loaded data view.
 *
 * @internal
 */
export function useCurrentDataView(): ICurrentDataViewContext {
    const context = useContext(CurrentDataViewContext);
    if (context === undefined) {
        throw new Error("useCurrentDataView must be used within a DataViewProvider");
    }
    return context;
}
