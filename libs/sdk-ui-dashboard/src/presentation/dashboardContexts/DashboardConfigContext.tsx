// (C) 2021 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IMenuButtonConfiguration } from "../topBar/types.js";

interface IDashboardConfigContext {
    menuButtonConfig: IMenuButtonConfiguration | undefined;
    children?: React.ReactNode;
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
export const DashboardConfigProvider: React.FC<IDashboardConfigContext> = (props) => {
    const { children, ...components } = props;
    return <DashboardConfigContext.Provider value={components}>{children}</DashboardConfigContext.Provider>;
};
