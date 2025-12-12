// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Initial execution context data
 *
 * @internal
 */
export interface IInitialExecutionContext {
    /**
     * Initial data view facade for easy data access
     */
    initialDataView: DataViewFacade | null;
}

/**
 * Context for providing initial execution result and data view
 *
 * @internal
 */
const InitialExecutionContext = createContext<IInitialExecutionContext | undefined>(undefined);

/**
 * Provider for initial execution context
 *
 * @remarks
 * This context provides access to the initial execution result and data view
 * throughout the component tree. It's created after successful data fetching
 * and before rendering the map visualization.
 *
 * The context value is deeply memoized to prevent unnecessary re-renders.
 *
 * @internal
 */
export function InitialExecutionContextProvider({
    initialDataView,
    children,
}: IInitialExecutionContext & { children: ReactNode }) {
    return (
        <InitialExecutionContext.Provider value={{ initialDataView }}>
            {children}
        </InitialExecutionContext.Provider>
    );
}

/**
 * Hook to access initial execution context
 *
 * @remarks
 * Returns the initial execution result and data view. These values are
 * available after successful data fetching and remain stable throughout
 * the component lifecycle.
 *
 * @returns Initial execution result and data view
 * @throws Error if used outside InitialExecutionContextProvider
 *
 * @internal
 */
export function useInitialExecution(): IInitialExecutionContext {
    const context = useContext(InitialExecutionContext);

    if (context === undefined) {
        throw new Error("useInitialExecution must be used within InitialExecutionContextProvider");
    }

    return context;
}
