// (C) 2019-2025 GoodData Corporation

import { ReactElement, ReactNode, createContext, useContext, useMemo } from "react";

import { noop } from "lodash-es";

import { DashboardEventHandler } from "../eventHandlers/eventHandler.js";

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
    registerHandler: noop,
    unregisterHandler: noop,
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
export function DashboardEventsProvider(props: IDashboardEventsProvider): ReactElement {
    const { children, registerHandler, unregisterHandler } = props;
    const value = useMemo(() => {
        return {
            registerHandler,
            unregisterHandler,
        };
    }, [registerHandler, unregisterHandler]);
    return <DashboardEventsContext.Provider value={value}>{children}</DashboardEventsContext.Provider>;
}
