// (C) 2019 GoodData Corporation
import React, { createContext, useContext, useMemo } from "react";
import noop from "lodash/noop.js";

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
    children: React.ReactNode;
}

/**
 * @internal
 */
export function DashboardEventsProvider(props: IDashboardEventsProvider): JSX.Element {
    const { children, registerHandler, unregisterHandler } = props;
    const value = useMemo(() => {
        return {
            registerHandler,
            unregisterHandler,
        };
    }, [registerHandler, unregisterHandler]);
    return <DashboardEventsContext.Provider value={value}>{children}</DashboardEventsContext.Provider>;
}
