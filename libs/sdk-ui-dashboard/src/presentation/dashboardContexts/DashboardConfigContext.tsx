// (C) 2021-2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type IMenuButtonConfiguration } from "../topBar/menuButton/types.js";

interface IDashboardConfigContext {
    menuButtonConfig: IMenuButtonConfiguration | undefined;
    children?: ReactNode;
}

const DashboardConfigContext = createContext<IDashboardConfigContext>({
    menuButtonConfig: {},
});
DashboardConfigContext.displayName = "DashboardConfigContext";

/**
 * Context for all the dashboard level configuration of the presentation components.
 * @alpha
 */
export const useDashboardConfigContext = (): IDashboardConfigContext => {
    return useContext(DashboardConfigContext);
};

/**
 * @internal
 */
export function DashboardConfigProvider({ children, ...components }: IDashboardConfigContext) {
    return <DashboardConfigContext.Provider value={components}>{children}</DashboardConfigContext.Provider>;
}
