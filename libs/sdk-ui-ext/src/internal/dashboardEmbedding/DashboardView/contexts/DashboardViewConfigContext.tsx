// (C) 2020 GoodData Corporation
import React from "react";
import { IDashboardViewConfig } from "../types";

const DashboardViewConfigContext = React.createContext<IDashboardViewConfig | undefined>(undefined);
DashboardViewConfigContext.displayName = "DashboardViewConfigContext";

/**
 * @internal
 */
export interface IDashboardViewConfigProviderProps {
    config: IDashboardViewConfig;
}

/**
 * @internal
 */
export const DashboardViewConfigProvider: React.FC<IDashboardViewConfigProviderProps> = ({
    children,
    config,
}) => {
    return (
        <DashboardViewConfigContext.Provider value={config}>{children}</DashboardViewConfigContext.Provider>
    );
};

/**
 * @internal
 */
export const useDashboardViewConfig = (): IDashboardViewConfig | undefined => {
    return React.useContext(DashboardViewConfigContext);
};
