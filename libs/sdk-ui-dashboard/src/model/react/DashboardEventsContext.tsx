// (C) 2019-2025 GoodData Corporation

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from "react";

import { type DashboardEventHandler } from "../eventHandlers/eventHandler.js";

/**
 * @alpha
 */
export interface IDashboardEventsContext {
    registerHandler: (handler: DashboardEventHandler) => void;
    unregisterHandler: (handler: DashboardEventHandler) => void;
}

/**
 * @alpha
 */
const DashboardEventsContext = createContext<IDashboardEventsContext>({
    registerHandler: () => {},
    unregisterHandler: () => {},
});
DashboardEventsContext.displayName = "DashboardEventsContext";

/**
 * @alpha
 */
export const useDashboardEventsContext = (): IDashboardEventsContext => useContext(DashboardEventsContext);

/**
 * @internal
 */
export interface IDashboardEventsProvider extends IDashboardEventsContext {
    children: ReactNode;
}

/**
 * @internal
 */
export function DashboardEventsProvider({
    children,
    registerHandler,
    unregisterHandler,
}: IDashboardEventsProvider): ReactElement {
    const value = useMemo(() => {
        return {
            registerHandler,
            unregisterHandler,
        };
    }, [registerHandler, unregisterHandler]);
    return <DashboardEventsContext.Provider value={value}>{children}</DashboardEventsContext.Provider>;
}
